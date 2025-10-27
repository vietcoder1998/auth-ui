# System Routes Architecture

## Route Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Request URL                             │
│              /admin/system/{name}                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              routes.ts                                       │
│  route('system/:name', 'pages/system/[name]/page.tsx')     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         pages/system/[name]/page.tsx                        │
│                                                              │
│  1. Extract :name parameter from URL                        │
│  2. Look up component in systemPageMap                      │
│  3. Render component or show 404                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    Valid Name?               Invalid Name?
          │                         │
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│ Render Component │      │   Show 404 Page  │
└──────────────────┘      └──────────────────┘
```

## Example Flow

### URL: `/admin/system/users`

```
1. routes.ts matches: route('system/:name')
   ↓
2. [name]/page.tsx receives: { name: 'users' }
   ↓
3. systemPageMap lookup: systemPageMap['users']
   ↓
4. Found: AdminUserPage
   ↓
5. Render: <AdminUserPage />
```

### URL: `/admin/system/invalid-page`

```
1. routes.ts matches: route('system/:name')
   ↓
2. [name]/page.tsx receives: { name: 'invalid-page' }
   ↓
3. systemPageMap lookup: systemPageMap['invalid-page']
   ↓
4. Not Found: undefined
   ↓
5. Render: 404 Error Page
```

## Component Map Structure

```typescript
const systemPageMap: Record<string, React.ComponentType> = {
  // Key: URL segment (kebab-case)
  // Value: React Component

  users: AdminUserPage,
  memory: AIMemoryPage,
  'login-history': AdminLoginHistoryPage,
  'ai-models': AdminModelPage,
  // ... etc
};
```

## Benefits Visualization

### Before (Static Routes)

```
routes.ts (Large File)
├── system/users → AdminUserPage.tsx
├── system/memory → AIMemoryPage.tsx
├── system/tokens → AdminTokenPage.tsx
├── system/roles → AdminRolePage.tsx
├── system/permissions → AdminPermissionPage.tsx
├── system/sso → AdminSSOPage.tsx
├── system/login-history → AdminLoginHistoryPage.tsx
├── system/logic-history → AdminLogicHistoryPage.tsx
├── system/cache → AdminCachePage.tsx
├── system/logs → AdminLogPage.tsx
├── system/ai-test → AdminAITestPage.tsx
├── system/agents → AdminAgentPage.tsx
├── system/conversations → AdminConversationList.tsx
├── system/prompt-history → AdminPromptHistory.tsx
├── system/faqs → AdminFaqMenu.tsx
├── system/jobs → AdminJobList.tsx
├── system/sockets → AdminSocketPage.tsx
├── system/documents → AdminDocumentPage.tsx
├── system/files → AdminFileListPage.tsx
├── system/ai-platforms → AdminAIPlatformPage.tsx
├── system/ai-keys → AdminAIKeyPage.tsx
├── system/billings → AdminBillingPage.tsx
└── system/ai-models → AdminModelPage.tsx

❌ 23 route definitions
❌ Must edit routes.ts for every new page
❌ Hard to maintain
```

### After (Dynamic Route)

```
routes.ts (Clean)
└── system/:name → [name]/page.tsx

[name]/page.tsx (Route Handler)
└── systemPageMap
    ├── users → AdminUserPage.tsx
    ├── memory → AIMemoryPage.tsx
    ├── tokens → AdminTokenPage.tsx
    └── ... (22 more mappings)

✅ 1 route definition
✅ Add new pages without touching routes.ts
✅ Easy to maintain
✅ Centralized logic
```

## Performance Comparison

### Before

- **Route Parsing**: O(n) - Check each route sequentially
- **Bundle**: All routes defined in routes.ts
- **Maintainability**: Low - Need to update routes.ts for every page

### After

- **Route Parsing**: O(1) - Single dynamic route match
- **Bundle**: Single route definition + mapping object
- **Maintainability**: High - Just update mapping object

## Type Safety

```typescript
// Type-safe URL parameters
const { name } = useParams<{ name: string }>();

// Type-safe component mapping
const systemPageMap: Record<string, React.ComponentType> = {
  'users': AdminUserPage,  // ✅ Type checked
  // 'invalid': 'not-a-component',  // ❌ Type error
};

// Type-safe component rendering
const PageComponent = systemPageMap[name];
if (!PageComponent) {
  // Handle 404
}
return <PageComponent />; // ✅ Type safe
```

## Error Handling States

```
┌─────────────────────────────────────┐
│   URL: /admin/system/:name          │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ name exists? │
        └──────┬───────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
   YES: name           NO: name
   is string           is undefined
      │                 │
      ▼                 ▼
┌────────────┐    ┌──────────────┐
│ Lookup in  │    │ Show Error:  │
│ pageMap    │    │ "Invalid     │
│            │    │  System Page"│
└─────┬──────┘    └──────────────┘
      │
      ▼
┌─────────────┐
│ Component   │
│ exists?     │
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
Found    Not Found
  │         │
  ▼         ▼
Render   Show 404
Component  Page
```

## Future Enhancements

### 1. Add Lazy Loading

```typescript
const systemPageMap: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  users: lazy(() => import('../AdminUserPage.tsx')),
  memory: lazy(() => import('../AIMemoryPage.tsx')),
  // ...
};
```

### 2. Add Page Metadata

```typescript
interface PageConfig {
  component: React.ComponentType;
  title: string;
  permissions?: string[];
}

const systemPageConfig: Record<string, PageConfig> = {
  users: {
    component: AdminUserPage,
    title: 'User Management',
    permissions: ['user:read'],
  },
  // ...
};
```

### 3. Add Breadcrumbs

```typescript
function generateBreadcrumb(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 'login-history' → 'Login History'
// 'ai-models' → 'Ai Models'
```
