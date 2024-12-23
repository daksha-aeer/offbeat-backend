// src/app/claim/[token]/page.js
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import MagicWalletCreation from '@/components/MagicWalletCreation';
import ProcessingStatus from './ProcessingStatus';

import './claim.css';

export default function ClaimPage() {
  const params = useParams();
  const { token } = params;
  const { isConnected, address } = useAccount();
  const [claimStatus, setClaimStatus] = useState("loading");
  const [purchaseData, setPurchaseData] = useState(null);
  const [showMagicUI, setShowMagicUI] = useState(false);
  const [error, setError] = useState("");
  const [currentWalletAddress, setCurrentWalletAddress] = useState(null);


  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/validate-token/${token}`);
      const data = await response.json();
  
      if (!response.ok) {
        setClaimStatus("invalid");
        setError(data.error);
        return;
      }
  
      if (data.isNFTSent) {
        setClaimStatus("claimed");
        return;
      }
  
      setPurchaseData(data);
      setClaimStatus("valid");
    } catch (error) {
      console.error("Token validation error:", error);
      setClaimStatus("error");
      setError("Failed to validate token");
    }
  };

  
  const handleWalletCreated = async (walletAddress) => {
    if (!walletAddress) {
      setShowMagicUI(false);
      setClaimStatus('valid');
      return;
    }

    setCurrentWalletAddress(walletAddress);

    try {
      setClaimStatus('processing');
      
      const response = await fetch("/api/process-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          recipientAddress: walletAddress,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to process claim");
      }
  
      setClaimStatus('success');
    } catch (error) {
      console.error("Claim error:", error);
      setError(error.message || "Failed to process claim");
      setClaimStatus('error');
    }
  };

  const handleClaimClick = () => {
    console.log('Claim button clicked');
    setShowMagicUI(true);
  };





  

  const renderContent = () => {
    switch (claimStatus) {
      case "loading":
        return <div className="status-message">Validating your claim...</div>;
      
      case "invalid":
        return <div className="status-message error-message">This claim link is invalid or has expired.</div>;
      
      case "claimed":
        return <div className="status-message">This NFT has already been claimed.</div>;
      
      case "valid":
        return (
          <div className="claim-card">
            <h2 className="claim-title">A gift from someone special</h2>
            
            {purchaseData && purchaseData.nftData && (
              <div className="nft-display">
                <img 
                  src={purchaseData.nftData.image} 
                  alt={purchaseData.nftData.title}
                  className="nft-image"
                />
                <div className="nft-content">
                  <h3 className="nft-title">{purchaseData.nftData.title}</h3>
                  <p className="nft-description">{purchaseData.nftData.description}</p>
                </div>
              </div>
            )}
            
            {!showMagicUI ? (
              <button
                onClick={handleClaimClick}
                className="claim-button"
              >
                Claim Your NFT
              </button>
            ) : (
              <MagicWalletCreation 
                onWalletCreated={handleWalletCreated}
                onCancel={() => {
                  setShowMagicUI(false);
                  setClaimStatus("valid");
                }}
              />
            )}
          </div>
        );
      
      case "processing":
        return (
          <ProcessingStatus 
            address={currentWalletAddress}
            status="Processing your NFT claim..."
          />
        );
      
      case "success":
        return (
          <ProcessingStatus 
            address={currentWalletAddress}
            status="Your card has been minted 🎉"
          />
        );
      
      case "error":
        return <div className="status-message error-message">Error: {error}</div>;
      
      default:
        return null;
    }
  };

  return (
    <div className="claim-container">
      {renderContent()}
    </div>
  );
}