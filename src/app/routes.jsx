import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Login } from '@/pages/auth/login';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { InventoryDashboard } from '@/pages/dashboard/inventory-dashboard';
import { UsersManagement } from '@/pages/user/list/users';
import { UserForm } from '@/pages/user/config/user-form';
import { Inventory } from '@/pages/inventory/list/inventory';
import { ItemConfigurator } from '@/pages/management/itemManagement/config/item-configurator';
import WarehouseManagement from '@/pages/management/WarehouseManagement';
import Notifications from '@/pages/Notifications/notifications';
import UserProfile from '@/pages/Profile/user-profile';
import SalesInvoiceList from '@/pages/invocie/list/InvoiceManagement';
import InvoiceView from '@/pages/invocie/config/InvoiceView';
import InvoiceEdit from '@/pages/invocie/config/InvoiceEdit';
import Reports from '@/pages/Reports/Reports';
import EnhancedReports from '@/pages/Reports/EnhancedReports';
import ItemManagement from '@/pages/management/itemManagement/list/ItemManagement';
import SupplierManagement from '@/pages/management/supplierManagement/list/SupplierManagement';
import ItemConfigForm from '@/pages/management/itemManagement/config/ItemConfigForm';
import AddStoreForm from '@/pages/management/storeManagement/config/AddStoreForm';
import SupplierForm from '@/pages/management/supplierManagement/config/SupplierForm';
import { StoreManagement } from '@/pages/management/storeManagement/list/StoreManagement';
import InventoryForm from '@/pages/inventory/config/inventory-form';
import PurchaseOrderForm from '@/pages/management/purchaseManagement/config/PurchaseOrderForm';
import PurchaseOrderList from '@/pages/management/purchaseManagement/list/PurchaseManagement';
import WorkflowConfiguration from '@/pages/workflow/WorkflowConfig';
import InventoryManagement from '@/pages/management/inventoryManagement/list/InventoryManagement';
import InventoryItemForm from '@/pages/management/inventoryManagement/config/InventoryItemForm';
import PurchaseOrderView from '@/pages/management/purchaseManagement/config/PurchaseOrderView';
import Approvals from '@/pages/Approval/Approvals';
import ApprovalsView from '@/pages/Approval/ApprovalsView';
import PrintPreview from '@/pages/Reports/PrintPreview';
import CompanyAdministration from '@/pages/administration/CompanyAdministration';
import NotificationForm from '@/pages/Notifications/config/NotificationForm';
import { CategoryManagement } from '@/pages/category/list/CategoryManagement';
import CategoryForm from '@/pages/category/config/CategoryForm';
import AuditTrial from '@/pages/Audit/auditTrial';
import CustomerForm from '@/pages/customer/config/CustomerForm';
import { CustomerManagement } from '@/pages/customer/list/CustomerManagement';
import CustomerView from '@/pages/customer/config/CustomerView';
import NotFoundPage from '@/pages/alert/NotFoundPage';
import { RoleManagement } from '@/pages/management/roleManagement/RoleManagement';
import AuthRedirectPage from '@/pages/auth/authRedirect';
import CurrencyRatesPage from '@/pages/administration/CurrencyRatesPage';
import QualityControlPage from '@/pages/purchaser/QC';
import { PackingListsPage } from '@/pages/purchaser/PackingLists'
import { PackingListView } from '@/pages/purchaser/PackingListView';
import { PackingListManagement } from '@/pages/packing-list/list/PackingListManagement';
import { PackingListForm } from '@/pages/packing-list/config/PackingListForm';
import { PackingListView as NewPackingListView } from '@/pages/packing-list/config/PackingListView';
import { DailyExpensesPage } from "@/pages/purchaser/DailyExpenses";
import { OpeningBalancePage } from "@/pages/purchaser/OpeningBalance";
import { StoreStockPage } from "@/pages/store/StoreStock";
import ProductTransmissionPage from '@/pages/administration/ProductTransmissionPage';
import PurchaseEntries from '@/pages/purchaser/PurchaseEntries';
import PurchaseEntryForm from '@/pages/purchaser/PurchaseEntryForm';
import { DeliveryPartnerManagement } from '@/pages/delivery-partner/list/DeliveryPartnerManagement';
import { DeliveryPartnerCreate } from '@/pages/delivery-partner/config/DeliveryPartnerCreate';
import { DeliveryPartnerEdit } from '@/pages/delivery-partner/config/DeliveryPartnerEdit';
import { PickupPartnerManagement } from '@/pages/pickup-partner/list/PickupPartnerManagement';
import { PickupPartnerCreate } from '@/pages/pickup-partner/config/PickupPartnerCreate';
import { PickupPartnerEdit } from '@/pages/pickup-partner/config/PickupPartnerEdit';
import { PriceListingManagement } from '@/pages/price-listing/list/PriceListingManagement';
import { PriceListingCreate } from '@/pages/price-listing/config/PriceListingCreate';
import { PriceListingEdit } from '@/pages/price-listing/config/PriceListingEdit';
import { BookingManagement } from '@/pages/booking/list/BookingManagement';
import BookingForm from '@/pages/booking/config/BookingForm';
import BookingView from '@/pages/booking/config/BookingView';
import { ReminderManagement } from '@/pages/reminder/list/ReminderManagement';
import ReminderForm from '@/pages/reminder/config/ReminderForm';
import ReminderView from '@/pages/reminder/config/ReminderView';
import { ContainerManagement } from '@/pages/container/list/ContainerManagement';
import ContainerForm from '@/pages/container/config/ContainerForm';
import ContainerView from '@/pages/container/config/ContainerView';
import StoreBookings from '@/pages/management/storeManagement/list/StoreBookings';
import { PickupAssignManagement } from '@/pages/pickup-assign/list/PickupAssignManagement';
import { PickupAssignCreate } from '@/pages/pickup-assign/config/PickupAssignCreate';
import { PickupAssignEdit } from '@/pages/pickup-assign/config/PickupAssignEdit';
import { PickupAssignView } from '@/pages/pickup-assign/config/PickupAssignView';


