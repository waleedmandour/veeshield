import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeeShield - AI-Powered Security Suite for Windows 11",
  description: "Next-generation AI-powered antivirus with voice assistant 'Hey Vee', real-time protection, malware scanning, and automatic system cleaning for Windows 11.",
  keywords: ["antivirus", "security", "Windows 11", "AI", "malware protection", "ransomware", "voice assistant", "Hey Vee", "VeeShield"],
  authors: [{ name: "Waleed Mandour" }],
  icons: {
    icon: "/veeshield-logo.png",
  },
  openGraph: {
    title: "VeeShield - AI-Powered Security Suite",
    description: "Next-generation AI-powered antivirus with voice assistant for Windows 11",
    url: "https://github.com/waleedmandour/veeshield",
    siteName: "VeeShield",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VeeShield - AI-Powered Security Suite",
    description: "Next-generation AI-powered antivirus with voice assistant for Windows 11",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
