import { useState } from 'react';
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';
import { ConnectKitButton } from "connectkit";

const MagicWalletCreation = ({ onWalletCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
    extensions: [new OAuthExtension()],
  });

  const handleMagicLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // This will open Magic's UI modal
      await magic.auth.loginWithMagicLink({
        showUI: true,
      });
      
      const userInfo = await magic.user.getInfo();
      onWalletCreated(userInfo.publicAddress);
    } catch (err) {
      setError(err.message || 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Your Wallet</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Choose how you want to receive your NFT:
        </p>
        
        {/* Existing Wallet Option */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Connect Existing Wallet</h3>
          <ConnectKitButton />
        </div>
        
        {/* Magic Wallet Creation */}
        <div>
          <h3 className="font-semibold mb-2">Create New Wallet</h3>
          <button
            onClick={handleMagicLogin}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Creating Wallet...' : 'Create Wallet with Magic'}
          </button>
          
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicWalletCreation;