import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "VeeShield — AI Security Suite for Windows 11",
  description: "Next-generation AI-powered antivirus with universal VPN, voice assistant 'Hey Vee', real-time protection, and system cleaning for Windows 11.",
  keywords: ["antivirus", "VPN", "security", "Windows 11", "AI", "malware protection", "ransomware", "voice assistant", "Hey Vee", "VeeShield", "WireGuard"],
  authors: [{ name: "Waleed Mandour" }],
  icons: {
    icon: "/veeshield-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className="antialiased bg-[hsl(var(--bg-solid))] text-[hsl(var(--text-primary))]"
        style={{ fontFamily: "'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
