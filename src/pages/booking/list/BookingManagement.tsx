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
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bookingService, type Booking, type ListBookingsParams } from '@/services/bookingService';

const ITEMS_PER_PAGE = 10;

export const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: ListBookingsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
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
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="min-h-[85vh] shadow-sm">
          <CardHeader className="rounded-t-lg border-b pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-blue-100 shadow-sm">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    Booking Management
                  </CardTitle>
                  <p className="text-gray-600 mt-1">Manage your booking records</p>
                </div>
              </div>
              <Button onClick={() => navigate('/dashboard/bookings/create')} className="transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Create Booking
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookings..."
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
                        <SelectItem value="success">Success</SelectItem>
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
                    <TableHead className="font-semibold">Booking Code</TableHead>
                    <TableHead className="font-semibold">Sender</TableHead>
                    <TableHead className="font-semibold">Receiver</TableHead>
                    <TableHead className="font-semibold">Branch</TableHead>
                    <TableHead className="font-semibold">Transport Partner</TableHead>
                    <TableHead className="font-semibold">Booking Date</TableHead>
                    <TableHead className="font-semibold">Expected Date</TableHead>
                    <TableHead className="font-semibold">Bundles</TableHead>
                    <TableHead className="font-semibold">Repacking Status</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-center font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-2"></div>
                          Loading bookings...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Calendar className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-gray-500">No bookings found</p>
                          <p className="text-sm text-gray-400">Create your first booking to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {booking.bookingCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.sender?.name || '—'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.receiver?.name || '—'}
                        </TableCell>
                        <TableCell>
                          {booking.receiverBranch || '—'}
                        </TableCell>
                        <TableCell>
                          {typeof booking.pickupPartner === 'string'
                            ? booking.pickupPartner
                            : booking.pickupPartner?.name || '—'}
                        </TableCell>
                        <TableCell>
                          {formatDate(booking.date)}
                        </TableCell>
                        <TableCell>
                          {formatDate(booking.expectedReceivingDate)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.bundleCount}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${booking.repacking === 'repacking-required' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'} border text-xs`}>
                            {booking.repacking === 'repacking-required' ? 'Repacking Required' : 'Ready to Ship'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/dashboard/bookings/view/${booking._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/dashboard/bookings/edit/${booking._id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeleteBookingId(booking._id!)}
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
    </div>
  );
};