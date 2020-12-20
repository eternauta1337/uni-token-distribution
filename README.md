## UNI Token Distribution

This repo merely contains my own research and interpretation of how Uniswap technically solved its UNI token distribution.

It contains a script that can be used to check if an address or list of addresses can claim UNI.

### Running the script

```
npm install
```

The script requires a data file containing the list of addresses that can claim UNI (and their Merkle proofs). This file is ~360mb, so it needs to be downloaded first. Check data.sample.json to see what it looks like.

```
curl -X GET "https://ipfs.io/ipfs/Qmegj6pV3qvGE8XWfMPdzXCu2sUoNMGtpbL5vYuAkhnJja"
```

Then run the script.

```
npx hardhat unicheck <address-list>
```

### Technical overview

According to an arbitrary set of rules determined by Uniswap, addresses that used the protocol before the distribution date could interact with a TokenDistributor to claim UNI tokens.

Around 253000 addresses have been eligible to claim, with varying amounts.

Storing the list of addresses with their corresponding amounts in the TokenDistributor contract would have been inneficient and expensive, as would querying the contract for eligibility.

Instead, Uniswap constructed a Merkle tree from the addresses and amounts, and produced a JSON file containing Merkle proofs for the eligible addresses.

A Merkle tree is an efficient data structure for determining if an entry or node is part of the data structure. Given a Merkle root and a leaf, a Merkle proof can be provided to evaluate a Merkle root, which can then be compared to the stored Merkle root.

In this case, to prove that an address is white listed, one obtains the Merkle proof from the JSON data. This proof is an array of hashes. The contract hashes the address against these hashes by pairs, until the final node is reached. If this final hash matches the stored Merkle root, then the address belongs to the tree.

It then checks if the address has already claimed. It also does this in an efficient manner. Instead of using a mapping of address to bool, it uses a mapping of uint to uint, using a bit map, effectively minimizing the amount of storage used.

### Resources

* Blog post: https://uniswap.org/blog/uni/
* UNI token: https://etherscan.io/token/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
* Uniswap token distributor contract: https://etherscan.io/address/0x090d4613473dee047c3f2706764f49e0821d256e#writeContract
* Uniswap merkle tree: https://ipfs.io/ipfs/Qmegj6pV3qvGE8XWfMPdzXCu2sUoNMGtpbL5vYuAkhnJja || https://mrkl.uniswap.org
* Uniswap retroactive query: https://github.com/Uniswap/retroactive-query
* "Merkle proofs Explained." https://medium.com/crypto-0-nite/merkle-proofs-explained-6dd429623dc5
* "Manually Claiming UNI Merkle Distribution" https://gov.uniswap.org/t/learn-requirements-how-to-claim-your-400-uni/1025/10
