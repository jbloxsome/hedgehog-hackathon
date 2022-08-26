import { useState, useEffect } from "react";
import { useMetaMask } from "metamask-react";
import Web3 from "web3";

function Account({ contract }) {

  const creator = '';
  const contractAddress = '';

  const web3 = new Web3("http://127.0.0.1:7545");

  const [error, setError] = useState(undefined);
  const [resp, setResp] = useState(undefined);
  const [ethBalance, setEthBalance] = useState(0);
  const [hhBalance, setHhbalance] = useState(0);

  const { status, connect, account, chainId, ethereum } = useMetaMask();

  useEffect(() => {
    if (account) {
        async function loadAccountBalance() {
            const balance = web3.utils.fromWei(await web3.eth.getBalance(account));
            setEthBalance(balance);
        }
        loadAccountBalance();
    }
  }, [account, web3.eth, web3.utils]);

  useEffect(() => {
    if (account) {
        async function loadAccountBalance() {
            const balance = web3.utils.fromWei(await contract.methods.balanceOf(account).call());
            setHhbalance(balance);
        }
        loadAccountBalance();
    }
  }, [contract, account, web3.eth, web3.utils]);

  function send() {
    contract.methods
        .transfer('0x7Ec6a39578a70a9E112fa186e395208706cCd52F', web3.utils.toWei('1'))
        .send({ from: account })
        .then(res => setResp(res))
        .catch(err => setError(err.message));
  }

  function activate() {
    contract.methods
        .activate()
        .send({ from: account })
        .then(res => setResp(res))
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
        { status === 'connected' && (
            <button onClick={send}>Send Tokens</button>
        )}
        { status === 'connected' && (
            <button onClick={activate}>Activate Tokens</button>
        )}
        <p>{ error }</p>
        <p>{ JSON.stringify(resp) }</p>
      </div>
  );
}

export default Account;
