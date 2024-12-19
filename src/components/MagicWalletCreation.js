// src/components/MagicWalletCreation.js
import { useEffect } from 'react';
import { Magic } from 'magic-sdk';

export default function MagicWalletCreation({ onWalletCreated }) {
  useEffect(() => {
    const createWallet = async () => {
      try {
        console.log("Starting wallet creation...");
        const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
        console.log("Magic instance created");
        
        await magic.wallet.connectWithUI();
        console.log("UI connected");
        
        const userInfo = await magic.user.getInfo();
        console.log("Got user info:", userInfo);
        
        onWalletCreated(userInfo.publicAddress);
      } catch (error) {
        console.error("Error creating wallet:", error);
      }
    };

    createWallet();
  }, []);

  return (
    <div className="text-center">
      <p>Creating your wallet...</p>
    </div>
  );
}