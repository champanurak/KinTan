import type { Metadata } from "next";
import { Space_Grotesk, Sarabun } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

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
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* Inline script: apply theme class BEFORE first paint to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=JSON.parse(localStorage.getItem('user_prefs')||'{}');var t=p.theme||'system';if(t==='dark'){document.documentElement.classList.add('dark');}else if(t==='light'){document.documentElement.classList.remove('dark');}else{if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${sarabun.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
