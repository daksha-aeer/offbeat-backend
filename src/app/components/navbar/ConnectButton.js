// src/app/components/navbar/ConnectButton.js

"use client";

import { ConnectKitButton } from "connectkit";
import "./ConnectButton.css";

export default function ConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => (
        <button className="connect-button" onClick={show}>
          {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}
