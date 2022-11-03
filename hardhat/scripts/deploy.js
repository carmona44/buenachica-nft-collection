const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {

    const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
    const metadataURL = METADATA_URL;

    const buenaChicaContract = await ethers.getContractFactory("BuenaChica");
    const deployedBuenaChicaContract = await buenaChicaContract.deploy(metadataURL, whitelistContract);

    console.log("BuenaChica Contract Address:", deployedBuenaChicaContract.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });