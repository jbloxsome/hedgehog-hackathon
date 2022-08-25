async function main() {
  const Hedgehog = await ethers.getContractFactory("Hedgehog");

  // Start deployment, returning a promise that resolves to a contract object
  const hedgehog = await Hedgehog.deploy();   
  console.log("Contract deployed to address:", hedgehog.address);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });
