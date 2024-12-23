// src/components/MagicWalletCreation.js
import { useEffect, useState } from 'react';
import { Magic } from 'magic-sdk';

/**
 * MagicWalletCreation Component
 * 
 * This component handles the creation of a blockchain wallet using Magic SDK.
 * It provides a seamless authentication flow with email-based wallet creation,
 * incorporating error handling and loading states with a polished UI.
 *
 * @param {Function} onWalletCreated - Callback function called with the created wallet address
 * @param {Function} onCancel - Optional callback function for handling cancellation
 */
export default function MagicWalletCreation({ onWalletCreated, onCancel }) {
  // Component state management
  const [status, setStatus] = useState('initializing'); // Tracks the current state of the wallet creation process
  const [error, setError] = useState(null);            // Stores any error messages
  const [magic, setMagic] = useState(null);           // Holds the Magic SDK instance
  const [email, setEmail] = useState('');             // Stores the user's email input

  // Initialize Magic SDK on component mount
  useEffect(() => {
    try {
      const magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
        network: {
          rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_AMOY_URL,
          chainId: 80002, // Polygon Amoy testnet
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

  // Handle form submission and wallet creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !magic) return;

    try {
      setStatus('authenticating');
      
      // Initiate the Magic link login process
      const didToken = await magic.auth.loginWithMagicLink({ 
        email,
        showUI: true // Shows the Magic modal for a better user experience
      });

      if (didToken) {
        // Retrieve the user's wallet information after successful authentication
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
      onWalletCreated(null);
    }
  };

  // Handle cancellation of wallet creation
  const handleCancel = () => {
    setStatus('ready');
    setError(null);
    setEmail('');
    if (onCancel) onCancel();
  };

  // Render error state with retry option
  if (status === 'error') {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto border border-gray-100">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium mb-2">Error Occurred</p>
          <p className="text-gray-600">{error}</p>
        </div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => {
              setError(null);
              setStatus('ready');
            }}
            className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Try Again
          </button>
          <button 
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Render loading state with animated spinner
  if (status === 'initializing' || status === 'checking') {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">
          {status === 'initializing' ? 'Initializing wallet connection...' : 'Checking existing session...'}
        </p>
      </div>
    );
  }

  // Render main form for email input and wallet creation
  if (status === 'ready' || status === 'authenticating') {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Create Your NFT Wallet</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-shadow duration-200"
            disabled={status === 'authenticating'}
            required
          />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            type="submit"
            disabled={status === 'authenticating'}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {status === 'authenticating' ? 'Creating Wallet...' : 'Create Wallet'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>

        </form>
        
        {status === 'authenticating' && (
          <div className="mt-6">
            <div className="animate-pulse flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Please check your email and follow the instructions to create your wallet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render authenticating state with loading animation
  if (status === 'authenticating') {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto border border-gray-100">
        <div className="animate-pulse flex items-center justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
        <p className="text-gray-600 font-medium">Please complete the authentication in your email...</p>
      </div>
    );
  }

  return null;
}