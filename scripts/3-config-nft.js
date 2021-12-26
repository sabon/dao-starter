import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule("0xd9deA3a94429F8B67526c2f0D2FefDAE9EA7293A"); // BundleDrop address from the previous step

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Sharky",
        description: "Sharky NFT will give you access to SharkDAO",
        image: readFileSync("scripts/assets/sharkdao-nft.jpg")
      }
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
