import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloud Automation API",
  description:
    "Automatically upload external JSON data to Google Cloud Storage every 5 minutes.",
  authors: [{ name: "Research Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element => {
  return (
    <html lang="en" className="h-full bg-white text-black">
      <body
        className="font-sans antialiased h-full min-h-screen flex flex-col"
      >
        <main className="flex-grow w-full max-w-4xl mx-auto p-4 text-center">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-300 py-4 border-t">
          &copy; {new Date().getFullYear()} CloudUploader Inc. All rights
          reserved.
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
