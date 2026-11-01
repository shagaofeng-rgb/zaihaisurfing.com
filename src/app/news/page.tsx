import {permanentRedirect} from 'next/navigation';

export default function NewsRedirectPage() {
  permanentRedirect('/en/news');
}
