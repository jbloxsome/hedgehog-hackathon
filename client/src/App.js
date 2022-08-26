import { useEffect, useState } from 'react';
import { MetaMaskProvider } from "metamask-react";
import HedgehogContract from "./contracts/Hedgehog.json";
import Web3 from 'web3'
import './App.css';
import Account from './components/Account';

function App() {

  const web3 = new Web3("http://127.0.0.1:7545");

  const [contract, setContract] = useState();

  useEffect(() => {
    async function loadSmartContract() {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = HedgehogContract.networks[networkId];
      const c = new web3.eth.Contract(HedgehogContract.abi, deployedNetwork && deployedNetwork.address);
      setContract(c);
    }
    loadSmartContract();
  }, [web3.eth.contract, web3.eth.net]);

  return (
    <MetaMaskProvider>
      <Account contract={contract} />
    </MetaMaskProvider>
  );
}

export default App;
