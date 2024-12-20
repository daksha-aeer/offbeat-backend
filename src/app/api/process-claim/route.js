// src/app/api/process-claim/route.js
import clientPromise from '@/utils/mongodb';
import { mintNFT } from '@/utils/contract';

export async function POST(req) {
  let client;
  try {
    console.log('Starting claim process...');
    
    const { token, recipientAddress } = await req.json();
    console.log('Received claim request:', { token, recipientAddress });

    if (!token || !recipientAddress) {
      return new Response(
        JSON.stringify({ error: "Token and recipient address are required" }),
        { status: 400 }
      );
    }

    client = await clientPromise;
    console.log('MongoDB connection successful');
    const db = client.db("offbeat-test");
    const collection = db.collection("purchases");

    // Start a session for transaction
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // Find and lock the purchase document
        const purchase = await collection.findOne(
          { 
            uniqueToken: token,
            isNFTSent: false,
            isProcessing: { $ne: true }
          },
          { session }
        );

        if (!purchase) {
          throw new Error("Purchase not found or already being processed");
        }

        console.log('Found valid purchase:', purchase);

        // Mark as processing
        await collection.updateOne(
          { _id: purchase._id },
          { 
            $set: { 
              isProcessing: true,
              processingStarted: new Date()
            }
          },
          { session }
        );

        // Mint the NFT
        console.log('Starting NFT mint...');
        const mintResult = await mintNFT(recipientAddress, purchase.nftId);
        console.log('Mint successful:', mintResult);

        // Update the record
        await collection.updateOne(
          { _id: purchase._id },
          {
            $set: {
              recipientAddress,
              isNFTSent: true,
              isProcessing: false,
              claimedAt: new Date(),
              transactionHash: mintResult.transactionHash,
              tokenId: mintResult.tokenId
            }
          },
          { session }
        );
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "NFT claimed and minted successfully"
        }),
        { status: 200 }
      );

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error("Claim processing error:", error);
    
    // If we have a client connection, try to cleanup
    if (client) {
      try {
        const db = client.db("offbeat-test");
        await db.collection("purchases").updateOne(
          { uniqueToken: token },
          { 
            $set: { 
              isProcessing: false,
              error: error.message
            }
          }
        );
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }

    return new Response(
      JSON.stringify({ 
        error: "Failed to process claim",
        details: error.message
      }),
      { status: 500 }
    );
  }
}