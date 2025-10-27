import { useParams } from 'react-router';
import { Suspense } from 'react';
import AdminBlogPage from '../../admin/settings/components/AdminBlogPage.tsx';
import AdminCategoryPage from '../../admin/settings/components/AdminCategoryPage.tsx';

// Route mapping for blog management pages
const blogPageMap: Record<string, React.ComponentType> = {
  blogs: AdminBlogPage,
  categories: AdminCategoryPage,
};

/**
 * Dynamic Blog Management Page Component
 *
 * Routes:
 * - /admin/blog/blogs -> AdminBlogPage
 * - /admin/blog/categories -> AdminCategoryPage
 */
export default function BlogPage() {
  const { name } = useParams<{ name: string }>();

  if (!name) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Blog Page</h1>
          <p className="mt-2 text-gray-600">No page name specified.</p>
        </div>
      </div>
    );
  }

  const PageComponent = blogPageMap[name];

  if (!PageComponent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
          <p className="mt-2 text-gray-600">Blog page "{name}" does not exist.</p>
          <div className="mt-4">
            <a href="/admin" className="text-blue-600 hover:text-blue-800 underline">
              Go back to Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <PageComponent />
    </Suspense>
  );
}
