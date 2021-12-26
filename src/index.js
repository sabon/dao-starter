import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// Import ThirdWeb
import { ThirdwebWeb3Provider } from "@3rdweb/hooks";

// Chain:
// 4 = Rinkeby
const supportedChainIds = [4];

// Type of wallet.
// In this case, Metamask, which is an injected wallet.
const connectors = {
  injected: {}
};

// Finally, wrap App with ThirdwebWeb3Provider.
ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider connectors={connectors} supportedChainIds={supportedChainIds}>
      <div className="landing">
        <App />
      </div>
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
