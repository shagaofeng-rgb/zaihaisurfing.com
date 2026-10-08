import '../globals.css';
import './admin.css';

export const metadata = {
  robots: {
    index: false,
    follow: false
  },
  title: 'ZAIHAI Admin'
};

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
