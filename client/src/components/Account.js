import { useState, useEffect } from "react";
import HedgehogContract from "../contracts/Hedgehog.json";
import { useMetaMask } from "metamask-react";
import Web3 from "web3";
import { useForm } from "react-hook-form";

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

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = data => {
    contract.methods.add(data.address).send({
      from: account 
    })
    .then(resp => setResp(resp))
    .catch(err => setError(err.message));
  };

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
    setResp(undefined);
    setError(undefined);
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
    contract.methods.order("0xc3451fa2800ba459cd458a59e73e5c28ba22ecc2", 1).send({
      from: account,
      value: window.web3.utils.toWei("1", "ether"),  
    })
    .then(resp => setResp(resp))
    .catch(err => setError(err.message));
  }

  function activate() {
    contract.methods.activate().send({
      from: account
    })
    .then(resp => setResp(resp))
    .catch(err => setError(err.message));
  }

  function deactivate() {
    contract.methods.deactivate().send({
      from: account
    })
    .then(resp => setResp(resp))
    .catch(err => setError(err.message));
  }

  return (
      <div className="Account">
        <h3>Account Details</h3>
        <p>Ethereum Address: { account }</p>
        <p>Status: { status }</p>
        <p>ETH Balance: { ethBalance } ETH</p>
        <p>HH Balance: { hhBalance } HH (These are our Hedgehog tokens)</p>
        { status === 'notConnected' && (
            <button onClick={connect}>Connect Metamask</button>
        )}
        <h3>Functions</h3>
        { status === 'connected' && account === '0xec7aaa40bb5bc2b5666d1d6cc9096d828a136f0b' && (
            <div>
              <h4>Activate/Deactivate Tokens (Contract creator only)</h4>
              <button onClick={activate}>Activate Tokens</button>
              <button onClick={deactivate}>Deactivate Tokens</button>
            </div>
        )}
        { status === 'connected' && (
            <div>
              <h4>Order Tokens (Anyone, but will only succeed for whitelisted)</h4>
              <button onClick={order}>Order Tokens</button>
            </div>
        )}
        { status === 'connected' && account === '0xec7aaa40bb5bc2b5666d1d6cc9096d828a136f0b' && (
            <div>
              <h4>Whitelist an ETH address (Contract creator only, in a production setting this would be called as part of the KYC flow)</h4>
              <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("address", { required: true })} />
                {errors.address && <span>This field is required</span>}
                <input type="submit" />
              </form>
            </div>
        )}
        <p>{ error }</p>
        <p>{ JSON.stringify(resp) }</p>
      </div>
  );
}

export default Account;
