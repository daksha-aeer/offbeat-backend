// src/components/MagicWalletCreation.js
import { useEffect, useState } from 'react';
import { Magic } from 'magic-sdk';

export default function MagicWalletCreation({ onWalletCreated, onCancel }) {
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);
  const [magic, setMagic] = useState(null);
  const [email, setEmail] = useState('');

  // Initialize Magic SDK
  useEffect(() => {
    try {
      const magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
        network: {
          rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_AMOY_URL,
          chainId: 80002, // Polygon Amoy chainId
        },
      });
      
      setMagic(magicInstance);
      setStatus('ready');
    } catch (error) {
      console.error('Magic SDK initialization error:', error);
      setError('Failed to initialize Magic SDK');
      setStatus('error');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !magic) return;

    try {
      setStatus('authenticating');
      
      // Start the login process
      const didToken = await magic.auth.loginWithMagicLink({ 
        email,
        showUI: true // This ensures the Magic modal appears
      });

      if (didToken) {
        // Get user info after successful authentication
        const userInfo = await magic.user.getInfo();
        if (userInfo.publicAddress) {
          onWalletCreated(userInfo.publicAddress);
        } else {
          throw new Error('Failed to get wallet address');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
      setStatus('error');
      onWalletCreated(null); // Notify parent of failure
    }
  };

  const handleCancel = () => {
    setStatus('ready');
    setError(null);
    setEmail('');
    if (onCancel) onCancel();
  };

  // Render error state
  if (status === 'error') {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => {
              setError(null);
              setStatus('ready');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Render loading state
  if (status === 'initializing' || status === 'checking') {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">
          {status === 'initializing' ? 'Initializing wallet connection...' : 'Checking existing session...'}
        </p>
      </div>
    );
  }

  // Render form for email input
  if (status === 'ready' || status === 'authenticating') {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Create Your NFT Wallet</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status === 'authenticating'}
            required
          />
          <div className="flex gap-4 justify-center">
            <button 
              type="submit"
              disabled={status === 'authenticating'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {status === 'authenticating' ? 'Creating Wallet...' : 'Create Wallet'}
            </button>
            <button 
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
        {status === 'authenticating' && (
          <p className="mt-4 text-sm text-gray-600">
            Please check your email and follow the instructions to create your wallet.
          </p>
        )}
      </div>
    );
  }

  // Render authenticating state
  if (status === 'authenticating') {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">Please complete the authentication in your email...</p>
      </div>
    );
  }

  return null;
}