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
  Calendar,
  Package,
  Users,
  Truck,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';
import { bookingService, type Booking, type ListBookingsParams } from '@/services/bookingService';
import { customerService } from '@/services/customerService';

const ITEMS_PER_PAGE = 10;

export const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [senderFilter, setSenderFilter] = useState('all');
  const [receiverFilter, setReceiverFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [senders, setSenders] = useState<Array<{ _id: string; name: string }>>([]);
  const [receivers, setReceivers] = useState<Array<{ _id: string; name: string }>>([]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [sendersResponse, receiversResponse] = await Promise.all([
          customerService.listCustomers({ customerType: 'Sender', limit: 1000 }),
          customerService.listCustomers({ customerType: 'Receiver', limit: 1000 })
        ]);
        
        setSenders(sendersResponse.data?.filter(c => c._id).map(c => ({ _id: c._id!, name: c.name })) || []);
        setReceivers(receiversResponse.data?.filter(c => c._id).map(c => ({ _id: c._id!, name: c.name })) || []);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: ListBookingsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sender: senderFilter !== 'all' ? senderFilter : undefined,
        receiver: receiverFilter !== 'all' ? receiverFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await bookingService.listBookings(params);
      setBookings(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchTerm, statusFilter, senderFilter, receiverFilter]);

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

  const handleSenderFilter = (value: string) => {
    setSenderFilter(value);
    setCurrentPage(1);
  };

  const handleReceiverFilter = (value: string) => {
    setReceiverFilter(value);
    setCurrentPage(1);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await bookingService.deleteBooking(id);
      toast.success('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    } finally {
      setDeleteBookingId(null);
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: 'pending' | 'success' }> = ({ status }) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      success: 'bg-green-100 text-green-800 border-green-200',
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage your booking records</p>
        </div>
        <Button onClick={() => navigate('/dashboard/bookings/create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Booking
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sender</label>
              <Select value={senderFilter} onValueChange={handleSenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Senders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Senders</SelectItem>
                  {senders.map((sender) => (
                    <SelectItem key={sender._id} value={sender._id}>
                      {sender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Receiver</label>
              <Select value={receiverFilter} onValueChange={handleReceiverFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Receivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Receivers</SelectItem>
                  {receivers.map((receiver) => (
                    <SelectItem key={receiver._id} value={receiver._id}>
                      {receiver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button
                variant="outline"
                onClick={fetchBookings}
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Pickup Partner</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Bundles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        Loading bookings...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">No bookings found</p>
                        <p className="text-sm text-gray-400">Create your first booking to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{booking.sender.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{booking.receiver.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.receiverBranch ? (
                          <span className="text-sm text-gray-600">{booking.receiverBranch}</span>
                        ) : (
                          <span className="text-sm text-gray-400">No branch</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{booking.pickupPartner.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(booking.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(booking.expectedReceivingDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{booking.bundleCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/dashboard/bookings/view/${booking._id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/dashboard/bookings/edit/${booking._id}`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteBookingId(booking._id!)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {!loading && bookings.length > 0 && (
            <div className="border-t p-4">
              <Pagination />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteBookingId} onOpenChange={() => setDeleteBookingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => deleteBookingId && handleDelete(deleteBookingId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};