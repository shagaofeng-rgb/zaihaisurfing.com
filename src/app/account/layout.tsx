import '../globals.css';

export const metadata = {
  robots: {
    index: false,
    follow: false
  },
  title: 'ZAIHAI Customer Account'
};

export default function AccountLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
