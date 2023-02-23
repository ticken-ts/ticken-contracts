# ticken-contracts

## Smart Contract

### Requirements

For building the smart contract and regenerating the go bindings.

- Solidity compiler "solc" present in PATH
- Abigen (go-ethereum) "https://geth.ethereum.org/docs/getting-started/installing-geth"

### Build smart contract and go bindings

To compile the smart contract, go to the `infra/public_blockchain/contract` directory and run `npm install`.

Run `npm run build` to compile the smart contract.

Run `npm run abigen` to generate the Go bindings for the smart contract.
