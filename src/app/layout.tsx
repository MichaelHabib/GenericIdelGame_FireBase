
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
// Removed GeistMono as it's not found and not explicitly used for now.
// import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Point Clicker Pro - The Ultimate Clicking Adventure',
  description: 'Click your way to riches and build your empire of upgrades!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
