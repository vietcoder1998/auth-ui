import { useParams } from 'react-router';
import { lazy, Suspense } from 'react';
import AdminUserPage from '../components/AdminUserPage.tsx';
import AIMemoryPage from '../components/AIMemoryPage.tsx';
import AdminTokenPage from '../components/AdminTokenPage.tsx';
import AdminRolePage from '../components/AdminRolePage.tsx';
import AdminPermissionPage from '../components/AdminPermissionPage.tsx';
import AdminSSOPage from '../components/AdminSSOPage.tsx';
import AdminLoginHistoryPage from '../components/AdminLoginHistoryPage.tsx';
import AdminLogicHistoryPage from '../components/AdminLogicHistoryPage.tsx';
import AdminCachePage from '../components/AdminCachePage.tsx';
import AdminLogPage from '../components/AdminLogPage.tsx';
import AdminAITestPage from '../components/AdminAITestPage.tsx';
import AdminAgentPage from '../components/AdminAgentPage.tsx';
import AdminConversationList from '../components/AdminConversationList.tsx';
import AdminPromptHistory from '../components/AdminPromptHistory.tsx';
import AdminFaqMenu from '../components/AdminFaqMenu.tsx';
import AdminJobList from '../components/AdminJobList.tsx';
import AdminSocketPage from '../components/AdminSocketPage.tsx';
import AdminDocumentPage from '../components/AdminDocumentPage.tsx';
import AdminFileListPage from '../components/AdminFileListPage.tsx';
import AdminAIPlatformPage from '../components/AdminAIPlatformPage.tsx';
import AdminAIKeyPage from '../components/AdminAIKeyPage.tsx';
import AdminBillingPage from '../components/AdminBillingPage.tsx';
import AdminModelPage from '../components/AdminModelPage.tsx';
import AdminToolPage from '../components/AdminToolPage.tsx';
import AddPermissionRolePage from '../components/AddPermissionRolePage.tsx';

// Route mapping for system pages
const systemPageMap: Record<string, React.ComponentType> = {
  users: AdminUserPage,
  memory: AIMemoryPage,
  tokens: AdminTokenPage,
  roles: AdminRolePage,
  permissions: AdminPermissionPage,
  'permission-roles': AddPermissionRolePage,
  sso: AdminSSOPage,
  'login-history': AdminLoginHistoryPage,
  'logic-history': AdminLogicHistoryPage,
  cache: AdminCachePage,
  logs: AdminLogPage,
  'ai-test': AdminAITestPage,
  agents: AdminAgentPage,
  conversations: AdminConversationList,
  'prompt-history': AdminPromptHistory,
  faqs: AdminFaqMenu,
  jobs: AdminJobList,
  sockets: AdminSocketPage,
  documents: AdminDocumentPage,
  files: AdminFileListPage,
  'ai-platforms': AdminAIPlatformPage,
  'ai-keys': AdminAIKeyPage,
  billings: AdminBillingPage,
  'ai-models': AdminModelPage,
  tools: AdminToolPage,
};

/**
 * Dynamic System Page Component
 *
 * Routes:
 * - /admin/system/users -> AdminUserPage
 * - /admin/system/memory -> AIMemoryPage
 * - /admin/system/tokens -> AdminTokenPage
 * - /admin/system/roles -> AdminRolePage
 * - /admin/system/permissions -> AdminPermissionPage
 * - /admin/system/permission-roles -> AddPermissionRolePage
 * - /admin/system/sso -> AdminSSOPage
 * - /admin/system/login-history -> AdminLoginHistoryPage
 * - /admin/system/logic-history -> AdminLogicHistoryPage
 * - /admin/system/cache -> AdminCachePage
 * - /admin/system/logs -> AdminLogPage
 * - /admin/system/ai-test -> AdminAITestPage
 * - /admin/system/agents -> AdminAgentPage
 * - /admin/system/conversations -> AdminConversationList
 * - /admin/system/prompt-history -> AdminPromptHistory
 * - /admin/system/faqs -> AdminFaqMenu
 * - /admin/system/jobs -> AdminJobList
 * - /admin/system/sockets -> AdminSocketPage
 * - /admin/system/documents -> AdminDocumentPage
 * - /admin/system/files -> AdminFileListPage
 * - /admin/system/ai-platforms -> AdminAIPlatformPage
 * - /admin/system/ai-keys -> AdminAIKeyPage
 * - /admin/system/billings -> AdminBillingPage
 * - /admin/system/ai-models -> AdminModelPage
 * - /admin/system/tools -> AdminToolPage
 */
export default function SystemPage() {
  const { name } = useParams<{ name: string }>();

  if (!name) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid System Page</h1>
          <p className="mt-2 text-gray-600">No page name specified.</p>
        </div>
      </div>
    );
  }

  const PageComponent = systemPageMap[name];

  if (!PageComponent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
          <p className="mt-2 text-gray-600">System page "{name}" does not exist.</p>
          <div className="mt-4">
            <a href="/admin/system" className="text-blue-600 hover:text-blue-800 underline">
              Go back to System
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
