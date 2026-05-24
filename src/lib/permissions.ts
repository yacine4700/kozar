export type PagePermissionKey = 
  | 'dashboard'
  | 'orders'
  | 'inventory'
  | 'production'
  | 'customers'
  | 'products'
  | 'settings'
  | 'purchase-orders';

export type ActionPermissionKey = 
  | 'orders.create'
  | 'orders.edit'
  | 'orders.delete'
  | 'inventory.modify'
  | 'settings.manage_users';

export interface UserPermissions {
  pages?: Partial<Record<PagePermissionKey, boolean>>;
  actions?: Partial<Record<ActionPermissionKey, boolean>>;
}

export interface MinimalProfile {
  role: string;
  permissions?: UserPermissions | null;
}

export function hasPageAccess(profile: MinimalProfile | null | undefined, page: PagePermissionKey): boolean {
  if (!profile) return false;
  if (profile.role === 'admin') return true;
  
  if (!profile.permissions || !profile.permissions.pages) {
    // If no specific permissions are set, we might want to default to false for safety
    return false; 
  }

  return !!profile.permissions.pages[page];
}

export function hasActionAccess(profile: MinimalProfile | null | undefined, action: ActionPermissionKey): boolean {
  if (!profile) return false;
  if (profile.role === 'admin') return true;
  
  if (!profile.permissions || !profile.permissions.actions) {
    return false;
  }

  return !!profile.permissions.actions[action];
}
