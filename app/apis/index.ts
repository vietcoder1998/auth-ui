// Re-export API utilities from utils
export { ApiUtils, getApiInstance } from '../utils/api/index.ts';

// Gateway API exports
export {
  GatewayApi,
  gatewayApi,
  type GatewayService,
  type GatewayStatistics,
  type HealthCheckResult,
  type ServiceHealthStatus,
} from './gateway/index.ts';
