import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Container as ContainerIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building,
  // DollarSign,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { containerService, type Container, type ListContainersParams } from '@/services/containerService';

const ITEMS_PER_PAGE = 10;

export const ContainerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteContainerId, setDeleteContainerId] = useState<string | null>(null);

  // Fetch containers
  const fetchContainers = async () => {
    try {
      setLoading(true);
      const params: ListContainersParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await containerService.listContainers(params);
      setContainers(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching containers:', error);
      toast.error('Failed to fetch containers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [currentPage, searchTerm, statusFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await containerService.deleteContainer(id);
      toast.success('Container deleted successfully');
      fetchContainers();
    } catch (error) {
      console.error('Error deleting container:', error);
      toast.error('Failed to delete container');
    } finally {
      setDeleteContainerId(null);
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: Container['status'] }> = ({ status }) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Pagination component
  const Pagination: React.FC = () => (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-gray-700">
        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)} to{' '}
        {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="min-h-[85vh] shadow-sm">
          <CardHeader className="rounded-t-lg border-b pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-blue-100 shadow-sm">
                  <ContainerIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    Container Management
                  </CardTitle>
                  <p className="text-gray-600 mt-1">Manage your container bookings</p>
                </div>
              </div>
              <Button onClick={() => navigate('/dashboard/containers/create')} className="transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Create Container
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search containers..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-1 sm:flex-none">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Container Code</TableHead>
                    <TableHead className="font-semibold">Company Name</TableHead>
                    <TableHead className="font-semibold">Stuffing Date</TableHead>
                    <TableHead className="font-semibold">Booking Charge</TableHead>
                    <TableHead className="font-semibold">Advance Payment</TableHead>
                    <TableHead className="font-semibold">Balance Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-center font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-2"></div>
                          Loading containers...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : containers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <ContainerIcon className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-gray-500">No containers found</p>
                          <p className="text-sm text-gray-400">Create your first container to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    containers.map((container) => (
                      <TableRow key={container._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium font-mono">
                          {container.containerCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            {container.companyName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(container.bookingDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* <DollarSign className="h-4 w-4 " /> */}
                            <span className="font-medium ">
                              {formatCurrency(container.bookingCharge)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* <DollarSign className="h-4 w-4 " /> */}
                            <span className="font-medium ">
                              {formatCurrency(container.advancePayment)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* <DollarSign className="h-4 w-4 text-orange-600" /> */}
                            <span className="font-medium ">
                              {formatCurrency(container.balanceAmount)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={container.status} />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/dashboard/containers/view/${container._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/dashboard/containers/edit/${container._id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeleteContainerId(container._id!)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {!loading && containers.length > 0 && (
              <div className="border-t p-4">
                <Pagination />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteContainerId} onOpenChange={() => setDeleteContainerId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Container</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this container? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => deleteContainerId && handleDelete(deleteContainerId)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};