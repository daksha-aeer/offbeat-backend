//  Root layout (applies to all pages)
// src/app/layout.js
import localFont from "next/font/local";
import Navbar from "./components/navbar/navbar";
import NFTDisplay from "./components/NFTDisplay/NFTDisplay"
import { WalletProvider } from './providers/WalletProvider';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Offbeat Greets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <WalletProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
