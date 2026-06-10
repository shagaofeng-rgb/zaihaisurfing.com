import {redirect} from 'next/navigation';

export default async function NewsArticleRedirectPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  redirect(`/en/news/${slug}`);
}
