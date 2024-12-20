// src/components/MagicWalletCreation.js
import { useState, useEffect, useRef } from 'react';
import { Magic } from 'magic-sdk';

export default function MagicWalletCreation({ onWalletCreated }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const processingRef = useRef(false);
  const magicInstance = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initMagic = async () => {
      if (processingRef.current) {
        console.log('Already processing, skipping...');
        return;
      }
      
      try {
        processingRef.current = true;
        if (isMounted) {
          setIsProcessing(true);
          setStatus('Initializing...');
        }
        console.log("Initializing Magic...");
    
        // Initialize Magic
        if (!magicInstance.current) {
          magicInstance.current = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
          console.log("Magic instance created");
        }
    
        // Check for existing session first
        const isLoggedIn = await magicInstance.current.user.isLoggedIn();
        console.log('Existing login status:', isLoggedIn);
    
        if (isLoggedIn) {
          console.log("User already logged in, getting user info...");
          const userInfo = await magicInstance.current.user.getInfo();
          console.log("Already logged in, user info:", userInfo);
          if (isMounted) {
            onWalletCreated(userInfo.publicAddress);
          }
          return;
        }
    
        // Start login flow
        if (isMounted) setStatus('Starting login...');
        console.log("Starting Magic login flow...");
        
        // Use a more reliable way to get email input
        let email = prompt("Please enter your email for login verification:");
        if (!email) {
          console.log("Email input cancelled by user");
          onWalletCreated(null);
          return;
        }
        console.log("Proceeding with email:", email);
    
        const result = await magicInstance.current.auth.loginWithMagicLink({ 
          email,
          showUI: true
        });
    
        console.log('Login result:', result);
    
        // Verify the login was successful
        const newLoginStatus = await magicInstance.current.user.isLoggedIn();
        console.log('New login status:', newLoginStatus);
    
        if (!newLoginStatus) {
          throw new Error('Login verification failed');
        }
    
        // Get the wallet info
        if (isMounted) setStatus('Getting wallet info...');
        const userInfo = await magicInstance.current.user.getInfo();
        console.log("Login successful, user info:", userInfo);
    
        if (isMounted && userInfo.publicAddress) {
          onWalletCreated(userInfo.publicAddress);
        } else {
          throw new Error('Failed to get wallet address');
        }
    
      } catch (error) {
        console.error("Magic wallet error:", error);
        
        if (error.code === "ACTION_CANCELED") {
          console.log("User cancelled the action");
          if (isMounted) {
            onWalletCreated(null);
          }
        } else {
          if (isMounted) {
            setStatus('Error: ' + error.message);
            onWalletCreated(null);
          }
        }
      } finally {
        processingRef.current = false;
        if (isMounted) setIsProcessing(false);
      }
    };

    initMagic();

    return () => {
      isMounted = false;
      processingRef.current = false;
    };
  }, [onWalletCreated]);

  return (
    <div className="text-center p-4">
      <p className="mb-2">{status || (isProcessing ? "Setting up your wallet..." : "Initializing...")}</p>
      {isProcessing && (
        <p className="text-sm text-gray-600">
          Please check your email for the magic link and complete the login process
        </p>
      )}
    </div>
  );
}