const protectedRoutes = [
  { path: '', element: <InventoryDashboard />, module: 'Dashboard' },
  { path: 'users', element: <UsersManagement />, module: 'Users' },
  { path: 'users/add', element: <UserForm />, module: 'Users' },
  { path: 'users/edit/:id', element: <UserForm />, module: 'Users' },
  { path: 'role-management', element: <RoleManagement />, module: 'Users' },
  { path: 'item-master', element: <Inventory />, module: 'Item Master' },
  { path: 'item-master/add', element: <InventoryForm />, module: 'Item Master' },
  { path: 'item-master/edit/:id', element: <InventoryForm />, module: 'Item Master' },
  { path: 'item-master/view/:id', element: <InventoryForm />, module: 'Item Master' },
  { path: 'supplierManagement', element: <SupplierManagement />, module: 'Supplier Management' },
  { path: 'supplier/add', element: <SupplierForm />, module: 'Supplier Management' },
  { path: 'supplier/edit/:id', element: <SupplierForm />, module: 'Supplier Management' },
  { path: 'supplier/view/:id', element: <SupplierForm />, module: 'Supplier Management' },
  { path: 'itemConfigurator', element: <ItemConfigurator />, module: 'Item Configurator' },
  { path: 'itemConfig/add', element: <ItemConfigForm />, module: 'Item Configurator' },
  { path: 'itemConfig/edit/:id', element: <ItemConfigForm />, module: 'Item Configurator' },
  { path: 'storeManagement', element: <StoreManagement />, module: 'Store Management' },
  { path: 'store/add', element: <AddStoreForm />, module: 'Store Management' },
  { path: 'store/edit/:id', element: <AddStoreForm />, module: 'Store Management' },
  { path: 'store/bookings', element: <StoreBookings />, module: 'Store Management' },
  { path: 'store/stock', element: <StoreStockPage />, module: 'Store Stock' },
  { path: 'warehouseManagement', element: <WarehouseManagement />, module: 'Inventory Management' },
  { path: 'items', element: <ItemManagement />, module: 'Item Master' },
  { path: 'invoice', element: <SalesInvoiceList />, module: 'Sales Invoice' },
  { path: 'invoice/view/:id', element: <InvoiceView />, module: 'Sales Invoice' },
  { path: 'invoice/edit/:id', element: <InvoiceEdit />, module: 'Sales Invoice' },
  { path: 'invoice/add', element: <InvoiceEdit />, module: 'Sales Invoice' },
  { path: 'reports', element: <Reports />, module: 'Reports' },
  { path: 'enhanced-reports', element: <EnhancedReports />, module: 'Reports' },
  { path: 'report/preview', element: <PrintPreview />, module: 'Reports' },
  { path: 'purchaseOrderForm', element: <PurchaseOrderForm />, module: 'Purchase Order Management' },
  { path: 'purchaseOrderManagement', element: <PurchaseOrderList />, module: 'Purchase Order Management' },
  { path: 'purchaseOrderView/:id', element: <PurchaseOrderView />, module: 'Purchase Order Management' },
  { path: 'workflow-config', element: <WorkflowConfiguration />, module: 'Workflow Configuration' },
  { path: 'inventoryManagement', element: <InventoryManagement />, module: 'Inventory Management' },
  { path: 'inventory/add', element: <InventoryItemForm />, module: 'Inventory Management' },
  { path: 'inventory/edit/:id', element: <InventoryItemForm />, module: 'Inventory Management' },
  { path: 'purchase-order-approvals', element: <Approvals />, module: 'Purchase Order Approvals' },
  { path: 'purchase-order-approvals-view/:id', element: <ApprovalsView />, module: 'Purchase Order Approvals' },
  { path: 'administration', element: <CompanyAdministration />, module: 'Administration' },
  { path: 'administration/currency', element: <CurrencyRatesPage />, module: 'Administration' },
  { path: 'category-master', element: <CategoryManagement />, module: 'Category Master' },
  { path: 'category-master/add', element: <CategoryForm />, module: 'Category Master' },
  { path: 'category-master/edit/:id', element: <CategoryForm />, module: 'Category Master' },
  { path: 'audit-trial', element: <AuditTrial />, module: 'Audit Trail' },
  { path: 'customer-management', element: <CustomerManagement />, module: 'Customer Master' },
  { path: 'customer-management/add', element: <CustomerForm />, module: 'Customer Master' },
  { path: 'customer-management/edit/:id', element: <CustomerForm />, module: 'Customer Master' },
  { path: 'customer-management/view/:id', element: <CustomerView />, module: 'Customer Master' },
  { path: 'purchaser/qc', element: <QualityControlPage />, module: 'Quality Control' },
  { path: 'purchaser/packing-lists', element: <PackingListsPage />, module: 'Packing Lists' },
  { path: 'purchaser/packing-lists/view/:id', element: <PackingListView />, module: 'Packing Lists' },
  { path: 'packing-lists', element: <PackingListManagement />, module: 'Packing Lists' },
  { path: 'packing-lists/create', element: <PackingListForm />, module: 'Packing Lists' },
  { path: 'packing-lists/edit/:id', element: <PackingListForm />, module: 'Packing Lists' },
  { path: 'packing-lists/view/:id', element: <NewPackingListView />, module: 'Packing Lists' },
  { path: 'purchaser/expenses', element: <DailyExpensesPage />, module: 'Daily Expenses' },
  { path: 'purchaser/opening-balance', element: <OpeningBalancePage />, module: 'Opening Balance' },
  { path: 'purchase-entries', element: <PurchaseEntries />, module: 'Purchase Entries' },
  { path: 'purchase-entries/add', element: <PurchaseEntryForm />, module: 'Purchase Entries' },
  { path: 'purchase-entries/edit/:id', element: <PurchaseEntryForm />, module: 'Purchase Entries' },
  { path: 'purchase-entries/view/:id', element: <PurchaseEntryForm />, module: 'Purchase Entries' },
  { path: 'administration/product-transmission', element: <ProductTransmissionPage /> },
  { path: 'delivery-partners', element: <DeliveryPartnerManagement />, module: 'Delivery Partners' },
  { path: 'delivery-partners/create', element: <DeliveryPartnerCreate />, module: 'Delivery Partners' },
  { path: 'delivery-partners/edit/:id', element: <DeliveryPartnerEdit />, module: 'Delivery Partners' },
  { path: 'pickup-partners', element: <PickupPartnerManagement />, module: 'Pickup Partners' },
  { path: 'pickup-partners/create', element: <PickupPartnerCreate />, module: 'Pickup Partners' },
  { path: 'pickup-partners/edit/:id', element: <PickupPartnerEdit />, module: 'Pickup Partners' },
  { path: 'price-listings', element: <PriceListingManagement />, module: 'Price Listings' },
  { path: 'price-listings/create', element: <PriceListingCreate />, module: 'Price Listings' },
  { path: 'price-listings/edit/:id', element: <PriceListingEdit />, module: 'Price Listings' },
  { path: 'bookings', element: <BookingManagement />, module: 'Bookings' },
  { path: 'bookings/create', element: <BookingForm />, module: 'Bookings' },
  { path: 'bookings/edit/:id', element: <BookingForm />, module: 'Bookings' },
  { path: 'bookings/view/:id', element: <BookingView />, module: 'Bookings' },
  { path: 'reminders', element: <ReminderManagement />, module: 'Reminders' },
  { path: 'reminders/create', element: <ReminderForm />, module: 'Reminders' },
  { path: 'reminders/edit/:id', element: <ReminderForm />, module: 'Reminders' },
  { path: 'reminders/view/:id', element: <ReminderView />, module: 'Reminders' },
  { path: 'containers', element: <ContainerManagement />, module: 'Containers' },
  { path: 'containers/create', element: <ContainerForm />, module: 'Containers' },
  { path: 'containers/edit/:id', element: <ContainerForm />, module: 'Containers' },
  { path: 'containers/view/:id', element: <ContainerView />, module: 'Containers' },
  { path: 'pickup-assigns', element: <PickupAssignManagement />, module: 'Pickup Assigns' },
  { path: 'pickup-assigns/create', element: <PickupAssignCreate />, module: 'Pickup Assigns' },
  { path: 'pickup-assigns/edit/:id', element: <PickupAssignEdit />, module: 'Pickup Assigns' },
  { path: 'pickup-assigns/view/:id', element: <PickupAssignView />, module: 'Pickup Assigns' }
];

const unprotectedRoutes = [
  { path: 'notifications', element: <Notifications /> },
  { path: 'notifications/create', element: <NotificationForm /> },
  { path: 'userProfile', element: <UserProfile /> },
  { path: 'auth-redirect', element: <AuthRedirectPage /> },
];

export const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      ...protectedRoutes.map(route => ({
        path: route.path,
        element: <ProtectedRoute module={route.module} />,
        children: [{ index: true, element: route.element }],
      })),
      ...unprotectedRoutes.map(route => ({
        path: route.path,
        element: route.element,
      })),
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);


