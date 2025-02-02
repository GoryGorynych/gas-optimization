const fs = require("fs");
const { ethers, network  } = require("hardhat");

// ************ Сonfiguration block ************ //

//Contract for deploying
const deployContract = "RawLottery";

//Arguments for contract constructor
const name = "\"Dummy Lottery\"";
const winnerPercent = 60;
const minParticipants = 2;
//Require fill the args with arguments if any
const args = [name, winnerPercent, minParticipants];

//Deployer index for signers
const deployerIdx = 1;

// ******************************************* //


/**
 * Функция универсальная, не требуется изменять данные для деплоя.
 */
async function deploy() {
    console.log(`Deploying to network: ${network.name}`);

    const signers = await ethers.getSigners();

    const EOA = signers[deployerIdx];
    const deployer = await EOA.getAddress();
    console.log("EOA is:", deployer);

    console.log(`1. Deploying contract... arguments: ${args.join(" ")}`);

    const factory = await ethers.getContractFactory(deployContract);
    const contractInstance = await factory.connect(EOA).deploy(...args);
    const result = await contractInstance.waitForDeployment();

    const contractAddress = await contractInstance.getAddress();
    console.log("Contract deployed:", deployContract);
    console.log("Contract address:", contractAddress);
    console.log("Transaction:", result.deploymentTransaction()?.hash);

    // Сохранение данных для верификации
    const deploymentData = {
        contractAddress,
        ...Object.fromEntries(args.map((value, index) => [`arg${index + 1}`, value]))
    };
    
    fs.writeFileSync("scripts/deployment.json", JSON.stringify(deploymentData, null, 2));
    console.log("Deployment data saved to deployment.json");

    console.log("Run `npm run verify` to verify the contract.");
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
