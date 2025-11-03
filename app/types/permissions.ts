export interface PermissionInfo {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'view' | 'create' | 'update';
  description: string;
}
