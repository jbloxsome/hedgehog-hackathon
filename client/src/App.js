import { useEffect, useState } from 'react';
import { MetaMaskProvider, useMetaMask } from "metamask-react";
import HedgehogContract from "./contracts/Hedgehog.json";
import Web3 from 'web3'
import './App.css';
import Account from './components/Account';

function App() {

  const web3 = new Web3("http://127.0.0.1:7545");

  const [account, setAccount] = useState();
  const [ethBalance, setEthBalance] = useState(0);
  const [contract, setContract] = useState();

  useEffect(() => {
    async function loadSmartContract() {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = HedgehogContract.networks[networkId];
      const c = new web3.eth.Contract(HedgehogContract.abi, deployedNetwork && deployedNetwork.address);
      setContract(c);
    }
    loadSmartContract();
  }, []);

  useEffect(() => {
    async function fetchAccounts() {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    }
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (account) {
      async function fetchBalance() {
        const balance = await web3.eth.getBalance(account);
        setEthBalance(web3.utils.fromWei(balance, 'ether'));
      }
      fetchBalance();
    }
  }, [account]);

  return (
    <MetaMaskProvider>
      <div className="App">
        <p>Account: { account }</p>
        <p>Balance: { ethBalance } ETH</p>
      </div>
      <Account />
    </MetaMaskProvider>
  );
}

export default App;
