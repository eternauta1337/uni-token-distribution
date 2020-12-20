require('dotenv').config();
const data = require('./data.json');
const ethers = require('ethers');
const { cyan, gray, green } = require('chalk');

function hexToNumber(hex) {
  return parseFloat(ethers.utils.formatEther(
    ethers.BigNumber.from(hex)
  ));
}

task('unicheck', 'Checks if an account/s can claim UNI rewards')
  .addPositionalParam('accounts', 'Comma separated list of accounts to check for UNI rewards to claim')
  .setAction(async (taskArguments) => {
    const providerUrl = process.env.PROVIDER;
    const provider = providerUrl ?
      new ethers.providers.JsonRpcProvider(providerUrl) :
      ethers.getDefaultProvider();

    console.log(cyan('UNI Merkle Tree:'));
    console.log(gray(`  > Merkle root: ${data.merkleRoot}`));
    console.log(gray(`  > Tokens to claim: ${hexToNumber(data.tokenTotal)}`));
    console.log(gray(`  > Accounts that can claim: ${Object.keys(data.claims).length}`));
    console.log('\n');

    let accounts = taskArguments.accounts;
    if (accounts === ',') {
      accounts = Object.keys(data.claims).join(',');
    }

    accounts = accounts.split(',');
    console.log(gray(`  > Checking ${accounts.length} accounts...`));
    console.log(gray(`  > Using provider: ${providerUrl ? providerUrl : 'Ethers fallback provider'}`));
    console.log('\n');

    let toBeClaimed = hasBeenClaimed = canClaim = haveClaimed = 0;
    const num = accounts.length;
    for (let i = 0; i < num; i++) {
      const account = ethers.utils.getAddress(accounts[i]);
      console.log(cyan(`Checking account ${i} of ${num} ${account}`));

      const entry = data.claims[account];
      if (entry) {
        const amount = hexToNumber(entry.amount);

        console.log(gray(`  > Account *could* claim ${amount} UNI...`));
        // console.log(entry);

        console.log(gray(`  > Querying TokenDistributor.isClaimed(${entry.index})...`));
        const TokenDistributor = new ethers.Contract(
          '0x090d4613473dee047c3f2706764f49e0821d256e',
          require('./abis/TokenDistributor.json'),
          provider
        );

        const isClaimed = await TokenDistributor.isClaimed(entry.index);
        if (isClaimed) {
          console.log(gray(`  > Account has already claimed ${amount} UNI`));

          haveClaimed++;
          hasBeenClaimed += amount;
        } else {
          console.log(green(`  > Account has ${amount} UNI to claim!`));

          canClaim++;
          toBeClaimed += amount;
        }
      } else {
        console.log(gray('  > Account has no UNI to claim :('));
      }
      console.log(gray(`  > ${canClaim} accounts can claim ${toBeClaimed} UNI`));
      console.log(gray(`  > ${haveClaimed} accounts have claimed ${hasBeenClaimed} UNI`));
    }
  });

module.exports = {
  solidity: '0.7.3',
};

