import { MetaMaskProvider } from "metamask-react";
import './App.css';
import Account from './components/Account';

function App() {

  return (
    <MetaMaskProvider>
      <Account />
    </MetaMaskProvider>
  );
}

export default App;
