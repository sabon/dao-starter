import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

// Instantiate the sdk on Rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// Grab a reference to the ERC-1155 contract
const bundleDropModule = sdk.getBundleDropModule("0xd9deA3a94429F8B67526c2f0D2FefDAE9EA7293A");
const tokenModule = sdk.getTokenModule("0x245926A965938f100860938985B184c1e60Fd9fE");
const voteModule = sdk.getVoteModule("0xc2F32EEe33b157196505eB0425a64A6dE26229A0");

const App = () => {
  // Use the connectWallet hook from thirdweb
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain
  // Without it we can only read data, not write
  const signer = provider ? provider.getSigner() : undefined;

  // State variable to know if user has our NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets keep a loading state while the NFT is minting
  const [isClaiming, setIsClaiming] = useState(false);

  // Holds the amount of token each member has in state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of the members addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // A function to shorten someone's wallet address, no need to show the whole thing
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // This useEffect grabs all the addresses of the members holding the NFT
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab the users who hold the NFT with tokenId 0
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresess) => {
        console.log("🚀 Members addresses", addresess);
        setMemberAddresses(addresess);
      })
      .catch((err) => {
        console.error("failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  // This useEffect grabs the # of tokens each member holds
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  // Combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, they don't hold any of the token
          memberTokenAmounts[address] || 0,
          18
        )
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // Pass the signer to the sdk, which enables us to interact with the deployed contract
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }
    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address]);

  // Retrieve all the existing proposals from the contract
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to voteModule.getAll() to grab the proposals
    voteModule
      .getAll()
      .then((proposals) => {
        // Set state!
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      })
      .catch((err) => {
        console.error("failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // Check if the user already voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If retrieving the proposals from the useEffect above hasn't finished yet, then we can't check if the user voted yet
    if (!proposals.length) {
      return;
    }

    // Check if the user has already voted on the first proposal
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        console.log("🥵 User has already voted");
      })
      .catch((err) => {
        console.error("failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  if (error && error.name === "UnsupportedChainIdError") {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>This dapp only works on the Rinkeby network, please switch networks in your connected wallet.</p>
      </div>
    );
  }

  // User hasn't connected their wallet to the app
  // Let them call connectWallet
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to SharkDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  // If the user has already claimed their NFT, display the interal DAO page to them
  // Only DAO members will see this
  // Render all the members + token amounts
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🦈 SharkDAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Before doing async things, disable the button to prevent double clicks
                setIsVoting(true);

                // Get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    // Abstain by default
                    vote: 2
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(proposal.proposalId + "-" + vote.type);

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // First make sure the user delegates their token to vote
                try {
                  // Check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // If the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    // If they haven't delegated their tokens yet, have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // Vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // Before voting, first check whether the proposal is open for voting
                        // First get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // Then check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // If it is open for voting, vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // If the proposal is not open for voting, just return nothing, letting continue
                        return;
                      })
                    );
                    try {
                      // If any of the propsals are ready to be executed, execute them
                      // A proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // First get the latest state of the proposal again, since it may have just been voted on before
                          const proposal = await voteModule.get(vote.proposalId);

                          // If the state is in state 4 (meaning that it is ready to be executed), execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // If here - voting was successful, set the "hasVoted" state to true
                      setHasVoted(true);
                      // And log a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // In *either* case set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          // Default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>{vote.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting ? "Voting..." : hasVoted ? "You Already Voted" : "Submit Votes"}
              </button>
              <small>This will trigger multiple transactions that you will need to sign.</small>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet
    bundleDropModule
      .claim("0", 1)
      .catch((err) => {
        console.error("failed to claim", err);
        setIsClaiming(false);
      })
      .finally(() => {
        // Stop loading state.
        setIsClaiming(false);
        // Set claim state.
        setHasClaimedNFT(true);
        // Show user their fancy new NFT
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      });
  };

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free 🦈 SharkDAO Fellowship NFT</h1>
      <button disabled={isClaiming} onClick={() => mintNft()}>
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
