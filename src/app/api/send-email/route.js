// src/app/api/send-email/route.js

import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Initialize Mailgun with debugging
const mg = new Mailgun(formData);
const DOMAIN = process.env.MAILGUN_DOMAIN;

console.log('Initializing with domain:', DOMAIN); // Debug log

const mgClient = mg.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

const createEmailTemplate = (claimUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button {
      background-color: #4CAF50;
      border: none;
      color: white !important;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      border-radius: 4px;
    }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
    /* Ensure links are visible */
    a { color: #4CAF50; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 You've Received an NFT!</h1>
    <p>Someone special has sent you a unique NFT greeting card. To claim your NFT:</p>
    <ol>
      <li>Click the button below</li>
      <li>Create or connect your wallet</li>
      <li>Your NFT will be automatically transferred to your wallet</li>
    </ol>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${claimUrl}" style="background-color: #4CAF50; color: white; padding: 15px 32px; text-decoration: none; border-radius: 4px; display: inline-block;">Claim Your NFT</a>
    </div>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all;"><a href="${claimUrl}">${claimUrl}</a></p>
    <p class="footer">
      This link is unique to you and can only be used once. 
      If you have any questions, please contact support.
    </p>
  </div>
</body>
</html>
`;

export async function POST(req) {
  try {
    const { receiverEmail, claimUrl } = await req.json();
    // Debug logs for environment variables
    console.log('API Key available:', !!process.env.MAILGUN_API_KEY);
    console.log('Domain being used:', process.env.MAILGUN_DOMAIN);

    // const { receiverEmail } = await req.json();
    console.log('Received request for email:', receiverEmail); // Debug log

    if (!receiverEmail || !claimUrl) {
      return new Response(
        JSON.stringify({ error: "Receiver email and claim URL are required" }), 
        { status: 400 }
      );
    }

    const messageData = {
      from: `Offbeat Greets <mailgun@${DOMAIN}>`,
      to: receiverEmail,
      subject: "You've received an NFT!",
      html: createEmailTemplate(claimUrl),
      text: `You've received an NFT! Click here to claim: ${claimUrl}
    
    1. Click this link to claim your NFT: ${claimUrl}
    2. Create or connect your wallet
    3. Your NFT will be automatically transferred to your wallet
    
    This link is unique to you and can only be used once.`,
    };

    console.log('Attempting to send email with data:', {
      ...messageData,
      from: messageData.from // Only log the from address
    });

    const response = await mgClient.messages.create(DOMAIN, messageData);
    console.log('Mailgun response:', response); // Debug log

    return new Response(
      JSON.stringify({ success: true, messageId: response.id }), 
      { status: 200 }
    );
  } catch (error) {
    // Enhanced error logging
    console.error("Email sending failed. Full error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      details: error.details || 'No additional details'
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }), 
      { status: 500 }
    );
  }
}