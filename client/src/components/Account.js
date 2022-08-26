import { useState, useEffect } from "react";
import HedgehogContract from "../contracts/Hedgehog.json";
import { useMetaMask } from "metamask-react";
import Web3 from "web3";

function Account() {

  window.web3 = new Web3("http://127.0.0.1:7545");
  window.ethereum.enable();

  const [contract, setContract] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [resp, setResp] = useState(undefined);
  const [ethBalance, setEthBalance] = useState(0);
  const [hhBalance, setHhbalance] = useState(0);
  const [contractActive, setContractActive] = useState(false);

  const { status, connect, account, chainId, ethereum } = useMetaMask();

  useEffect(() => {
    async function loadContractActive() {
      contract.methods.isActive().send({
        from: account,
      })
      .then(resp => setContractActive(resp))
      .catch(err => setError(err.message));
    }
    loadContractActive();
  }, [contract]);

  useEffect(() => {
    async function loadSmartContract() {
      const networkId = await window.web3.eth.net.getId();
      const deployedNetwork = HedgehogContract.networks[networkId];
      const c = new window.web3.eth.Contract(HedgehogContract.abi, deployedNetwork && deployedNetwork.address);
      setContract(c);
    }
    loadSmartContract();
  }, []);

  useEffect(() => {
    if (account) {
        async function loadAccountBalance() {
            const balance = window.web3.utils.fromWei(await window.web3.eth.getBalance(account));
            setEthBalance(balance);
        }
        loadAccountBalance();
    }
  }, [account]);

  useEffect(() => {
    if (account) {
        async function loadAccountBalance() {
            const balance = window.web3.utils.fromWei(await contract.methods.balanceOf(account).call());
            setHhbalance(balance);
        }
        loadAccountBalance();
    }
  }, [contract, account]);

  function order() {
    contract.methods.order(1).send({
      from: account,
      value: window.web3.utils.toWei("1", "ether"),  
    })
    .then(resp => setResp(resp))
    .catch(err => setError(err.message));
  }

  // async function send() {
  //     const decimals = window.web3.utils.toBN(18);
  //     const amount = window.web3.utils.toBN(1);  

  //     const tx = {
  //       from: account,
  //       to: '0xDf1C3bc718dea427E2390D266F0eC9e966C52863',
  //       value: window.web3.utils.toWei('1', 'ether'),
  //       data: contract.methods.transfer('0xDf1C3bc718dea427E2390D266F0eC9e966C52863', amount.mul(window.web3.utils.toBN(10).pow(decimals))).encodeABI()
  //     }
       
  //     const txHash = await window.ethereum.request({
  //       method: 'eth_sendTransaction',
  //       params: [tx]
  //     });
  
  //     setResp(txHash);
  // }

  function activate() {
    contract.methods.activate().send({
      from: account
    })
    .then(resp => setResp(resp))
    .catch(err => setError(err.message));
  }

  return (
      <div className="Account">
        <p>Account: { account }</p>
        <p>Status: { status }</p>
        <p>ETH Balance: { ethBalance } ETH</p>
        <p>HH Balance: { hhBalance } HH</p>
        { status === 'notConnected' && (
            <button onClick={connect}>Connect Metamask</button>
        )}
        { status === 'connected' && account === '0x62b444c5fc6233bcdabe382dca8b1bf36092a73a' && (
            <button onClick={activate}>Activate Tokens</button>
        )}
        { status === 'connected' && account !== '0x62b444c5fc6233bcdabe382dca8b1bf36092a73a' && (
            <button onClick={order}>Order Tokens</button>
        )}
        <p>{ error }</p>
        <p>{ JSON.stringify(resp) }</p>
      </div>
  );
}

export default Account;
