// src/utils/contract.js
import { ethers } from 'ethers';

// ABI for the mint function
const CONTRACT_ABI = [
  "function safeMint(address to, string memory uri) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)"
];

// Contract address on your network (e.g., Mumbai testnet)
const CONTRACT_ADDRESS = "0x1085bfB4DEB7f90aB8760cE9ddF6852b6E43A146";

// Metadata URIs for each NFT ID
const NFT_METADATA = {
  1: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/bafkreiee5zzo4f53eaoeb5x2pd65jmimcvwnlgoxqy42ssrxz6grgqwqre", // Pepe Card
  2: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/bafkreifk2fywmpiak7xm7qbmjngocioof3vm6xsnrsgteumi7jwjum3h2u", // Cheers Card
  3: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/bafkreigrxie7oi7vi5lvpd3k6jz2ankjmfsaambisaxbau237ielql6jvi"  // Hodldays Card
};

export async function mintNFT(recipientAddress, nftId) {
  try {
    console.log(`Starting NFT mint process for ID ${nftId} to ${recipientAddress}`);

    // Get the metadata URI for the specified NFT ID
    const metadataUri = NFT_METADATA[nftId];
    if (!metadataUri) {
      throw new Error(`No metadata URI found for NFT ID ${nftId}`);
    }

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_AMOY_URL);
    const privateKey = process.env.CONTRACT_OWNER_PRIVATE_KEY;
    const signer = new ethers.Wallet(privateKey, provider);

    // Initialize contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    console.log('Initiating mint transaction...');
    const tx = await contract.safeMint(recipientAddress, metadataUri);
    console.log('Waiting for transaction confirmation...');
    const receipt = await tx.wait();

    console.log('NFT minted successfully');
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId: receipt.logs[0].topics[3], // The token ID is typically in the Transfer event
      nftId: nftId
    };

  } catch (error) {
    console.error('Error minting NFT:', error);
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
}

// Optional: Function to verify NFT ownership
export async function verifyNFTOwnership(address, tokenId) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_AMOY_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const owner = await contract.ownerOf(tokenId);
    return owner.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    return false;
  }
}