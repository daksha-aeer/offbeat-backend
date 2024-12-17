// src/components/MagicWalletCreation.js
import { useEffect } from 'react';
import { Magic } from 'magic-sdk';

export default function MagicWalletCreation({ onWalletCreated }) {
  useEffect(() => {
    const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
    
    const showUI = async () => {
      try {
        // This will show Magic's UI for wallet creation
        await magic.wallet.connectWithUI();
        
        // Get the wallet info after creation
        const userInfo = await magic.user.getInfo();
        onWalletCreated(userInfo.publicAddress);
      } catch (error) {
        console.error("Error creating wallet:", error);
      }
    };

    showUI();
  }, [onWalletCreated]);

  return (
    <div className="text-center">
      {/* Magic will render its own UI here */}
    </div>
  );
}