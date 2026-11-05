import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../globals.css';
import '../interior.css';
import AccountChrome from '@/components/AccountChrome';

export const metadata = {
  robots: {
    index: false,
    follow: false
  },
  title: 'ZAIHAI Customer Account'
};

export default async function AccountLayout({children}: {children: React.ReactNode}) {
  setRequestLocale('en');
  const messages = await getMessages({locale: 'en'});
  return (
    <html lang="en">
      <body>
        <NextIntlClientProvider locale="en" messages={messages}>
          <Header locale="en" />
          <AccountChrome>{children}</AccountChrome>
          <Footer locale="en" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
