# Axios Setup with Error Handling

## Overview

The axios setup integrates seamlessly with the existing API structure while adding comprehensive error handling through cookies.

## Architecture

### 1. **Main Axios Instance** (`app/apis/index.ts`)

- Creates the primary axios instance with authentication headers
- Includes response interceptors for error handling
- Automatically adds errors to cookies for the ErrorDisplay component
- Maintains existing toast notifications for immediate user feedback

### 2. **API Setup Initialization** (`app/utils/setup.api.ts`)

- Ensures axios instance is created early in the application lifecycle
- Exported for other modules that need direct access to the configured instance

### 3. **Error Display Integration**

- All API errors are automatically captured and stored in cookies
- ErrorDisplay component reads from cookies and shows errors at the top of content
- Errors auto-expire after 5 minutes
- Supports both toast notifications (immediate) and persistent error display

## Usage

### Automatic Error Handling

```typescript
// Any API call using the configured instance will automatically:
// 1. Show toast notification for immediate feedback
// 2. Add error to cookies for persistent display
// 3. Handle authentication errors (401) with auto-logout
// 4. Handle permission errors (403) with appropriate messaging

const result = await adminApi.getUsers(); // Errors handled automatically
```

### Manual Error Handling (if needed)

```typescript
import { addErrorToCookie } from '../components/ErrorDisplay.tsx';
import { handleApiError } from '../utils/ErrorHandlerApi.ts';

try {
  const result = await fetch('/api/custom-endpoint');
} catch (error) {
  handleApiError(error, 'Custom Operation');
  // or
  addErrorToCookie({
    message: 'Custom error message',
    status: 500,
    code: 'CUSTOM_ERROR',
  });
}
```

## Features

### ✅ **Unified Error Handling**

- Single configuration point for all axios requests
- Consistent error formatting across the application
- Automatic authentication token attachment
- User ID header injection

### ✅ **Dual Notification System**

- **Immediate**: Toast notifications for quick user feedback
- **Persistent**: Cookie-based error display for detailed error tracking

### ✅ **Smart Error Processing**

- Extracts meaningful messages from various API response formats
- Handles different HTTP status codes appropriately
- Network error detection and messaging
- Automatic token cleanup on authentication failures

### ✅ **Development Friendly**

- Detailed error information in expandable sections
- Request/response data preservation for debugging
- Timestamp tracking for error analysis

## Error Types Handled

| Status      | Behavior                                  |
| ----------- | ----------------------------------------- |
| **401**     | Auto-logout + redirect to login + toast   |
| **403**     | Permission denied message + cookie error  |
| **404**     | Resource not found message + cookie error |
| **500+**    | Server error message + cookie error       |
| **Network** | Network error message + cookie error      |
| **Other**   | Generic error handling + cookie error     |

## Integration Points

### 1. **StatusIndicator Component**

- Shows real-time system health in header
- Monitors API, Database, and Redis status
- Auto-refreshes every 30 seconds

### 2. **ErrorDisplay Component**

- Positioned at top of content area
- Sticky positioning for visibility
- Individual and bulk error dismissal
- Auto-cleanup of old errors

### 3. **API Instance**

- Used by all existing API modules (`adminApi`, `authApi`, etc.)
- Maintains backward compatibility
- No changes required to existing API calls

## Testing

Use the `ErrorTestComponent` to test different error scenarios:

```typescript
import ErrorTestComponent from '../components/ErrorTestComponent.tsx';

// Add to any page for testing
<ErrorTestComponent />
```

## Configuration

The axios instance can be configured via environment variables:

```bash
VITE_API_URL=http://localhost:13030/api  # API base URL
```

## Troubleshooting

### Common Issues

1. **Double error notifications**: Make sure only one error handling system is active
2. **Missing errors in display**: Check browser cookies for `app_errors`
3. **Status indicator not working**: Verify health endpoint is accessible

### Debug Mode

Add `debugger;` statements in the interceptor (already added) to inspect error handling flow.

## File Structure

```
app/
├── apis/
│   ├── index.ts              # Main axios instance (MODIFIED)
│   ├── admin/index.ts          # Uses getApiInstance()
│   └── auth.api.ts           # Uses getApiInstance()
├── components/
│   ├── ErrorDisplay.tsx      # Cookie-based error display
│   ├── StatusIndicator.tsx   # System health monitoring
│   └── ErrorTestComponent.tsx # Testing component
├── utils/
│   ├── setup.api.ts           # Early axios initialization
│   ├── axiosErrorInterceptor.ts # Standalone interceptor (optional)
│   └── ErrorHandlerApi.ts       # Manual error utilities
├── layouts/
│   └── AdminContentLayout.tsx # Includes StatusIndicator & ErrorDisplay
└── root.tsx                  # Imports apiSetup for early init
```

This setup provides a robust, scalable error handling system that enhances the user experience while maintaining developer-friendly debugging capabilities.
