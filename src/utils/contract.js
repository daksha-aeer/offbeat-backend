// src/utils/contract.js
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x1085bfB4DEB7f90aB8760cE9ddF6852b6E43A146";
const CONTRACT_ABI = [
  "function safeMint(address to, string memory uri) public",
  "function pause() public",
  "function unpause() public"
];

export async function mintNFT(recipientAddress, nftId) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_AMOY_URL);
    const signer = new ethers.Wallet(process.env.CONTRACT_OWNER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Map NFT IDs to their metadata URIs
    const metadataURIs = {
      1: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/bafkreigwg2uptjndzk6zorrjsmtibma2oyax3agev5jwiyjjvrpnb6rpi4",
      2: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/bafkreidnwtzoedz4cszxpkjz4cx2pn5xytls3nje6wbe2vj7m2ws3fubyq",
      3: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/bafkreie4l4w7j7cyqfkqlthvvsevt6ohldvgbe4wwqvon367jktguemo7e"
    };

    const tx = await contract.safeMint(recipientAddress, metadataURIs[nftId]);
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.hash,
      tokenId: receipt.logs[0].args[2].toString() // This gets the tokenId from the Transfer event
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}