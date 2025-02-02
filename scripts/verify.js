const fs = require("fs");
const { execSync } = require("child_process");
const { network  } = require("hardhat");

/**
 * Функция универсальная, данные для верификации читает из файла.
 */
async function verify() {
    const networkName = network.name;

    if (!fs.existsSync("scripts/deployment.json")) {
        console.error("Error: deployment.json not found. Run `npm run deploy` first.");
        process.exit(1);
    }

    const deploymentData = JSON.parse(fs.readFileSync("scripts/deployment.json"));
    const { contractAddress, ...argsObject } = deploymentData;
    const args = Object.values(argsObject).map(arg =>
        typeof arg === "string" ? `"${arg}"` : arg
    );
    console.log("Args: " + args.join(" "));

    console.log(`Verifying contract: ${contractAddress} in ${networkName} network`);
    try {
        let command = `npx hardhat verify --network ${networkName} ${contractAddress} ${args.join(" ")}`;
        execSync(
            command,
            { stdio: "inherit" }
        );
        console.log("Contract verified successfully!");
    } catch (error) {
        console.error("Verification failed:", error);
    }
}

verify()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
