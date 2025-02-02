require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-contract-sizer");


const ALCHEMY_API_KEY_MAINNET = process.env.ALCHEMY_API_KEY_MAINNET;
const ALCHEMY_API_KEY_SEPOLIA = process.env.ALCHEMY_API_KEY_SEPOLIA;
const ALCHEMY_API_KEY_MATIC = process.env.ALCHEMY_API_KEY_MATIC;
const ALCHEMY_API_KEY_AMOY = process.env.ALCHEMY_API_KEY_AMOY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
let TESTNET_MNEMONIC = process.env.TESTNET_MNEMONIC; //Файл .env должен содержать кавычки вокруг мнемоники

const accounts = {
    mnemonic: TESTNET_MNEMONIC,
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 20,
};

if (!TESTNET_MNEMONIC) {
    // Generated with bip39
    accounts.mnemonic = "velvet deliver grief train result fortune travel voice over subject subject staff nominee bone name";
    accounts.accountsBalance = "200000000000000000000000000";
}


module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000000,
                    },
                    evmVersion: "cancun"
                },
            }
        ]
    },
    networks: {
        local: {
            url: "http://localhost:8545",
        },
        hardhat: {
            allowUnlimitedContractSize: true
        },
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY_SEPOLIA}`,
            accounts: accounts,
            chainId: 11155111
        },
        mainnet: {
            url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_MAINNET}`,
            accounts: accounts,
            chainId: 1,
        },
        polygon: {
            url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_MATIC}`,
            accounts: accounts,
            chainId: 137,
        },
        polygonAmoy: {
            url: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY_AMOY}`,
            accounts: accounts,
            chainId: 80002
        },
    },
    etherscan: {
        customChains: [
            {
                network: "polygonAmoy",
                chainId: 80002,
                urls: {
                    apiURL: "https://api-amoy.polygonscan.com/api",
                    browserURL: "https://amoy.polygonscan.com/"
                }
            },
        ],
        apiKey: {
            mainnet: ETHERSCAN_API_KEY,
            sepolia: ETHERSCAN_API_KEY,
            polygon: POLYGONSCAN_API_KEY,
            polygonAmoy: POLYGONSCAN_API_KEY,
        }
    },
    gasReporter: {
        enabled: true,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            sepolia: 1
        },
        otherUser:2
    }
};