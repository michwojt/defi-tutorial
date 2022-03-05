# defi-tutorial

Repository was cloned from Dapp University https://github.com/dappuniversity/defi_tutorial. Here are my additions: 

1. Allowing adding interest which is reflected in staking balance and number of tokens. Interest is added after one year of staking, rate of interest can be defined by owner of a token farm.

2. Creating Java Script test which checks if interest is added properly after 1 day, 364 days and 400 days of staking.

To run a test you need to install test-helpers and test-environment from OpenZeppelin and replace default artifacts directory https://forum.openzeppelin.com/t/contract-fromartifact-path-on-environment/2107. 

Moreover use ^0.8.0 Solidity compiler.
