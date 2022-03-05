const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')
const BokkyPooBahsDateTimeLibrary = artifacts.require('BokkyPooBahsDateTimeLibrary')
const BokkyPooBahsDateTimeContract = artifacts.require('BokkyPooBahsDateTimeContract')

module.exports = async function(deployer, network, accounts) {
  // Deploy Mock DAI Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // Deploy Dapp Token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  // Deploy DateTime Library
  await deployer.deploy(BokkyPooBahsDateTimeLibrary)
  const bokkyPooBahsDateTimeLibrary = await BokkyPooBahsDateTimeLibrary.deployed()
  
  // Deploy DateTime Contract
  await deployer.deploy(BokkyPooBahsDateTimeContract)
  const bokkyPooBahsDateTimeContract = await BokkyPooBahsDateTimeContract.deployed()

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address, bokkyPooBahsDateTimeContract.address)
  const tokenFarm = await TokenFarm.deployed()

  // Transfer all tokens to TokenFarm (1 million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // Transfer 100 Mock DAI tokens to investor
  await daiToken.transfer(accounts[1], '100000000000000000000')
}
