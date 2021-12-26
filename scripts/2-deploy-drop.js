import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("0x53D33E70bd672f2A8643A08b65e124BE127d8990"); // App address from the previous step

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      // The collection's name
      name: "SharkDAO Fellowship",
      description: "A DAO for sharks",
      // The image for the collection that will show up on OpenSea
      image: readFileSync("scripts/assets/shark1.jpg"),
      // Pass in the address of the person who will be receiving the proceeds from sales of nfts in the module
      // If you don't want to charge people for the drop, pass in the 0x0 address
      // Or set it to your own wallet address if you want to charge for the drop
      primarySaleRecipientAddress: ethers.constants.AddressZero
    });

    console.log("✅ Successfully deployed bundleDrop module, address:", bundleDropModule.address);
    console.log("✅ bundleDrop metadata:", await bundleDropModule.getMetadata());
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})();
