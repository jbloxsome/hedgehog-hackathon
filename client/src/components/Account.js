import { useMetaMask } from "metamask-react";

function Account() {

  const { status, connect, account, chainId, ethereum } = useMetaMask();

  return (
      <div className="Account">
        <p>Account: { account }</p>
        {/* <p>Balance: { ethBalance } ETH</p> */}
        <button onClick={connect}>Connect ETH Account</button>
      </div>
  );
}

export default Account;
