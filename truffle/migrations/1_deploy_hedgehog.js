const Hedgehog = artifacts.require("Hedgehog");

module.exports = function (deployer) {
  deployer.deploy(Hedgehog);
};
