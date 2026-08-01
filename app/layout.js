// app/layout.js
// Required root layout for the Next.js App Router — wraps every page.

export const metadata = {
  title: 'SwipeHire',
  description: 'AI-powered job discovery, matching, and application tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}