# Lottery
Educational project on gas optimization

## Development

### Install the dependencies
The dependency list is managed by the `package.json` file, and the setup parameters are stored in the `hardhat.config.js` file.
Simply run the following command to install the project:
```
npm install
```

### Core components
The contracts, deployment scripts and tests are located in the following folders respectively:
```
contracts
scripts
test
```

### Compile the code and run
Compile the code:
```
npx hardhat compile
```
Run tests with Hardhat:
```
npx hardhat test
```

### Deployment
In order to be able to deploy contracts, copy env file, fill out sensitive data fields and source it:
```
cp env .env
source .env
```

Deploy to the specified network. 
Specify the contract in deploy.js beforehand.
```
npx hardhat run scripts/deploy.js --network sepolia
```
Verify the deployed contract to the specified network
```
npx hardhat run scripts/verify.js --network sepolia
```

### Linters
Run [ESLint](https://eslint.org/) to verify JS code and automatically fix issues:
```
npx eslint . --fix
```
Run [Solhint](https://github.com/protofire/solhint) to verify solidity code:
```
solhint contracts/**
```