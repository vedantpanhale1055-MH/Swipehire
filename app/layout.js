// app/layout.js
import "./globals.css";
import "@/lib/tokens.css";

import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'SwipeHire',
  description: 'AI-powered job discovery, matching, and application tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}