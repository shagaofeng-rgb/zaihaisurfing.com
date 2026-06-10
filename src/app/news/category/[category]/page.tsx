import {redirect} from 'next/navigation';

export default async function NewsCategoryRedirect({params}: {params: Promise<{category: string}>}) {
  const {category} = await params;
  redirect(`/en/news/category/${category}`);
}
