import { ApiUtils } from '../index.ts';

// Create and export the main API instance
export const apiInstance = ApiUtils.getApiInstance();

// This will be imported by other modules to ensure consistent axios setup
export default apiInstance;
