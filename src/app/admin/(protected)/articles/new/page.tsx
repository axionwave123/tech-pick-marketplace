import Link from 'next/link';
import { ArticleForm } from '../ArticleForm';

export const metadata = { title: 'Add article' };

export default function NewArticlePage() {
  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-brand-400 hover:underline">
        ← Articles
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-white">Add article</h1>
      <p className="mt-1 text-sm text-surface-400">
        Buying guides, comparisons, and tips. Add a cover image for the homepage cards.
      </p>
      <ArticleForm />
    </div>
  );
}
