import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  CalendarIcon,
  ChartNoAxesCombined,
  Download,
  FileText,
  Printer,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Container,
  Truck,
  Package2,
  BookOpen,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/redux';
import { setPrintData } from '@/redux/features/PurchaseOrderReportPrintSlice';
import { formatCurrency, formatNumber } from '@/Utils/formatters';
import { reportService } from '@/services/reportService';
import { customerService } from '@/services/customerService';

// Type definitions for the new report types
interface CustomerReportItem {
  _id: string;
  name: string;
  customerType: 'Sender' | 'Receiver';
  phone?: string;
  whatsappNumber?: string;
  shopName?: string;
  location?: string;
  country?: string;
  credit?: number;
  totalAmount: number;
  totalCredit: number;
  balanceAmount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface ContainerReportItem {
  _id: string;
  containerCode: string;
  companyName: string;
  bookingDate: string;
  bookingCharge: number;
  advancePayment: number;
  balanceAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface DeliveryPartnerReportItem {
  _id: string;
  name: string;
  phoneNumber: string;
  price: number;
  fromCountry: string;
  toCountry: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface PickupPartnerReportItem {
  _id: string;
  name: string;
  phoneNumber: string;
  price: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface BookingReportItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
    phone?: string;
    location?: string;
  };
  receiver: {
    _id: string;
    name: string;
    phone?: string;
    country?: string;
    address?: string;
  };
  pickupPartner: {
    _id: string;
    name: string;
    phoneNumber: string;
    price: number;
  };
  date: string;
  expectedReceivingDate: string;
  bundleCount: number;
  receiverBranch?: string;
  status: 'pending' | 'success';
  createdAt: string;
}

type ReportType = 'customers' | 'containers' | 'delivery-partners' | 'pickup-partners' | 'bookings';

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: string | null;
  direction: SortDirection;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
}

const EnhancedReports: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | ''>('');
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Report data states
  const [customerData, setCustomerData] = useState<CustomerReportItem[]>([]);
  const [containerData, setContainerData] = useState<ContainerReportItem[]>([]);
  const [deliveryPartnerData, setDeliveryPartnerData] = useState<DeliveryPartnerReportItem[]>([]);
  const [pickupPartnerData, setPickupPartnerData] = useState<PickupPartnerReportItem[]>([]);
  const [bookingData, setBookingData] = useState<BookingReportItem[]>([]);

