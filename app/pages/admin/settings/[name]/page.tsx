import { useParams } from 'react-router';
import { Suspense } from 'react';
import AdminApiKeysPage from '../components/AdminApiKeysPage.tsx';
import AdminMailPage from '../components/AdminMailPage.tsx';
import AdminNotificationPage from '../components/AdminNotificationPage.tsx';
import AdminConfigPage from '../components/AdminConfigPage.tsx';
import AdminSeedPage from '../components/AdminSeedPage.tsx';
import AdminDatabasePage from '../components/AdminDatabasePage.tsx';
import AdminCookieHandle from '../components/AdminCookieHandle.tsx';

// Route mapping for settings pages
const settingsPageMap: Record<string, React.ComponentType> = {
  'api-keys': AdminApiKeysPage,
  mail: AdminMailPage,
  notifications: AdminNotificationPage,
  config: AdminConfigPage,
  seed: AdminSeedPage,
  database: AdminDatabasePage,
  'cookie-demo': AdminCookieHandle,
};

/**
 * Dynamic Settings Page Component
 *
 * Routes:
 * - /admin/settings/api-keys -> AdminApiKeysPage
 * - /admin/settings/mail -> AdminMailPage
 * - /admin/settings/notifications -> AdminNotificationPage
 * - /admin/settings/config -> AdminConfigPage
 * - /admin/settings/seed -> AdminSeedPage
 * - /admin/settings/database -> AdminDatabasePage
 * - /admin/settings/cookie-demo -> AdminCookieHandle
 */
export default function SettingsPage() {
  const { name } = useParams<{ name: string }>();

  if (!name) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Settings Page</h1>
          <p className="mt-2 text-gray-600">No page name specified.</p>
        </div>
      </div>
    );
  }

  const PageComponent = settingsPageMap[name];

  if (!PageComponent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
          <p className="mt-2 text-gray-600">Settings page "{name}" does not exist.</p>
          <div className="mt-4">
            <a href="/admin/settings" className="text-blue-600 hover:text-blue-800 underline">
              Go back to Settings
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
