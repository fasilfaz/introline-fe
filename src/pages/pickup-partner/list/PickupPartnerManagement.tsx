import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  DollarSign,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { pickupPartnerService, type PickupPartner, type ListPickupPartnersParams } from '@/services/pickupPartnerService';

const STATUS_OPTIONS: Array<{ value: 'Active' | 'Inactive'; label: string }> = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

type SortField = 'name' | 'phoneNumber' | 'price' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  column: SortField;
  order: SortOrder;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const SortIndicator = ({ column, sortConfig }: { column: SortField, sortConfig: SortConfig | null }) => {
  if (!sortConfig || sortConfig.column !== column) {
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  }
  if (sortConfig.order === 'asc') {
    return <ArrowUp className="h-4 w-4 text-gray-400" />;
  }
  return <ArrowDown className="h-4 w-4 text-gray-400" />;
};

export const PickupPartnerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [pickupPartners, setPickupPartners] = useState<PickupPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'createdAt', order: 'desc' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<PickupPartner | null>(null);

  // Refs to track previous values
  const prevSearchTerm = useRef(searchTerm);
  const prevStatusFilter = useRef(statusFilter);
  const prevSortConfig = useRef(sortConfig);
  const isInitialLoad = useRef(true);

  const fetchPickupPartners = useCallback(async (page: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const params: ListPickupPartnersParams = {
        page,
        limit: itemsPerPage,
        sortBy: sortConfig.column,
        sortOrder: sortConfig.order
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await pickupPartnerService.listPickupPartners(params);
      setPickupPartners(response.data);

      const totalItems = response.meta?.total || 0;
      const totalPages = response.meta?.totalPages || Math.ceil(totalItems / itemsPerPage);

      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage
      });

    } catch (err) {
      console.error('Error fetching pickup partners:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      setPickupPartners([]);
      setPagination(prev => ({ ...prev, currentPage: page, totalPages: 0, totalItems: 0 }));
      toast.error('Failed to fetch pickup partners');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, searchTerm, statusFilter, sortConfig]);

  // Handle search and filter changes with debouncing
  useEffect(() => {
    const searchChanged = prevSearchTerm.current !== searchTerm;
    const statusFilterChanged = prevStatusFilter.current !== statusFilter;
    const sortChanged = JSON.stringify(prevSortConfig.current) !== JSON.stringify(sortConfig);

    // Update refs
    prevSearchTerm.current = searchTerm;
    prevStatusFilter.current = statusFilter;
    prevSortConfig.current = sortConfig;

    // Skip initial load to prevent double fetching
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Reset to page 1 only if search/filter changed, not sort
    if (searchChanged || statusFilterChanged) {
      setCurrentPage(1);
      const handler = setTimeout(() => {
        fetchPickupPartners(1);
      }, 300); // Debounce search
      return () => clearTimeout(handler);
    }

    // For sort changes, use current page and fetch immediately
    if (sortChanged) {
      fetchPickupPartners(currentPage);
    }
  }, [searchTerm, statusFilter, sortConfig, fetchPickupPartners]);

  // Handle pagination changes
  useEffect(() => {
    if (!isInitialLoad.current) {
      fetchPickupPartners(currentPage);
    }
  }, [currentPage]);

  // Handle items per page changes
  useEffect(() => {
    if (!isInitialLoad.current) {
      setCurrentPage(1);
      fetchPickupPartners(1);
    }
  }, [itemsPerPage]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      fetchPickupPartners(1);
    }
  }, []);

  const deletePickupPartner = async () => {
    if (!partnerToDelete || !partnerToDelete._id) return;
    try {
      await pickupPartnerService.deletePickupPartner(partnerToDelete._id);
      toast.success("Pickup partner deleted successfully!");
      fetchPickupPartners(currentPage);
      setIsDeleteDialogOpen(false);
      setPartnerToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting pickup partner:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete pickup partner';
      toast.error(message);
    }
  };

  const openDeleteDialog = (partner: PickupPartner) => {
    setPartnerToDelete(partner);
    setIsDeleteDialogOpen(true);
  };

  const handleSort = (column: SortField) => {
    setSortConfig(prev => {
      if (prev && prev.column === column) {
        return { column, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { column, order: 'asc' };
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleEditClick = (partner: PickupPartner) => {
    navigate(`/dashboard/pickup-partners/edit/${partner._id}`);
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="min-h-[85vh] shadow-sm">
            <CardHeader className="rounded-t-lg border-b pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 shadow-sm">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      Pickup Partner Management
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Manage your pickup partner information and charges
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/dashboard/pickup-partners/create')}
                    className="transition-colors"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pickup Partner
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search pickup partners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value)}
                      >
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearFilters}
                      className="text-gray-700 hover:bg-gray-50"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p>Error: {error}</p>
                </div>
              )}

              <div className="rounded-lg overflow-hidden border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-50 border-gray-200">
                      <TableHead className="font-semibold">
                        <button
                          onClick={() => handleSort('name')}
                          className={`h-8 flex items-center gap-1 font-semibold cursor-pointer hover:text-blue-600 justify-start ps-2`}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Name
                          <SortIndicator column="name" sortConfig={sortConfig} />
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <button
                          onClick={() => handleSort('phoneNumber')}
                          className={`h-8 flex items-center gap-1 font-semibold cursor-pointer hover:text-blue-600 justify-start`}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Phone Number
                          <SortIndicator column="phoneNumber" sortConfig={sortConfig} />
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <button
                          onClick={() => handleSort('price')}
                          className={`h-8 flex items-center gap-1 font-semibold cursor-pointer hover:text-blue-600 justify-start`}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Pickup Charge per kg
                          <SortIndicator column="price" sortConfig={sortConfig} />
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <button
                          onClick={() => handleSort('status')}
                          className={`h-8 flex items-center gap-1 font-semibold cursor-pointer hover:text-blue-600 w-full justify-center`}
                        >
                          Status
                          <SortIndicator column="status" sortConfig={sortConfig} />
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className={`h-8 flex items-center gap-1 font-semibold cursor-pointer hover:text-blue-600 w-full justify-start`}
                        >
                          Date Added
                          <SortIndicator column="createdAt" sortConfig={sortConfig} />
                        </button>
                      </TableHead>
                      <TableHead className="text-center font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array(itemsPerPage).fill(0).map((_, index) => (
                        <TableRow key={`loading-${index}`} className="hover:bg-gray-50">
                          {Array(6).fill(0).map((_, idx) => (
                            <TableCell key={`loading-cell-${idx}`} className="text-center py-3">
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : pickupPartners.length > 0 ? (
                      pickupPartners.map((partner) => (
                        <TableRow
                          key={partner._id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="font-medium py-3">
                            {partner.name}
                          </TableCell>
                          <TableCell className="text-left">
                            {partner.phoneNumber}
                          </TableCell>
                          <TableCell className="text-left font-medium">
                            {formatCurrency(partner.price)}
                          </TableCell>
                          <TableCell className="text-left">
                            <Badge
                              variant="outline"
                              className={`font-medium ${getStatusBadgeColor(partner.status)}`}
                            >
                              {partner.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-left text-sm">
                            {formatDate(partner.createdAt || '')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditClick(partner)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => openDeleteDialog(partner)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-gray-50">
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center py-6">
                            <UserCheck className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-base font-medium">
                              {searchTerm || statusFilter !== 'all' ? 'No matching pickup partners found' : "No pickup partners added yet"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Click "Add Pickup Partner" to get started.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-6 gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Show</p>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => handleItemsPerPageChange(Number(value))}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder={itemsPerPage.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">entries</p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Showing {pagination.totalItems > 0 ? ((pagination.currentPage - 1) * pagination.itemsPerPage) + 1 : 0} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center justify-center text-sm font-medium bg-gray-100 px-3 py-1 rounded">
                      Page {pagination.currentPage} of {pagination.totalPages || 1}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0 || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Dialog for Delete */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>Are you sure you want to delete the pickup partner "{partnerToDelete?.name}"?</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setPartnerToDelete(null)}>
                    No
                  </Button>
                </DialogClose>
                <Button variant="destructive" onClick={deletePickupPartner}>
                  Yes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
};