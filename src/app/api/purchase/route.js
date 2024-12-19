// src/app/api/purchase/route.js
import clientPromise from '@/utils/mongodb';
import { customAlphabet } from 'nanoid';
import { headers } from 'next/headers';

const generateToken = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

export async function POST(req) {
  try {
    // Log the incoming request
    console.log('Received purchase request');
    
    const data = await req.json();
    console.log('Request data:', data);

    const { senderAddress, receiverEmail, note, sender, nftId } = data;

    // Validate the input with detailed errors
    if (!senderAddress) {
      return new Response(
        JSON.stringify({ message: "Sender address is required" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!receiverEmail) {
      return new Response(
        JSON.stringify({ message: "Receiver email is required" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!nftId) {
      return new Response(
        JSON.stringify({ message: "NFT ID is required" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Connect to MongoDB with error handling
    let client;
    try {
      client = await clientPromise;
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return new Response(
        JSON.stringify({ message: "Database connection failed" }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const db = client.db("offbeat-test");
    const collection = db.collection("purchases");

    const uniqueToken = generateToken();
    const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${uniqueToken}`;

    // Insert purchase data with error handling
    try {
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

      console.log('Purchase data saved:', result);

      return new Response(
        JSON.stringify({ 
          message: "Purchase data saved successfully", 
          result: result,
          claimUrl: claimUrl 
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      return new Response(
        JSON.stringify({ message: "Failed to save purchase data" }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error("Error processing purchase:", error);
    return new Response(
      JSON.stringify({ message: error.message || "Failed to process purchase" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}