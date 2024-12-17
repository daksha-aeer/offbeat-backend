// src/app/components/NFTDisplay/PurchaseModal.js

"use client";
import { useAccount } from 'wagmi';
import { useState } from 'react';

export default function PurchaseModal({ nft, onClose }) {
  const { address: senderAddress } = useAccount();
  const [receiverEmail, setReceiverEmail] = useState("");
  const [note, setNote] = useState("")
  const [sender, setSender] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmPurchase = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Processing purchase for NFT:", nft.id);

      const purchaseResponse = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress,
          receiverEmail,
          note,
          sender,
          nftId: nft.id,
        }),
      });

      if (!purchaseResponse.ok) {
        const errorData = await purchaseResponse.json();
        throw new Error(errorData.message || "Failed to save purchase data");
      }

      // Store the response data
      const purchaseData = await purchaseResponse.json();
      const { claimUrl } = purchaseData;

      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverEmail,
          claimUrl,
        }),
      });

      if (!emailResponse.ok) {
        const emailErrorData = await emailResponse.json();
        throw new Error(emailErrorData.message || "Failed to send confirmation email");
      }

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Purchase failed:", error);
      setError(error.message || "Failed to complete purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Purchase</h2>
        <div className="modal-nft-details">
          <h3>{nft.title}</h3>
          <p>{nft.description}</p>
          <p className="modal-price">Price: {nft.price}</p>
        </div>

        {error && (
          <div className="error-message text-red-500 mb-4">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <input
            type="email"
            placeholder="Receiver's Email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            className="email-input"
          />
          <input
            type="text"
            placeholder="From"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="sender-input"
          />
          <input
            type="text"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="note-input"
          />
          <button className="cancel-button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="confirm-button"
            onClick={handleConfirmPurchase}
            disabled={loading || !receiverEmail}
          >
            {loading ? "Processing..." : "Confirm Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
}