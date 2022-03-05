pragma solidity ^0.8.0;

import "./DappToken.sol";
import "./DaiToken.sol";
import "./BokkyPooBahsDateTimeContract.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;
    BokkyPooBahsDateTimeContract public bokkyPooBahsDateTimeContract;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    //Information when interest when last added for a given staker
    mapping(address => uint) public lastInterestUpdate;

    constructor(DappToken _dappToken, DaiToken _daiToken, BokkyPooBahsDateTimeContract _bokkyPooBahsDateTimeContract) {
        dappToken = _dappToken;
        daiToken = _daiToken;
        bokkyPooBahsDateTimeContract = _bokkyPooBahsDateTimeContract;
        owner = msg.sender;
    }

    function stakeTokens(uint _amount) public {
        // Require amount greater than 0
        require(_amount > 0, "amount cannot be 0");

        // Trasnfer Mock Dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array *only* if they haven't staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        // Add information about date of staking 
        // Information will be used to calculate interest
        lastInterestUpdate[msg.sender] = block.timestamp;

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Unstaking Tokens (Withdraw)
    function unstakeTokens() public {
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require amount greater than 0
        require(balance > 0, "staking balance cannot be 0");

        // Transfer Mock Dai tokens to this contract for staking
        daiToken.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking status
        isStaking[msg.sender] = false;
    }

    // Issuing Tokens
    function issueTokens() public {
        // Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        // Issue tokens to all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }

    //Multiply x by y and divide by z 
    function mulDiv (uint x, uint y, uint z)
    public pure returns (uint) {
    return x * y / z;
    }

    //Add interest to principal based on interest rate presented by 
    // rate_counter and rate_divider. For example 3% rate is counted for rate_counter=3 and
    // rate_divider=100
    function addInterest (uint rate_counter, uint rate_divider) public {
        // Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");
        
        //Add interests for all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            // Fetch staking balance
            uint principal = stakingBalance[recipient];

            // Fetch date of last interest update
            uint currentDate = lastInterestUpdate[recipient];

            //Calculate number of years between now and last interest update
            uint periods = bokkyPooBahsDateTimeContract.diffYears(currentDate,block.timestamp);
            //Function will calculate 1 year too much if interests are added in later part of year 
            //compared to last interest update, hence we need to correct it in that case
            if (bokkyPooBahsDateTimeContract.addYears(lastInterestUpdate[recipient],periods) > block.timestamp){
                periods = periods - 1;
            }

            //Interest can be added only after at least one year since last time
            if (periods > 0) {
                uint balance_updated = principal;
                for (uint j=0; j<periods; j++){
                    balance_updated += mulDiv (balance_updated,rate_counter,rate_divider);
                }
                //Update staking balance 
                stakingBalance[recipient] = balance_updated;
                uint interest = balance_updated - principal;
                //Transfer additional tokens to staker
                dappToken.transfer(recipient, interest);
                //Update date of last interest update
				lastInterestUpdate[recipient] = block.timestamp;
            }
        }
    }
}
