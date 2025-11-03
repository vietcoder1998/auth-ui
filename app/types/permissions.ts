export interface PermissionInfo {
  resource: string;
  action: 'read' | 'write' | 'delete';
  description: string;
}
