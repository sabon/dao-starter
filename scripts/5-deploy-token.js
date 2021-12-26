import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x53D33E70bd672f2A8643A08b65e124BE127d8990");

(async () => {
  try {
    // Deploy a standard ERC-20 contract
    const tokenModule = await app.deployTokenModule({
      gasLimit: 300000,
      // Token name
      name: "SharkDAO Governance Token",
      // Token symbol
      symbol: "SHARK"
    });
    console.log("✅ Successfully deployed token module, address:", tokenModule.address);
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();
