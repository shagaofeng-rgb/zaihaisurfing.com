import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZAIHAI SURFING',
  description: 'ZAIHAI surfing equipment and business operations platform.'
};

/** Shared App Router root required for production builds. Route-specific layouts
 * continue to provide their own locale, admin and account interfaces. */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return children;
}
