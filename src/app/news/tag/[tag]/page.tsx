import {permanentRedirect} from 'next/navigation';

export default async function NewsTagRedirect({params}: {params: Promise<{tag: string}>}) {
  const {tag} = await params;
  permanentRedirect(`/en/news/tag/${tag}`);
}
