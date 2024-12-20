// src/components/MagicWalletCreation.js
import { useEffect, useState } from 'react';
import { Magic } from 'magic-sdk';

export default function MagicWalletCreation({ onWalletCreated, onCancel }) {
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      try {
        // Step 1: Initialize Magic
        console.log('Initializing Magic...');
        const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
        
        // Step 2: Show Magic's UI
        console.log('Launching Magic UI...');
        await magic.wallet.connectWithUI();
        
        // Step 3: Get user's wallet info
        console.log('Getting user info...');
        const userInfo = await magic.user.getInfo();
        console.log('User info received:', userInfo);

        if (userInfo.publicAddress) {
          console.log('Wallet created successfully:', userInfo.publicAddress);
          onWalletCreated(userInfo.publicAddress);
        } else {
          throw new Error('No wallet address received');
        }

      } catch (error) {
        console.error('Wallet connection failed:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    connectWallet();
  }, [onWalletCreated]);

  // Show a simple loading state or error message
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md">
      {status === 'error' ? (
        <>
          <p className="text-red-600 mb-4">Connection failed: {error}</p>
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </>
      ) : (
        <p className="text-gray-600">
          Connecting your wallet...
        </p>
      )}
    </div>
  );
}