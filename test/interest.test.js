const { accounts, contract } = require('@openzeppelin/test-environment');
const { time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const [owner, investor] = accounts;
const DaiToken = contract.fromArtifact('DaiToken');
const DappToken = contract.fromArtifact('DappToken');
const TokenFarm = contract.fromArtifact('TokenFarm')
const BokkyPooBahsDateTimeContract = contract.fromArtifact('BokkyPooBahsDateTimeContract');


function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

let oneDayBalance, expectedBalance, startTime, rate_counter, rate_divider, result
//Variables used in test. Assumes that initial balance is 100 and interest rate 50%
oneDayBalance = '100';
expectedBalance = '150';
rate_counter=50;
rate_divider=100;

describe('TestingInterest', function () {
  this.timeout(0); 

  before(async function (){
    startTime = await time.latest();
	
	// Load Contracts
    this.daiToken = await DaiToken.new({ from: owner });
    this.dappToken = await DappToken.new();
    this.bokkyPooBahsDateTimeContract = await BokkyPooBahsDateTimeContract.new();
    this.tokenFarm = await TokenFarm.new(this.dappToken.address, this.daiToken.address, this.bokkyPooBahsDateTimeContract.address,{ from: owner });

    // Transfer all Dapp tokens to farm (1 million)
    await this.dappToken.transfer(this.tokenFarm.address, tokens('1000000'))

    // Send 100 tokens to investor
    await this.daiToken.transfer(investor, 100, { from: owner });
  }); 

  describe('Token farm - add interest', function () {
    it('Add interest after one day', async function () {
      // Stake Mock DAI Tokens
      await this.daiToken.approve(this.tokenFarm.address, 100, { from: investor })
      await this.tokenFarm.stakeTokens(100, { from: investor })
	  
      // Issue Tokens
      await this.tokenFarm.issueTokens({ from: owner })
	    //Increase time by one day
	    await time.increaseTo(startTime.add(time.duration.days(1)));
      //Add interest after one day
      await this.tokenFarm.addInterest(rate_counter, rate_divider, { from: owner });
      //Check staking balance after one day, should still be 100
      result = await this.tokenFarm.stakingBalance(investor);
      expect(result.toString()).to.equal(oneDayBalance);
    });

    //Check balance for dapp tokens after 1 day, should still be 100
    it('Add tokens after one day', async function () {
      result = await this.dappToken.balanceOf(investor);
      expect(result.toString()).to.equal(oneDayBalance);   
    });

    it('Add interest after 364 days', async function () {
	    //Increase time by 364 days
	    await time.increaseTo(startTime.add(time.duration.days(364)));
      //Add interest after 364 days
      await this.tokenFarm.addInterest(rate_counter, rate_divider, { from: owner });
      //Check staking balance after 364 days, should still be 100
      result = await this.tokenFarm.stakingBalance(investor);
      expect(result.toString()).to.equal(oneDayBalance); 
    });

    //Check balance for dapp tokens after 364 days from start, should still be 100
    it('Add tokens after 364 days', async function () {
      result = await this.dappToken.balanceOf(investor);
      expect(result.toString()).to.equal(oneDayBalance);   
    });

    it('Add interest after 400 days', async function () {
	    //Increase time by 400 days
	    await time.increaseTo(startTime.add(time.duration.days(400)));
      //Add interest after 400 days
      await this.tokenFarm.addInterest(rate_counter, rate_divider, { from: owner });
      //Check staking balance after 400 days, should be now 150
      result = await this.tokenFarm.stakingBalance(investor);
      expect(result.toString()).to.equal(expectedBalance); 
    });

    //Check balance for dapp tokens after 400 days from start,should be now 150
    it('Add tokens after 400 days', async function () {
      result = await this.dappToken.balanceOf(investor);
      expect(result.toString()).to.equal(expectedBalance);   
    });


  });

});