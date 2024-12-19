// src/app/api/process-claim/route.js
import clientPromise from '@/utils/mongodb';
import { mintNFT } from '@/utils/contract';

export async function POST(req) {
  try {
    console.log('Starting claim process...');
    
    const { token, recipientAddress } = await req.json();
    console.log('Received claim request:', { token, recipientAddress });

    if (!token || !recipientAddress) {
      console.log('Missing required fields:', { token: !!token, recipientAddress: !!recipientAddress });
      return new Response(
        JSON.stringify({ error: "Token and recipient address are required" }),
        { status: 400 }
      );
    }

    // Establish MongoDB connection with detailed error logging
    let client;
    try {
      console.log('Attempting to connect to MongoDB...');
      client = await clientPromise;
      console.log('MongoDB connection successful');
    } catch (dbError) {
      console.error('MongoDB connection error details:', {
        message: dbError.message,
        stack: dbError.stack,
        code: dbError.code,
        name: dbError.name
      });
      return new Response(
        JSON.stringify({ 
          error: "Database connection failed",
          details: process.env.NODE_ENV === 'development' ? {
            message: dbError.message,
            code: dbError.code
          } : undefined
        }),
        { status: 500 }
      );
    }

    const db = client.db("offbeat-test");
    const collection = db.collection("purchases");

    // Find purchase record with error handling
    let purchase;
    try {
      console.log('Searching for purchase record with token:', token);
      purchase = await collection.findOne({
        uniqueToken: token,
        isNFTSent: false,
      });
      console.log('Purchase record found:', !!purchase);
    } catch (findError) {
      console.error('Error finding purchase:', findError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to retrieve purchase record",
          details: process.env.NODE_ENV === 'development' ? findError.message : undefined
        }),
        { status: 500 }
      );
    }

    if (!purchase) {
      return new Response(
        JSON.stringify({ error: "Invalid token or NFT already claimed" }),
        { status: 400 }
      );
    }

    // Mint the NFT with error handling
    let mintResult;
    try {
      console.log('Attempting to mint NFT for address:', recipientAddress);
      mintResult = await mintNFT(recipientAddress, purchase.nftId);
      console.log('NFT minted successfully:', mintResult);
    } catch (mintError) {
      console.error('Error minting NFT:', mintError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to mint NFT",
          details: process.env.NODE_ENV === 'development' ? mintError.message : undefined
        }),
        { status: 500 }
      );
    }

    // Update purchase record with error handling
    try {
      console.log('Updating purchase record with mint details');
      const result = await collection.findOneAndUpdate(
        { uniqueToken: token },
        {
          $set: {
            recipientAddress,
            isNFTSent: true,
            claimedAt: new Date(),
            transactionHash: mintResult.transactionHash,
            tokenId: mintResult.tokenId
          },
        },
        { returnDocument: 'after' }
      );

      console.log('Purchase record updated successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: "NFT claimed and minted successfully",
          data: {
            nftId: result.value.nftId,
            recipientAddress: result.value.recipientAddress,
            claimedAt: result.value.claimedAt,
            transactionHash: mintResult.transactionHash,
            tokenId: mintResult.tokenId
          },
        }),
        { status: 200 }
      );
    } catch (updateError) {
      console.error('Error updating purchase record:', updateError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update purchase record",
          details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Claim processing error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: "Failed to process claim",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500 }
    );
  }
}