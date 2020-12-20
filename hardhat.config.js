require('dotenv').config();
const data = require('./data.json');
const ethers = require('ethers');
const { cyan, gray, green } = require('chalk');

const providerUrl = process.env.PROVIDER;

function hexToNumber(hex) {
  return ethers.utils.formatEther(
    ethers.BigNumber.from(hex)
  );
}

task('unicheck', 'Checks if an account/s can claim UNI rewards')
  .addPositionalParam('accounts', 'Comma separated list of accounts to check for UNI rewards to claim')
  .setAction(async (taskArguments) => {
    console.log(cyan('UNI Merkle Tree:'));
    console.log(gray(`  > Merkle root: ${data.merkleRoot}`));
    console.log(gray(`  > Tokens to claim: ${hexToNumber(data.tokenTotal)}`));
    console.log(gray(`  > Accounts that can claim: ${Object.keys(data.claims).length}`));

    const accounts = taskArguments.accounts.split(',');
    for (let i = 0; i < accounts.length; i++) {
      const account = ethers.utils.getAddress(accounts[i]);
      console.log(cyan(`Checking account ${account}`));

      const entry = data.claims[account];
      if (entry) {
        console.log(gray('  > Account *could* claim UNI...'));
        // console.log(entry);

        const amount = hexToNumber(entry.amount);

        const provider = providerUrl ?
          new ethers.providers.JsonRpcProvider(process.env.PROVIDER) :
          ethers.getDefaultProvider();

        console.log(gray(`  > Querying TokenDistributor.isClaimed(${account})...`));
        const TokenDistributor = new ethers.Contract(
          '0x090d4613473dee047c3f2706764f49e0821d256e',
          require('./abis/TokenDistributor.json'),
          provider
        );

        const isClaimed = await TokenDistributor.isClaimed(entry.index);
        if (isClaimed) {
          console.log(gray(`  > Account has already claimed ${amount} UNI`));
        } else {
          console.log(green(`  > Account has ${amount} UNI to claim!`));
        }
      } else {
        console.log(gray('  > Account has no UNI to claim :('));
      }
    }
  });

module.exports = {
  solidity: '0.7.3',
  networks: {
    hardhat: {
      forking: {
        url: providerUrl,
      }
    }
  }
};

