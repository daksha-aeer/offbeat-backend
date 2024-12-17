// src/app/callback/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing login...');

  useEffect(() => {
    completeSocialLogin();
  }, []);

  const completeSocialLogin = async () => {
    try {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
        extensions: [new OAuthExtension()],
      });

      // Complete the social login
      const result = await magic.oauth.getRedirectResult();
      const userInfo = await magic.user.getInfo();
      
      // Get the return URL from query params (e.g., /callback?returnTo=/claim/abc123)
      const returnTo = searchParams.get('returnTo') || '/';
      
      // If we're returning to a claim page, we need to trigger the claim process
      if (returnTo.includes('/claim/')) {
        // Extract the token from the return URL
        const token = returnTo.split('/').pop();
        
        // Make the claim API call
        const response = await fetch("/api/process-claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            recipientAddress: userInfo.publicAddress,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process claim");
        }
      }

      // Redirect back to the original page
      router.push(returnTo);
    } catch (error) {
      setStatus('Login failed. Please try again.');
      console.error('Social login error:', error);
      // Redirect to home page or error page after a delay
      setTimeout(() => router.push('/'), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">{status}</h1>
      </div>
    </div>
  );
}