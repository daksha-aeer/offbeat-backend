// src/app/api/process-claim/route.js
import clientPromise from '@/utils/mongodb';
import { mintNFT } from '@/utils/contract';

export async function POST(req) {
  let client;
  let session;
  
  try {
    const { token, recipientAddress } = await req.json();
    console.log('Processing claim:', { token, recipientAddress });

    if (!token || !recipientAddress) {
      return new Response(
        JSON.stringify({ error: "Token and recipient address are required" }),
        { status: 400 }
      );
    }

    client = await clientPromise;
    const db = client.db("offbeat-test");
    const collection = db.collection("purchases");

    // Start a session for transaction
    session = client.startSession();

    let result = await session.withTransaction(async () => {
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
        throw new Error("Purchase not found or already claimed");
      }

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
      console.log('Minting NFT...');
      const mintResult = await mintNFT(recipientAddress, purchase.nftId);
      console.log('NFT minted successfully');

      // Update the record with success
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

      return { success: true, mintResult };
    });

    await session.endSession();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "NFT claimed and minted successfully",
        ...result
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Claim processing error:', error);

    // Cleanup if needed
    if (client && session) {
      try {
        const { token } = await req.json();
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
        console.error('Cleanup error:', cleanupError);
      }
    }

    if (session) {
      await session.endSession();
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