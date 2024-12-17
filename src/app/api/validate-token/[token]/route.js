// src/app/api/validate-token/[token]/route.js
import clientPromise from '@/utils/mongodb';

export async function GET(req, { params }) {
  try {
    const { token } = params;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("offbeat-test");
    const collection = db.collection("purchases");

    // Find the purchase record by token
    const purchase = await collection.findOne({ uniqueToken: token });

    if (!purchase) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404 }
      );
    }

    // Return relevant purchase data
    return new Response(
      JSON.stringify({
        nftId: purchase.nftId,
        isNFTSent: purchase.isNFTSent,
        senderAddress: purchase.senderAddress,
        createdAt: purchase.createdAt,
        // Don't send sensitive data like email back to client
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

