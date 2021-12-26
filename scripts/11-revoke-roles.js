import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule("0x245926A965938f100860938985B184c1e60Fd9fE");

(async () => {
  try {
    // Log the current roles
    console.log("👀 Roles that exist right now:", await tokenModule.getAllRoleMembers());

    // Revoke all the superpowers my wallet had over the ERC-20 contract
    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
    console.log("🎉 Roles after revoking myself", await tokenModule.getAllRoleMembers());
    console.log("✅ Successfully revoked my superpowers from the ERC-20 contract");
  } catch (error) {
    console.error("Failed to revoke myself from the DAO treasury", error);
  }
})();
