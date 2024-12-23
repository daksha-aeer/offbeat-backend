// src/app/components/NFTDisplay/NFTCard.js

"use client";

export default function NFTCard({ nft, onPurchaseClick }) {
  return (
    <div className="nft-card">
      <img
        src={nft.image}
        alt={nft.title}
        className="nft-image"
      />
      <div className="nft-content">
        <h3 className="nft-title">{nft.title}</h3>
        <p className="nft-description">{nft.description}</p>
        <p className="nft-price">{nft.price}</p>
        <button
          className="purchase-button"
          onClick={onPurchaseClick}
        >
          Purchase Card
        </button>
      </div>
    </div>
  );
}
