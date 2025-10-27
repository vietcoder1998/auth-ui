# System Routes Refactoring

## Overview

Refactored system routes from individual static routes to a single dynamic route pattern using `[name]` parameter.

## Changes

### Before (Static Routes)

```typescript
// 23 individual routes
route('system/users', 'pages/system/AdminUserPage.tsx'),
route('system/memory', 'pages/system/AIMemoryPage.tsx'),
route('system/tokens', 'pages/system/AdminTokenPage.tsx'),
// ... 20 more routes
```

### After (Dynamic Route)

```typescript
// 1 dynamic route handles all system pages
route('system/:name', 'pages/system/[name]/page.tsx'),
```

## File Structure

```
pages/
├── system/
│   ├── [name]/
│   │   └── page.tsx          # Dynamic route handler
│   ├── AdminUserPage.tsx
│   ├── AIMemoryPage.tsx
│   ├── AdminTokenPage.tsx
│   └── ... (all other admin pages)
```

## Dynamic Route Handler

**File**: `pages/system/[name]/page.tsx`

### Route Mapping

The dynamic page uses a mapping object to route to the correct component:

```typescript
const systemPageMap: Record<string, React.ComponentType> = {
  users: AdminUserPage,
  memory: AIMemoryPage,
  tokens: AdminTokenPage,
  roles: AdminRolePage,
  permissions: AdminPermissionPage,
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
};
```

### Features

1. **Dynamic Component Loading**: Based on URL parameter `:name`
2. **404 Handling**: Shows error page for invalid system page names
3. **Suspense**: Loading state while component loads
4. **Type Safety**: Uses TypeScript with proper typing

## Supported Routes

All routes follow the pattern: `/admin/system/:name`

| URL                            | Component             | Description           |
| ------------------------------ | --------------------- | --------------------- |
| `/admin/system/users`          | AdminUserPage         | User management       |
| `/admin/system/memory`         | AIMemoryPage          | AI memory management  |
| `/admin/system/tokens`         | AdminTokenPage        | Token management      |
| `/admin/system/roles`          | AdminRolePage         | Role management       |
| `/admin/system/permissions`    | AdminPermissionPage   | Permission management |
| `/admin/system/sso`            | AdminSSOPage          | SSO configuration     |
| `/admin/system/login-history`  | AdminLoginHistoryPage | Login history         |
| `/admin/system/logic-history`  | AdminLogicHistoryPage | Logic history         |
| `/admin/system/cache`          | AdminCachePage        | Cache management      |
| `/admin/system/logs`           | AdminLogPage          | System logs           |
| `/admin/system/ai-test`        | AdminAITestPage       | AI testing            |
| `/admin/system/agents`         | AdminAgentPage        | AI agents             |
| `/admin/system/conversations`  | AdminConversationList | Conversations         |
| `/admin/system/prompt-history` | AdminPromptHistory    | Prompt history        |
| `/admin/system/faqs`           | AdminFaqMenu          | FAQ management        |
| `/admin/system/jobs`           | AdminJobList          | Job management        |
| `/admin/system/sockets`        | AdminSocketPage       | Socket configuration  |
| `/admin/system/documents`      | AdminDocumentPage     | Document management   |
| `/admin/system/files`          | AdminFileListPage     | File management       |
| `/admin/system/ai-platforms`   | AdminAIPlatformPage   | AI platforms          |
| `/admin/system/ai-keys`        | AdminAIKeyPage        | AI keys               |
| `/admin/system/billings`       | AdminBillingPage      | Billing management    |
| `/admin/system/ai-models`      | AdminModelPage        | AI models             |

## Benefits

### 1. **Reduced Route Definitions**

- Before: 23+ route definitions
- After: 1 dynamic route definition
- **Reduction**: ~96% fewer route definitions

### 2. **Easier Maintenance**

- Add new system pages without modifying `routes.ts`
- Just add component to `systemPageMap`
- Centralized route logic

### 3. **Better Organization**

- Clear separation of concerns
- Single source of truth for system page routing
- Easy to understand and modify

### 4. **Type Safety**

- TypeScript ensures valid component types
- URL parameter typing with React Router
- Compile-time error detection

### 5. **Better Error Handling**

- Invalid pages show 404 with helpful message
- Missing name parameter handled gracefully
- User-friendly error messages

## Adding New System Pages

To add a new system page:

1. **Create the page component** (if not exists):

   ```typescript
   // pages/system/AdminNewFeaturePage.tsx
   export default function AdminNewFeaturePage() {
     return <div>New Feature</div>;
   }
   ```

2. **Import it in `[name]/page.tsx`**:

   ```typescript
   import AdminNewFeaturePage from '../AdminNewFeaturePage.tsx';
   ```

3. **Add to `systemPageMap`**:

   ```typescript
   const systemPageMap: Record<string, React.ComponentType> = {
     // ... existing mappings
     'new-feature': AdminNewFeaturePage,
   };
   ```

4. **Access via URL**:
   ```
   /admin/system/new-feature
   ```

That's it! No need to modify `routes.ts`.

## Migration Guide

If you need to update links in the application:

### Before

```tsx
<Link to="/admin/system/users">Users</Link>
```

### After (No Change Required)

```tsx
<Link to="/admin/system/users">Users</Link>
```

All existing URLs continue to work! The refactoring is **backward compatible**.

## Testing

Test the following scenarios:

1. **Valid routes**: `/admin/system/users`, `/admin/system/roles`, etc.
2. **Invalid routes**: `/admin/system/invalid-page` (should show 404)
3. **Missing name**: `/admin/system/` (should redirect to AdminSystemIndexPage)
4. **Navigation**: Ensure all navigation links work
5. **Direct URL access**: Test accessing URLs directly in browser

## Code Quality

- ✅ No TypeScript errors
- ✅ All imports use `.tsx` extensions
- ✅ Proper error handling
- ✅ Loading states with Suspense
- ✅ Type-safe component mapping
- ✅ Clean, maintainable code

## Performance

- **Lazy Loading**: Can be added for individual components if needed
- **Code Splitting**: React Router handles code splitting
- **Bundle Size**: Reduced route configuration overhead

## Future Enhancements

1. **Lazy Loading**: Load components on-demand

   ```typescript
   const AdminUserPage = lazy(() => import('../AdminUserPage.tsx'));
   ```

2. **Breadcrumbs**: Auto-generate from route name

   ```typescript
   const breadcrumb = name.split('-').map(capitalize).join(' ');
   ```

3. **Page Metadata**: Add page titles and descriptions

   ```typescript
   const pageMetadata: Record<string, { title: string; description: string }> = {
     users: { title: 'Users', description: 'Manage users' },
     // ...
   };
   ```

4. **Permissions**: Add permission checks per page
   ```typescript
   const pagePermissions: Record<string, string[]> = {
     users: ['user:read', 'user:write'],
     // ...
   };
   ```

## Conclusion

This refactoring significantly improves the maintainability and scalability of the system routes while maintaining full backward compatibility. The codebase is now cleaner, more organized, and easier to extend.
