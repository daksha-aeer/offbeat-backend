// src/app/api/purchase/routeModule.js
import clientPromise from '@/utils/mongodb';
import { customAlphabet } from 'nanoid';

const generateToken = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

export async function POST(req) {
  try {
    const { senderAddress, receiverEmail, note, sender, nftId } = await req.json();

    // Validate the input
    if (!senderAddress || !receiverEmail || !nftId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("offbeat-test"); // Replace with your database name
    const collection = db.collection("purchases");

    const uniqueToken = generateToken();

    const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${uniqueToken}`;

    // Insert purchase data
    const result = await collection.insertOne({
      senderAddress,
      receiverEmail,
      note,
      sender,
      nftId,
      uniqueToken,
      claimUrl,
      isNFTSent: false,
      createdAt: new Date(),
      claimedAt: null,
      recipientAddress: null,
    });

    return new Response(
      JSON.stringify({ 
        message: "Purchase data saved successfully", 
        result,
        claimUrl 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving purchase data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save purchase data" }),
      { status: 500 }
    );
  }
}
