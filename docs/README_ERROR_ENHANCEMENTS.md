# Error Display Enhancement Documentation

## New Features

### 🔧 **Auto-Fix Button for 403 Permission Errors**

When a 403 (Forbidden) error occurs and the user is a super admin, a "Fix" button appears next to the error notification.

**How it works:**

1. **Detection**: Automatically detects 403 errors from API calls
2. **Permission Mapping**: Maps the failed request URL to the required permission
3. **Super Admin Check**: Only shows fix button for users with superadmin or admin roles
4. **Auto-Fix**: Creates missing permission and adds it to super admin role
5. **Auto-Reload**: Refreshes the page after successful fix

**Supported URL Patterns:**

- `/admin/users` → `admin:users:read/write`
- `/admin/roles` → `admin:roles:read/write`
- `/admin/permissions` → `admin:permissions:read/write`
- `/admin/cache` → `admin:cache:read/write`
- `/admin/logs` → `admin:logs:read/write`
- `/admin/seed` → `admin:seed:read/write`
- And many more...

### 📦 **Downsized Notifications**

Error notifications are now more compact and less intrusive:

**Size Reductions:**

- Alert margins reduced from 16px to 12px/6px
- Font sizes reduced from 12px to 11px
- Button heights reduced to 24px
- Details section uses smaller fonts (10px-11px)
- Max height for details reduced to 150px

**Visual Improvements:**

- More compact action buttons
- Smaller spacing between elements
- Reduced padding in details sections
- Streamlined "Dismiss All" button

## Usage Examples

### Example 1: Basic 403 Error with Fix Button

```typescript
// When this fails with 403:
const users = await adminApi.getUsers();

// Error display will show:
// [403] Access denied. You don't have permission to perform this action. (ERR_BAD_REQUEST)
// [Fix Button] [X]
```

### Example 2: Different Permission Types

```typescript
// GET request → admin:users:read
await adminApi.getUsers();

// POST request → admin:users:write
await adminApi.createUser(data);

// DELETE request → admin:users:delete
await adminApi.deleteUser(id);
```

## Components

### ErrorDisplay Component

**New Props:**

- Automatically detects user role via `useAuth()`
- Shows fix button only for super admins
- Handles loading state during fix operation

**New State:**

- `fixingErrors: Set<string>` - Tracks which errors are being fixed
- Enhanced error type detection

### PermissionUtils

**Functions:**

- `extractPermissionFromUrl(url, method)` - Maps URLs to permissions
- `getCommonAdminPermissions()` - Returns list of common admin permissions

## Fix Process Flow

1. **Error Occurs** → 403 status detected
2. **Permission Analysis** → URL mapped to required permission
3. **User Check** → Verify user is super admin
4. **Show Fix Button** → "Fix" button appears with tool icon
5. **Click Fix** → Button shows loading state
6. **Permission Creation** → Create permission if doesn't exist
7. **Role Assignment** → Add permission to super admin role
8. **Success** → Error dismissed, page reloads
9. **Retry** → Original request should now work

## Error Display Hierarchy

```
ErrorDisplay (Container)
├── Alert (Per Error)
│   ├── Icon (ExclamationCircleOutlined)
│   ├── Message (Formatted error message)
│   ├── Description (Collapsible details)
│   └── Actions
│       ├── Fix Button (if 403 + super admin)
│       └── Close Button
└── Dismiss All (if multiple errors)
```

## Testing

Use the enhanced `ErrorTestComponent`:

```typescript
// Test 403 errors with fix button
<ErrorTestComponent />
```

**Test Scenarios:**

1. 403 error with fix button (super admin)
2. 403 error without fix button (regular user)
3. Multiple permission errors
4. Network and server errors

## Configuration

The permission mapping can be extended in `permissionUtils.ts`:

```typescript
const urlMappings = [
  {
    pattern: /\/admin\/my-feature/,
    resource: 'admin:my_feature',
    description: 'My Feature Management',
  },
  // Add more mappings...
];
```

This enhancement provides a seamless way for super admins to self-resolve permission issues while keeping the error display compact and user-friendly! 🎉
