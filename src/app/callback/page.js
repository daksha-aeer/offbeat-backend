// src/app/callback/page.js
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';

// Separate component for the callback logic
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing login...');

  useEffect(() => {
    // Move the function inside useEffect to avoid unnecessary recreations
    async function completeSocialLogin() {
      try {
        const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
          extensions: [new OAuthExtension()],
        });

        // Complete the social login
        const result = await magic.oauth.getRedirectResult();
        const userInfo = await magic.user.getInfo();
        
        // Get the return URL from query params
        const returnTo = searchParams.get('returnTo') || '/';
        
        // Handle claim process if returning to a claim page
        if (returnTo.includes('/claim/')) {
          const token = returnTo.split('/').pop();
          
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
        setTimeout(() => router.push('/'), 3000);
      }
    }

    completeSocialLogin();
  }, [router, searchParams]); // Add dependencies for useEffect

  return (
    <div className="text-center">
      <h1 className="text-xl font-bold mb-4">{status}</h1>
    </div>
  );
}

// Main component with Suspense wrapper
export default function CallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<div className="text-center">Initializing login...</div>}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}