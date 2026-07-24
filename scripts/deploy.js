/* eslint-disable no-undef */
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const CharityRegistry = await hre.ethers.getContractFactory("CharityRegistry");
  const contract = await CharityRegistry.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("CharityRegistry deployed to:", address);
  console.log("Owner:", await contract.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

