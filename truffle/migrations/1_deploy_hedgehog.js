// SPDX-License-Identifier: NONE
const HedgehogToken = artifacts.require("Hedgehog");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(HedgehogToken);
  await HedgehogToken.deployed();
};