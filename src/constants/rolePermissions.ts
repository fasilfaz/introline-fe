// Role-based module access control
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'store_keeper' | 'marketing_executive' | 'pickup_boy' | 'telecaller' | 'customer' | 'logistic_coordinator';

export type ModuleKey = 
  | 'Dashboard'
  | 'Users'
  | 'Category Master'
  | 'Customer Master'
  | 'Item Configurator'
  | 'Item Master'
  | 'Quality Control'
  | 'Supplier Management'
  | 'Store Management'
  | 'Store Stock'
  | 'Packing Lists'
  | 'Daily Expenses'
  | 'Opening Balance'
  | 'Purchase Entries'
  | 'Purchase Order Management'
  | 'Inventory Management'
  | 'Sales Invoice'
  | 'Reports'
  | 'Purchase Order Approvals'
  | 'Returns Management'
  | 'Returns Eligible'
  | 'Workflow Configuration'
  | 'Audit Trail'
  | 'Role Management'
  | 'Administration'
  | 'Purchase Return Requests'
  | 'Product Transmission';

// Define which roles have access to which modules
export const ROLE_MODULE_ACCESS: Record<UserRole, ModuleKey[]> = {
  superadmin: [
    'Dashboard',
    'Users',
    'Category Master',
    'Customer Master',
    'Item Configurator',
    'Item Master',
    'Quality Control',
    'Supplier Management',
    'Store Management',
    'Store Stock',
    'Packing Lists',
    'Daily Expenses',
    'Opening Balance',
    'Purchase Entries',
    'Purchase Order Management',
    'Inventory Management',
    'Sales Invoice',
    'Reports',
    'Purchase Order Approvals',
    'Returns Management',
    'Returns Eligible',
    'Workflow Configuration',
    'Audit Trail',
    'Role Management',
    'Administration',
    'Purchase Return Requests',
    'Product Transmission'
  ],
  admin: [
   'Dashboard',
    'Users',
    'Category Master',
    'Customer Master',
    'Item Configurator',
    'Item Master',
    'Quality Control',
    'Supplier Management',
    'Store Management',
    'Store Stock',
    'Packing Lists',
    'Daily Expenses',
    'Opening Balance',
    'Purchase Entries',
    'Purchase Order Management',
    'Inventory Management',
    'Sales Invoice',
    'Reports',
    'Purchase Order Approvals',
    'Returns Management',
    'Returns Eligible',
    'Workflow Configuration',
    'Audit Trail',
    'Role Management',
    'Administration',
    'Purchase Return Requests',
    'Product Transmission'
  ],
  manager: [
    'Dashboard',
    'Users',
    'Customer Master',
    'Item Master',
    'Store Management',
    'Store Stock',
    'Inventory Management',
    'Sales Invoice',
    'Reports',
    'Purchase Order Approvals'
  ],
  store_keeper: [
    'Dashboard',
    'Item Master',
    'Store Management',
    'Store Stock',
    'Inventory Management',
    'Reports'
  ],
  marketing_executive: [
    'Dashboard',
    'Customer Master',
    'Sales Invoice',
    'Reports'
  ],
  pickup_boy: [
    'Dashboard',
    'Reports'
  ],
  telecaller: [
    'Dashboard',
    'Customer Master',
    'Reports'
  ],
  customer: [
    'Dashboard',
    'Reports'
  ],
  logistic_coordinator: [
    'Dashboard',
    'Customer Master',
    'Store Management',
    'Store Stock',
    'Reports'
  ]
};

// Utility function to check if a user has access to a module
export const hasModuleAccess = (userRole: string, module: ModuleKey): boolean => {
  const normalizedRole = userRole.toLowerCase() as UserRole;
  
  // Superadmin has access to everything
  if (normalizedRole === 'superadmin') {
    return true;
  }
  
  // Check if the role exists and has access to the module
  const allowedModules = ROLE_MODULE_ACCESS[normalizedRole];
  return allowedModules ? allowedModules.includes(module) : false;
};

// Get all modules accessible by a role
export const getAccessibleModules = (userRole: string): ModuleKey[] => {
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return ROLE_MODULE_ACCESS[normalizedRole] || [];
};