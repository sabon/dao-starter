import sdk from "./1-initialize-sdk.js";

// Grab the app module address
const appModule = sdk.getAppModule("0x53D33E70bd672f2A8643A08b65e124BE127d8990");

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Governance contract name
      name: "SharkDAO's Sharp Proposals",

      // The location of the governance token, the ERC-20 contract
      votingTokenAddress: "0x245926A965938f100860938985B184c1e60Fd9fE",

      // After a proposal is created, when can members start voting?
      // For now, set to immediately
      proposalStartWaitTimeInSeconds: 0,

      // How long do members have to vote on a proposal when it's created?
      // Here, it's 24 hours (86400 seconds)
      proposalVotingTimeInSeconds: 24 * 60 * 60,

      // In order for a proposal to pass, a minimum x% of token must be used in the vote
      votingQuorumFraction: 0,

      // What's the minimum # of tokens a user needs to be allowed to create a proposal?
      // 0 means no tokens are required for a user to be allowed to create a proposal
      minimumNumberOfTokensNeededToPropose: "0"
    });

    console.log("✅ Successfully deployed vote module, address:", voteModule.address);
  } catch (err) {
    console.log("Failed to deploy vote module", err);
  }
})();
