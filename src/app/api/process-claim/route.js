// src/app/api/process-claim/route.js
import clientPromise from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { token, recipientAddress } = await req.json();

    if (!token || !recipientAddress) {
      return new Response(
        JSON.stringify({ error: "Token and recipient address are required" }),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("offbeat-test");
    const collection = db.collection("purchases");

    // Find and update the purchase record
    const result = await collection.findOneAndUpdate(
      {
        uniqueToken: token,
        isNFTSent: false, // Ensure NFT hasn't been claimed yet
      },
      {
        $set: {
          recipientAddress,
          isNFTSent: true,
          claimedAt: new Date(),
        },
      },
      { returnDocument: 'after' } // Return the updated document
    );

    if (!result.value) {
      return new Response(
        JSON.stringify({ 
          error: "Token is invalid or NFT has already been claimed" 
        }),
        { status: 400 }
      );
    }

    // Here you would typically trigger your NFT minting
    // We'll add this logic later when we implement the smart contract integration
    // For now, we'll just return success

    return new Response(
      JSON.stringify({
        success: true,
        message: "NFT claim processed successfully",
        data: {
          nftId: result.value.nftId,
          recipientAddress: result.value.recipientAddress,
          claimedAt: result.value.claimedAt,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Claim processing error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process claim",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500 }
    );
  }
}