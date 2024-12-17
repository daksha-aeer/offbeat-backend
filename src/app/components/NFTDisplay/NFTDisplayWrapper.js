// src/app/components/NFTDisplay/NFTDisplayWrapper.js

"use client";

import dynamic from 'next/dynamic';

const NFTDisplay = dynamic(() => import('./NFTDisplay'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <p>Loading NFTs...</p>
    </div>
  )
});

export default function NFTDisplayWrapper() {
  return <NFTDisplay />;
}