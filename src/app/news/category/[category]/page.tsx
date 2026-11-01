import {permanentRedirect} from 'next/navigation';

export default async function NewsCategoryRedirect({params}: {params: Promise<{category: string}>}) {
  const {category} = await params;
  permanentRedirect(`/en/news/category/${category}`);
}
