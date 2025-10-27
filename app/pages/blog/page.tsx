import { useParams } from 'react-router';
import { Suspense } from 'react';
import BlogList from './components/Blog.tsx';
import BlogDetail from './components/BlogDetail.tsx';
import { Spin } from 'antd';

// Route mapping for public blog pages
const publicBlogPageMap: Record<string, React.ComponentType> = {
  list: BlogList, // /blog/list - Blog listing page
  detail: BlogDetail, // /blog/detail/:id - Blog detail page (with additional :id param)
};

/**
 * Dynamic Public Blog Page Component
 *
 * Routes:
 * - /blog (index) -> BlogList
 * - /blog/:id (detail with numeric ID) -> BlogDetail
 *
 * This handler supports both:
 * 1. Named routes like /blog/list
 * 2. ID-based routes like /blog/123 for blog details
 */
export default function PublicBlogDynamicPage() {
  const { name } = useParams<{ name: string }>();

  // If no name parameter, show blog list (index page)
  if (!name) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" tip="Loading..." />
          </div>
        }
      >
        <BlogList />
      </Suspense>
    );
  }

  // Check if it's a numeric ID (blog detail page)
  const isNumericId = /^\d+$/.test(name);

  if (isNumericId) {
    // Render BlogDetail for numeric IDs
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" tip="Loading..." />
          </div>
        }
      >
        <BlogDetail />
      </Suspense>
    );
  }

  // Get the component based on the route name
  const PageComponent = publicBlogPageMap[name];

  // If page not found, show 404
  if (!PageComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
          <p className="mt-2 text-gray-600">Blog page "{name}" does not exist.</p>
          <div className="mt-4">
            <a href="/blog" className="text-blue-600 hover:text-blue-800 underline">
              Go back to Blog
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" tip="Loading..." />
        </div>
      }
    >
      <PageComponent />
    </Suspense>
  );
}
