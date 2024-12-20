// src/app/api/validate-token/[token]/route.js
import clientPromise from '@/utils/mongodb';

const NFT_DATA = {
  1: {
    title: "Pepe Gift Card",
    description: "A special holiday card",
    image: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/QmXr7Ci1DWeeYzrBRvpBip46FPuePdkJwJeb44ijz6V25B"
  },
  2: {
    title: "Cheers To The Season",
    description: "Celebrate the holiday season",
    image: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/bafybeig2wvvckrlcrc4hcaar2yob3p3e7e6or57o56nzcchsd4pj7m7z3a"
  },
  3: {
    title: "Happy Hodldays",
    description: "Spread the cheer",
    image: "https://lavender-rare-trout-340.mypinata.cloud/ipfs/bafybeiaa7kcfh63h2uczsdddabrwtzf67znu5uoebmhdvhlv437lunqk6u"
  }
};

export async function GET(req, { params }) {
  try {
    if (!params?.token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400 }
      );
    }

    const token = params.token;

    const client = await clientPromise;
    const db = client.db("offbeat-test");
    const collection = db.collection("purchases");

    const purchase = await collection.findOne({ uniqueToken: token });
    console.log('Found purchase:', purchase); // Debug log

    if (!purchase) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404 }
      );
    }

    // Include the NFT data based on nftId
    return new Response(
      JSON.stringify({
        nftId: purchase.nftId,
        isNFTSent: purchase.isNFTSent,
        senderAddress: purchase.senderAddress,
        createdAt: purchase.createdAt,
        nftData: NFT_DATA[purchase.nftId]
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Token validation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to validate token" }),
      { status: 500 }
    );
  }
}