import {redirect} from 'next/navigation';

export default async function NewsTagRedirect({params}: {params: Promise<{tag: string}>}) {
  const {tag} = await params;
  redirect(`/en/news/tag/${tag}`);
}
