// src/app/components/NFTDisplay/NFTDisplay.js

"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import NFTCard from './NFTCard';
import PurchaseModal from './PurchaseModal';
import './NFTDisplay.css';

export default function NFTDisplay() {
  const { isConnected } = useAccount();
  const { setOpen } = useModal();
  const [selectedNFT, setSelectedNFT] = useState(null);

  // Sample NFT data
  const nfts = [
    {
      id: 1,
      title: "Pepe Gift Card",
      description: "A special holiday card",
      price: "0.1 MATIC",
      image: "/nft-images/CardOne.png"
    },
    {
      id: 2,
      title: "Cheers To The Season",
      description: "Celebrate the holiday season",
      price: "0.15 MATIC",
      image: "/nft-images/CardTwo.png"
    },
    {
      id: 3,
      title: "Happy Hodldays",
      description: "Spread the cheer",
      price: "0.12 MATIC",
      image: "/nft-images/CardThree.png"
    }
  ];

  const handlePurchaseClick = (nft) => {
    if (!isConnected) {
      setOpen(true);
      return;
    }
    setSelectedNFT(nft);
  };

  return (
    <div className="nft-display">
      <div className="nft-grid">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.id}
            nft={nft}
            onPurchaseClick={() => handlePurchaseClick(nft)}
          />
        ))}
      </div>

      {selectedNFT && (
        <PurchaseModal
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
        />
      )}
    </div>
  );
}