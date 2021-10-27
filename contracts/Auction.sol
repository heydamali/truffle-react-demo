// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract Auction {
  address private owner;
  uint256 public startTime;
  uint256 public endTime;
  uint256 public highestBid;
  address public highestBidder;

  // Properties
  struct House {
    string houseType;
    string houseColor;
    string houseLocation;
  }

  House public newHouse;
  address[] public bidders;
  mapping(address => uint256) public bids;

  // Modifiers
  modifier isOngoing() {
    require(block.timestamp < endTime, 'This auction is closed.');
    _;
  }
  modifier notOngoing() {
    require(block.timestamp >= endTime, 'This auction is still open.');
    _;
  }
  modifier isOwner() {
    require(msg.sender == owner, 'Only owner can perform task.');
    _;
  }
  modifier notOwner() {
    require(msg.sender != owner, 'Owner is not allowed to bid.');
    _;
  }

  // Events
  event LogBid(address indexed _highestBidder, uint256 _highestBid);
  event LogWithdrawal(address indexed _withdrawer, uint256 amount);

  constructor () {
    owner = msg.sender;
    startTime = block.timestamp;
    endTime = block.timestamp * 1 hours;
    newHouse.houseColor = '#FFFFFF';
    newHouse.houseLocation = 'Lagos, Nigeria';
    newHouse.houseType = 'Duplex';
  }

  function makeBid() public payable isOngoing() notOwner() returns (bool) {
    uint256 bidAmount = bids[msg.sender] + msg.value;
    require(bidAmount > highestBid, 'Bid error: Make a higher Bid.');

    highestBidder = msg.sender;
    highestBid = msg.value;
    bidders.push(msg.sender);
    bids[msg.sender] = bidAmount;

    emit LogBid(msg.sender, highestBid);
    return true;
  }

  function withdraw() public notOngoing() isOwner() returns (bool) {
    uint256 amount = bids[msg.sender];
    
    bids[msg.sender] = 0;
    (bool success, ) = msg.sender.call{ value: amount }("");
    require(success, 'Withdrawal failed.');

    emit LogWithdrawal(msg.sender, amount);
    return true;
  }
}
