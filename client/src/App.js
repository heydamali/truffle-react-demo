import './App.css';
import { useEffect, useState} from 'react';
import {ethers} from 'ethers';
import { parseEther, formatEther} from '@ethersproject/units';
import Auction from './contracts/Auction.json';

const AuctionContractAddress = '0x70De92caDDD83560d277E52F67b298d80B06FFc7';
const emptyAddress = '0x0000000000000000000000000000000000000000';

function App() {
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState('');

  async function initializeProvider() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(AuctionContractAddress, Auction.abi, signer);
     
  }

  async function requestAccount() {
    const account = await window.ethereum.request({method: 'eth_requestAccounts'});
    setAccount(account[0]);
    console.log('success fetching account: ', account[0]);
  }

  async function fetchHighestBid() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        const highestBid = await contract.fetchHighestBid();
        const {bidAmount, bidder} = highestBid;
        setHighestBid(parseFloat(formatEther(bidAmount.toString())).toPrecision(4));
        setHighestBidder(bidder.toLowerCase());
        console.log('success fetching highest bid: ', highestBid);
      } catch (e) {
        console.log('error fetching highest bid: ', e);
      }
    }
  }

  async function fetchMyBid() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        const myBid = await contract.bids(account);
        setMyBid(parseFloat(formatEther(myBid.toString())).toPrecision(4));
        console.log('success fetching my bid: ', myBid);
      } catch (e) {
        console.log('error fetching my bid: ', e);
      }
    }
  }

  async function submitHandler(event) {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        const wei = parseEther(amount);
        await contract.makeBid({value: wei });
        console.log('success making bid.')
        contract.on('LogBid', (_, __) => {
          fetchMyBid();
          fetchHighestBid();
        })
      } catch (e) {
        console.log('error making bid: ', e);
      }
    }
  }

  useEffect(() => {
    requestAccount();
  }, []);

  useEffect(() => {
    if (account) {
      fetchMyBid();
      fetchHighestBid();
    }
  }, [account])

  return (
    <div style={{textAlign: 'center', width: '50%', margin: '0 auto', marginTop:'100px', paddingBottom: '10px', border: '1px solid black'}}>
      <p>Connected Account: {account}</p>
      <p>My bid: { myBid }</p>
      <p>Auction Highest Bid Amount: { highestBid}</p>
      <p>Auction Highest Bidder: {highestBidder === emptyAddress ? 'null' : highestBidder === account ? 'Me' : highestBidder}</p>
      <form onSubmit={submitHandler}>
        <input value={ amount } onChange={(event) => setAmount(event.target.value)} name="Bid Amount" type="number" placeholder="Enter Bid Amount" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
