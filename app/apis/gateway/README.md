# Gateway API Module

This module provides API clients for interacting with the gateway-service backend.

## Structure

```
apis/gateway/
├── GatewayApi.ts    # Main Gateway API class extending BaseApi
├── index.ts         # Module exports
└── README.md        # This file
```

## Usage

### Import from gateway module

```typescript
import { gatewayApi, GatewayService } from '~/apis/gateway';
```

### Or import from main apis

```typescript
import { gatewayApi, GatewayService } from '~/apis';
```

### Basic Operations

```typescript
// Get all services
const services = await gatewayApi.getServices();

// Create a service
const newService = await gatewayApi.createService({
  name: 'my-service',
  protocol: 'https',
  host: 'api.example.com',
  port: 443,
  path: '/api/v1',
  retries: 3,
  connectTimeout: 30000,
  writeTimeout: 30000,
  readTimeout: 30000,
  enabled: true,
  tags: ['production'],
});

// Update a service
const updated = await gatewayApi.updateService('service-id', {
  enabled: false,
});

// Delete a service
await gatewayApi.deleteService('service-id');

// Test connection
const result = await gatewayApi.testConnection('service-id');

// Get statistics
const stats = await gatewayApi.getStatistics();
```

## API Class Hierarchy

```
BaseApi (from admin/BaseApi.ts)
  └── GatewayApi (extends BaseApi<GatewayService, string>)
```

## Features

- **CRUD Operations**: Full create, read, update, delete support
- **Health Monitoring**: Test connections and check service health
- **Statistics**: Get aggregate statistics across all services
- **Bulk Operations**: Enable/disable multiple services at once
- **Tag Search**: Search services by tags
- **Type Safety**: Full TypeScript support with interfaces

## Types

### GatewayService

Main service entity interface with properties like name, protocol, host, port, etc.

### GatewayStatistics

Statistics summary with counts and metrics.

### HealthCheckResult

Result of connection test including status and response time.

### ServiceHealthStatus

Current health status of a service.

## Integration

Used in:

- `app/components/GatewayManagement.tsx` - Main management UI
- `app/components/GatewayConnectionModal.tsx` - Service creation/editing modal
- `app/pages/admin/gateway/page.tsx` - Gateway admin page

## Backend Endpoints

The API communicates with endpoints prefixed by `/services`:

- `GET /services` - List all
- `POST /services` - Create new
- `GET /services/:id` - Get one
- `PUT /services/:id` - Update
- `DELETE /services/:id` - Delete
- `POST /services/:id/test` - Test connection
- `GET /services/:id/health` - Health status
- `GET /services/statistics` - Statistics
- `POST /services/bulk-toggle` - Bulk enable/disable
- `GET /services/search` - Search by tags

## Configuration

Base URL is configured via the main API instance from `apis/index.ts`:

- Uses `VITE_API_URL` environment variable
- Defaults to `http://localhost:3000/api/v1`
