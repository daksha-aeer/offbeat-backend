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
  const [error, setError] = useState("");

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
      setClaimStatus("error");
      setError("Failed to validate token");
    }
  };

  const handleClaim = async (walletAddress) => {
    try {
      setClaimStatus("processing");

      const response = await fetch("/api/process-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          recipientAddress: walletAddress || address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process claim");
      }

      setClaimStatus("success");
    } catch (error) {
      setClaimStatus("error");
      setError(error.message);
    }
  };

  const handleWalletCreated = (newWalletAddress) => {
    handleClaim(newWalletAddress);
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
            <h2 className="text-xl font-bold mb-4">Claim Your NFT</h2>
            <MagicWalletCreation onWalletCreated={handleWalletCreated} />
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