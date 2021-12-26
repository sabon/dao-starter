import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule("0xd9deA3a94429F8B67526c2f0D2FefDAE9EA7293A");

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    // Specify conditions
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 23_000,
      maxQuantityPerTransaction: 1
    });

    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log("✅ Sucessfully set claim condition!");
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})();
