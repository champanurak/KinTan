import type { Metadata } from "next";
import { Space_Grotesk, Sarabun } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/auth-context";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Kin_Tan",
  description: "Receipt scanning and AI categorization workflow"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${spaceGrotesk.variable} ${sarabun.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