  // Filter states
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [senderFilter, setSenderFilter] = useState<string>('all');
  const [receiverFilter, setReceiverFilter] = useState<string>('all');

  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    itemsPerPage: 10
  });
  const [paginatedData, setPaginatedData] = useState<any[]>([]);

  // Summary states
  const [summaryStats, setSummaryStats] = useState<any>({});

  // Available customers for booking filters
  const [availableCustomers, setAvailableCustomers] = useState<{ senders: any[], receivers: any[] }>({
    senders: [],
    receivers: []
  });

  // Report type configurations
  const reportTypes = [
    { 
      value: 'customers', 
      label: 'Customer Report', 
      icon: Users,
      description: 'Customer details with amounts (sender and receiver)'
    },
    { 
      value: 'containers', 
      label: 'Container Report', 
      icon: Container,
      description: 'Container bookings and charges'
    },
    { 
      value: 'delivery-partners', 
      label: 'Delivery Partner Report', 
      icon: Truck,
      description: 'Delivery partner details and pricing'
    },
    { 
      value: 'pickup-partners', 
      label: 'Pickup Partner Report', 
      icon: Package2,
      description: 'Pickup partner details and pricing'
    },
    { 
      value: 'bookings', 
      label: 'Booking Report', 
      icon: BookOpen,
      description: 'Booking details with sender, receiver, and partner info'
    }
  ];

  // Fetch customers for booking filters
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await customerService.listCustomers({
        page: 1,
        limit: 1000,
        status: 'Active'
      });

      if (response.data) {
        const senders = response.data.filter((c: any) => c.customerType === 'Sender');
        const receivers = response.data.filter((c: any) => c.customerType === 'Receiver');
        setAvailableCustomers({ senders, receivers });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  // Fetch report data based on type
  const fetchReportData = useCallback(async () => {
    if (!selectedReportType || !dateRange[0] || !dateRange[1]) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = {
        from: format(dateRange[0], 'yyyy-MM-dd'),
        to: format(dateRange[1], 'yyyy-MM-dd'),
        ...(customerTypeFilter !== 'all' && { customerType: customerTypeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(senderFilter !== 'all' && { sender: senderFilter }),
        ...(receiverFilter !== 'all' && { receiver: receiverFilter })
      };

      let response;
      switch (selectedReportType) {
        case 'customers':
          response = await reportService.customers(params);
          setCustomerData(response.data || []);
          break;
        case 'containers':
          response = await reportService.containers(params);
          setContainerData(response.data?.containers || []);
          setSummaryStats(response.data?.summary || {});
          break;
        case 'delivery-partners':
          response = await reportService.deliveryPartners(params);
          setDeliveryPartnerData(response.data?.deliveryPartners || []);
          setSummaryStats(response.data?.summary || {});
          break;
        case 'pickup-partners':
          response = await reportService.pickupPartners(params);
          setPickupPartnerData(response.data?.pickupPartners || []);
          setSummaryStats(response.data?.summary || {});
          break;
        case 'bookings':
          response = await reportService.bookings(params);
          setBookingData(response.data?.bookings || []);
          setSummaryStats(response.data?.summary || {});
          break;
      }

      setIsReportGenerated(true);
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      setErrorMessage(`Failed to fetch report data: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReportType, dateRange, customerTypeFilter, statusFilter, senderFilter, receiverFilter]);

  // Handle generate report
  const handleGenerateReport = async () => {
    await fetchReportData();
  };

  // Handle sorting
  const handleSort = (field: string) => {
    let direction: SortDirection = 'asc';

    if (sortConfig.field === field) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      } else {
        direction = 'asc';
      }
    }

    setSortConfig({ field: direction ? field : null, direction });
  };

  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field || !sortConfig.direction) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }

    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  // Get filtered and sorted data
  const getFilteredData = useCallback(() => {
    let data: any[] = [];
    
    switch (selectedReportType) {
      case 'customers':
        data = [...customerData];
        break;
      case 'containers':
        data = [...containerData];
        break;
      case 'delivery-partners':
        data = [...deliveryPartnerData];
        break;
      case 'pickup-partners':
        data = [...pickupPartnerData];
        break;
      case 'bookings':
        data = [...bookingData];
        break;
      default:
        return [];
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter((item: any) => {
        return Object.values(item).some((value: any) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some((nestedValue: any) => 
              typeof nestedValue === 'string' && nestedValue.toLowerCase().includes(query)
            );
          }
          return false;
        });
      });
    }

    // Apply sorting
    if (sortConfig.field && sortConfig.direction) {
      data.sort((a: any, b: any) => {
        let aValue = a[sortConfig.field!];
        let bValue = b[sortConfig.field!];

        // Handle nested objects
        if (sortConfig.field!.includes('.')) {
          const fields = sortConfig.field!.split('.');
          aValue = fields.reduce((obj, field) => obj?.[field], a);
          bValue = fields.reduce((obj, field) => obj?.[field], b);
        }

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (sortConfig.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return data;
  }, [selectedReportType, customerData, containerData, deliveryPartnerData, pickupPartnerData, bookingData, searchQuery, sortConfig.field, sortConfig.direction]);

  // Update paginated data when dependencies change
  useEffect(() => {
    if (!isReportGenerated) {
      setPaginatedData([]);
      return;
    }

    const filteredData = getFilteredData();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    
    const paginatedItems = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / pagination.itemsPerPage) || 1;
    const newTotal = filteredData.length;
    
    setPaginatedData(paginatedItems);
    
    // Update pagination metadata
    setPagination(prev => ({
      ...prev,
      total: newTotal,
      totalPages
    }));
  }, [
    isReportGenerated,
    selectedReportType,
    customerData,
    containerData,
    deliveryPartnerData,
    pickupPartnerData,
    bookingData,
    searchQuery,
    sortConfig.field,
    sortConfig.direction,
    pagination.currentPage,
    pagination.itemsPerPage
  ]);

  // Update pagination totals separately to avoid infinite loops
  useEffect(() => {
    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / pagination.itemsPerPage);
    const newTotal = filteredData.length;
    
    if (pagination.total !== newTotal || pagination.totalPages !== totalPages) {
      setPagination(prev => ({
        ...prev,
        total: newTotal,
        totalPages
      }));
    }
  }, [getFilteredData, pagination.itemsPerPage, pagination.total, pagination.totalPages]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const data = getFilteredData();
    if (data.length === 0) return;

    let headers: string[] = [];
    let rows: string[][] = [];

    switch (selectedReportType) {
      case 'customers':
        headers = ['Name', 'Type', 'Phone', 'Shop Name', 'Location/Country', 'Credit', 'Total Amount', 'Balance', 'Status', 'Created Date'];
        rows = data.map((item: CustomerReportItem) => [
          item.name,
          item.customerType,
          item.phone || '',
          item.shopName || '',
          item.customerType === 'Sender' ? (item.location || '') : (item.country || ''),
          formatCurrency(item.totalCredit),
          formatCurrency(item.totalAmount),
          formatCurrency(item.balanceAmount),
          item.status,
          format(new Date(item.createdAt), 'dd MMM yyyy')
        ]);
        break;
      case 'containers':
        headers = ['Container Code', 'Company', 'Booking Date', 'Booking Charge', 'Advance Payment', 'Balance Amount', 'Status'];
        rows = data.map((item: ContainerReportItem) => [
          item.containerCode,
          item.companyName,
          format(new Date(item.bookingDate), 'dd MMM yyyy'),
          formatCurrency(item.bookingCharge),
          formatCurrency(item.advancePayment),
          formatCurrency(item.balanceAmount),
          item.status
        ]);
        break;
      case 'delivery-partners':
        headers = ['Name', 'Phone', 'Price', 'From Country', 'To Country', 'Status', 'Created Date'];
        rows = data.map((item: DeliveryPartnerReportItem) => [
          item.name,
          item.phoneNumber,
          formatCurrency(item.price),
          item.fromCountry,
          item.toCountry,
          item.status,
          format(new Date(item.createdAt), 'dd MMM yyyy')
        ]);
        break;
      case 'pickup-partners':
        headers = ['Name', 'Phone', 'Price', 'Status', 'Created Date'];
        rows = data.map((item: PickupPartnerReportItem) => [
          item.name,
          item.phoneNumber,
          formatCurrency(item.price),
          item.status,
          format(new Date(item.createdAt), 'dd MMM yyyy')
        ]);
        break;
      case 'bookings':
        headers = ['Sender', 'Receiver', 'Pickup Partner', 'Date', 'Expected Receiving', 'Bundle Count', 'Pickup Charge', 'Status'];
        rows = data.map((item: BookingReportItem) => [
          item.sender.name,
          item.receiver.name,
          typeof item.pickupPartner === 'string' ? item.pickupPartner : item.pickupPartner.name,
          format(new Date(item.date), 'dd MMM yyyy'),
          format(new Date(item.expectedReceivingDate), 'dd MMM yyyy'),
          item.bundleCount.toString(),
          typeof item.pickupPartner === 'string' ? 'N/A' : formatCurrency(item.pickupPartner.price),
          item.status
        ]);
        break;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedReportType}_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [selectedReportType, getFilteredData]);

  // Print Preview functionality
  const handlePrintPreview = useCallback(async () => {
    if (!selectedReportType || !isReportGenerated) return;

    try {
      setIsLoading(true);

      // Prepare data for print preview
      const data = getFilteredData();
      let reportTitle = '';
      let headers: string[] = [];

      switch (selectedReportType) {
        case 'customers':
          reportTitle = 'Customer Report';
          headers = ['Name', 'Type', 'Phone', 'Shop Name', 'Location/Country', 'Credit', 'Total Amount', 'Balance', 'Status', 'Created Date'];
          break;
        case 'containers':
          reportTitle = 'Container Report';
          headers = ['Container Code', 'Company', 'Booking Date', 'Booking Charge', 'Advance Payment', 'Balance Amount', 'Status'];
          break;
        case 'delivery-partners':
          reportTitle = 'Delivery Partner Report';
          headers = ['Name', 'Phone', 'Price', 'From Country', 'To Country', 'Status', 'Created Date'];
          break;
        case 'pickup-partners':
          reportTitle = 'Pickup Partner Report';
          headers = ['Name', 'Phone', 'Price', 'Status', 'Created Date'];
          break;
        case 'bookings':
          reportTitle = 'Booking Report';
          headers = ['Sender', 'Receiver', 'Pickup Partner', 'Date', 'Expected Receiving', 'Bundle Count', 'Pickup Charge', 'Status'];
          break;
      }

      // Create print data structure compatible with existing print system
      const printData = {
        [selectedReportType]: {
          title: reportTitle,
          headers: headers as any,
          data: data
        }
      };

      // Dispatch to Redux store
      dispatch(setPrintData({
        reportData: printData,
        selectedReportType: selectedReportType,
        dateRange: dateRange,
        statusMessages: {}
      } as any));

      // Navigate to print preview
      navigate('/dashboard/report/preview');
    } catch (error: any) {
      console.error('Error preparing print preview:', error);
      setErrorMessage(`Failed to prepare print preview: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReportType, isReportGenerated, getFilteredData, dateRange, dispatch, navigate]);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset filters when report type changes
  useEffect(() => {
    setCustomerTypeFilter('all');
    setStatusFilter('all');
    setSenderFilter('all');
    setReceiverFilter('all');
    setSearchQuery('');
    setIsReportGenerated(false);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [selectedReportType]);

  const isFormValid = dateRange[0] && dateRange[1] && selectedReportType;

  return (
    <div className="reports-page-container p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="min-h-[85vh] shadow-sm">
          <CardHeader className="rounded-t-lg border-b pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-blue-100 shadow-sm">
                  <ChartNoAxesCombined className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Reports</CardTitle>
                  <CardDescription className="mt-1">Generate comprehensive business reports</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}

            {/* Configuration Section */}
            <Card className="mb-6 border border-blue-100 bg-blue-50 bg-opacity-50 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    Configure Report
                  </h3>
                  <p className="text-gray-600 text-sm">Select parameters to generate your custom report</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3 items-end">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Date Range <span className="text-red-500">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!dateRange[0] ? 'text-gray-400' : ''}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange[0] ? (
                            dateRange[1] ? (
                              <>
                                {format(dateRange[0], 'dd MMM')} - {format(dateRange[1], 'dd MMM, yyyy')}
                              </>
                            ) : (
                              format(dateRange[0], 'dd MMM, yyyy')
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: dateRange[0] || undefined,
                            to: dateRange[1] || undefined,
                          }}
                          onSelect={(range) => {
                            setDateRange([range?.from || null, range?.to || null]);
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Report Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Report Type <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedReportType} onValueChange={(value: string) => setSelectedReportType(value as ReportType | '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateReport}
                    disabled={!isFormValid || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>

                {/* Additional Filters */}
                {selectedReportType && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid gap-4 md:grid-cols-4">
                      {/* Customer Type Filter (for customers and bookings) */}
                      {(selectedReportType === 'customers') && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Customer Type</label>
                          <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="Sender">Sender</SelectItem>
                              <SelectItem value="Receiver">Receiver</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Status Filter */}
                      {(selectedReportType === 'customers' || selectedReportType === 'containers' || 
                        selectedReportType === 'delivery-partners' || selectedReportType === 'pickup-partners' || 
                        selectedReportType === 'bookings') && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Status</label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              {selectedReportType === 'containers' && (
                                <>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </>
                              )}
                              {(selectedReportType === 'customers' || selectedReportType === 'delivery-partners' || 
                                selectedReportType === 'pickup-partners') && (
                                <>
                                  <SelectItem value="Active">Active</SelectItem>
                                  <SelectItem value="Inactive">Inactive</SelectItem>
                                </>
                              )}
                              {selectedReportType === 'bookings' && (
                                <>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="success">Success</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Sender Filter (for bookings) */}
                      {selectedReportType === 'bookings' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Sender</label>
                          <Select value={senderFilter} onValueChange={setSenderFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Senders</SelectItem>
                              {availableCustomers.senders.map((sender) => (
                                <SelectItem key={sender._id} value={sender._id}>
                                  {sender.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Receiver Filter (for bookings) */}
                      {selectedReportType === 'bookings' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Receiver</label>
                          <Select value={receiverFilter} onValueChange={setReceiverFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Receivers</SelectItem>
                              {availableCustomers.receivers.map((receiver) => (
                                <SelectItem key={receiver._id} value={receiver._id}>
                                  {receiver.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            {isReportGenerated && (
              <>
                {/* Summary Stats */}
                {Object.keys(summaryStats).length > 0 && (
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    {Object.entries(summaryStats).map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold">
                            {typeof value === 'number' && key.toLowerCase().includes('amount') || key.toLowerCase().includes('charge') || key.toLowerCase().includes('price') 
                              ? formatCurrency(value as number)
                              : formatNumber(value as number)
                            }
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={handlePrintPreview}
                      disabled={paginatedData.length === 0 || isLoading}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Preview
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportToCSV}
                      disabled={paginatedData.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Data Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {selectedReportType === 'customers' && (
                              <>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Name</span>
                                    {getSortIcon('name')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('customerType')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Type</span>
                                    {getSortIcon('customerType')}
                                  </div>
                                </TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('totalCredit')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Credit</span>
                                    {getSortIcon('totalCredit')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('totalAmount')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Total Amount</span>
                                    {getSortIcon('totalAmount')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('balanceAmount')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Balance</span>
                                    {getSortIcon('balanceAmount')}
                                  </div>
                                </TableHead>
                                <TableHead>Status</TableHead>
                              </>
                            )}
                            {selectedReportType === 'containers' && (
                              <>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('containerCode')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Container Code</span>
                                    {getSortIcon('containerCode')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('companyName')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Company</span>
                                    {getSortIcon('companyName')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('bookingDate')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Booking Date</span>
                                    {getSortIcon('bookingDate')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('bookingCharge')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Booking Charge</span>
                                    {getSortIcon('bookingCharge')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('advancePayment')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Advance Payment</span>
                                    {getSortIcon('advancePayment')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('balanceAmount')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Balance Amount</span>
                                    {getSortIcon('balanceAmount')}
                                  </div>
                                </TableHead>
                                <TableHead>Status</TableHead>
                              </>
                            )}
                            {selectedReportType === 'delivery-partners' && (
                              <>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Name</span>
                                    {getSortIcon('name')}
                                  </div>
                                </TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Price</span>
                                    {getSortIcon('price')}
                                  </div>
                                </TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Created Date</span>
                                    {getSortIcon('createdAt')}
                                  </div>
                                </TableHead>
                              </>
                            )}
                            {selectedReportType === 'pickup-partners' && (
                              <>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Name</span>
                                    {getSortIcon('name')}
                                  </div>
                                </TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Price</span>
                                    {getSortIcon('price')}
                                  </div>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Created Date</span>
                                    {getSortIcon('createdAt')}
                                  </div>
                                </TableHead>
                              </>
                            )}
                            {selectedReportType === 'bookings' && (
                              <>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('sender.name')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Sender</span>
                                    {getSortIcon('sender.name')}
                                  </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('receiver.name')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Receiver</span>
                                    {getSortIcon('receiver.name')}
                                  </div>
                                </TableHead>
                                <TableHead>Pickup Partner</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Booking Date</span>
                                    {getSortIcon('date')}
                                  </div>
                                </TableHead>
                                <TableHead>Expected Receiving</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('bundleCount')}>
                                  <div className="flex items-center space-x-1">
                                    <span>Bundle Count</span>
                                    {getSortIcon('bundleCount')}
                                  </div>
                                </TableHead>
                                <TableHead>Pickup Charge</TableHead>
                                <TableHead>Status</TableHead>
                              </>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.map((item: any) => (
                            <TableRow key={item._id}>
                              {selectedReportType === 'customers' && (
                                <>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>
                                    <Badge variant={item.customerType === 'Sender' ? 'default' : 'secondary'}>
                                      {item.customerType}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {item.phone && <div>📞 {item.phone}</div>}
                                      {item.whatsappNumber && <div>💬 {item.whatsappNumber}</div>}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {item.shopName && <div className="font-medium">{item.shopName}</div>}
                                      <div>{item.customerType === 'Sender' ? item.location : item.country}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{formatCurrency(item.totalCredit)}</TableCell>
                                  <TableCell>{formatCurrency(item.totalAmount)}</TableCell>
                                  <TableCell>
                                    <span className={item.balanceAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {formatCurrency(item.balanceAmount)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                </>
                              )}
                              {selectedReportType === 'containers' && (
                                <>
                                  <TableCell className="font-medium">{item.containerCode}</TableCell>
                                  <TableCell>{item.companyName}</TableCell>
                                  <TableCell>{format(new Date(item.bookingDate), 'dd MMM yyyy')}</TableCell>
                                  <TableCell>{formatCurrency(item.bookingCharge)}</TableCell>
                                  <TableCell>{formatCurrency(item.advancePayment)}</TableCell>
                                  <TableCell>
                                    <span className={item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                                      {formatCurrency(item.balanceAmount)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        item.status === 'completed' ? 'default' :
                                        item.status === 'confirmed' ? 'secondary' :
                                        item.status === 'cancelled' ? 'destructive' : 'outline'
                                      }
                                    >
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                </>
                              )}
                              {selectedReportType === 'delivery-partners' && (
                                <>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>{item.phoneNumber}</TableCell>
                                  <TableCell>{formatCurrency(item.price)}</TableCell>
                                  <TableCell>{item.fromCountry} → {item.toCountry}</TableCell>
                                  <TableCell>
                                    <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{format(new Date(item.createdAt), 'dd MMM yyyy')}</TableCell>
                                </>
                              )}
                              {selectedReportType === 'pickup-partners' && (
                                <>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>{item.phoneNumber}</TableCell>
                                  <TableCell>{formatCurrency(item.price)}</TableCell>
                                  <TableCell>
                                    <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{format(new Date(item.createdAt), 'dd MMM yyyy')}</TableCell>
                                </>
                              )}
                              {selectedReportType === 'bookings' && (
                                <>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div className="font-medium">{item.sender.name}</div>
                                      {item.sender.location && <div className="text-gray-500">{item.sender.location}</div>}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div className="font-medium">{item.receiver.name}</div>
                                      {item.receiver.country && <div className="text-gray-500">{item.receiver.country}</div>}
                                      {item.receiverBranch && <div className="text-blue-600">Branch: {item.receiverBranch}</div>}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {typeof item.pickupPartner === 'string' 
                                          ? item.pickupPartner 
                                          : item.pickupPartner.name}
                                      </div>
                                      {typeof item.pickupPartner !== 'string' && (
                                        <div className="text-gray-500">{item.pickupPartner.phoneNumber}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>{format(new Date(item.date), 'dd MMM yyyy')}</TableCell>
                                  <TableCell>{format(new Date(item.expectedReceivingDate), 'dd MMM yyyy')}</TableCell>
                                  <TableCell>{item.bundleCount}</TableCell>
                                  <TableCell>
                                    {typeof item.pickupPartner === 'string' ? 'N/A' : formatCurrency(item.pickupPartner.price)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={item.status === 'success' ? 'default' : 'secondary'}>
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="text-sm text-gray-500">
                          Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.total)} of{' '}
                          {pagination.total} results
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                            disabled={pagination.currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm">
                            Page {pagination.currentPage} of {pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            disabled={pagination.currentPage === pagination.totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedReports;