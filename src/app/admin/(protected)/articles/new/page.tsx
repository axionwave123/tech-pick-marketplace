import { ArticleForm } from '../ArticleForm';

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Add article</h1>
      <p className="mt-1 text-sm text-surface-400">
        Write a buying guide, comparison, or tips article. Upload a cover image.
      </p>
      <ArticleForm />
    </div>
  );
}
