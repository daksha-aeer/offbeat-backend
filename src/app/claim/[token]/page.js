// src/app/claim/[token]/page.js
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import MagicWalletCreation from '@/components/MagicWalletCreation';

export default function ClaimPage() {
  const params = useParams();
  const { token } = params;
  const { isConnected, address } = useAccount();
  const [claimStatus, setClaimStatus] = useState("loading");
  const [purchaseData, setPurchaseData] = useState(null);
  const [showMagicUI, setShowMagicUI] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/validate-token/${token}`);
      const data = await response.json();
      console.log("Token validation response:", data); // Add this log
  
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

  const handleStartClaim = () => {
    setShowMagicUI(true);
  };

  const handleWalletCreated = async (newWalletAddress) => {
    if (!newWalletAddress) {
      console.log("Wallet creation cancelled or failed");
      setShowMagicUI(false);
      setClaimStatus("valid");  // Reset back to claim button state
      return;
    }
  
    try {
      setClaimStatus("processing");
  
      const response = await fetch("/api/process-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          recipientAddress: newWalletAddress,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to process claim");
      }
  
      setClaimStatus("success");
    } catch (error) {
      console.error("Claim error:", error);
      setClaimStatus("error");
      setError(error.message || "Failed to process claim");
      // Reset UI after error
      setTimeout(() => {
        setShowMagicUI(false);
        setClaimStatus("valid");
      }, 3000);
    }
  };

  const renderContent = () => {
    switch (claimStatus) {
      case "loading":
        return <div>Validating your claim...</div>;
      
      case "invalid":
        return <div className="text-red-500">This claim link is invalid or has expired.</div>;
      
      case "claimed":
        return <div>This NFT has already been claimed.</div>;
      
      case "valid":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Your NFT is Ready!</h2>
            
            {/* NFT Display */}
            {purchaseData && purchaseData.nftData && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <img 
                  src={purchaseData.nftData.image} 
                  alt={purchaseData.nftData.title}
                  className="w-full h-auto rounded-lg mb-4"
                  onError={(e) => console.log("Image failed to load:", e)}
                  onLoad={() => console.log("Image loaded successfully")}
                />
                <h3 className="text-lg font-semibold">{purchaseData.nftData.title}</h3>
                <p className="text-gray-600">{purchaseData.nftData.description}</p>
              </div>
            )}
            
            {!showMagicUI ? (
              <button
                onClick={() => {
                  console.log("Claim button clicked");
                  setShowMagicUI(true);
                }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Claim Your NFT
              </button>
            ) : (
              <div className="mt-4">
                <MagicWalletCreation 
                  onWalletCreated={handleWalletCreated} 
                  onCancel={() => {
                    setShowMagicUI(false);
                    setClaimStatus("valid");
                  }}
                />
              </div>
            )}
          </div>
        );
      
      case "processing":
        return <div>Processing your claim...</div>;
      
      case "success":
        return (
          <div className="text-green-500">
            Congratulations! Your NFT has been claimed successfully.
          </div>
        );
      
      case "error":
        return <div className="text-red-500">Error: {error}</div>;
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
}