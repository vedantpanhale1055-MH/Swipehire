// app/layout.js
// UPDATE — replaces the layout.js content you pasted earlier, adds AuthProvider wrapper.

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