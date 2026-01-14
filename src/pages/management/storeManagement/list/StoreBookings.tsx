import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Eye,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bookingService, type Booking, type ListBookingsParams } from '@/services/bookingService';

const ITEMS_PER_PAGE = 10;

export const StoreBookings: React.FC = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch bookings for India Store with success status
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params: ListBookingsParams = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: searchTerm || undefined,
                status: 'success', // Hardcoded as per requirement
                sortBy: 'createdAt',
                sortOrder: 'desc',
            };

            const response = await bookingService.listBookings(params);

            // Filter for India Store specifically if not already filtered by backend
            // Assuming 'receiverBranch' or 'receiver' name contains 'India'
            const allSuccessfulBookings = response.data || [];
            const indiaStoreBookings = allSuccessfulBookings.filter(booking =>
                (booking.receiverBranch?.toLowerCase().includes('india')) ||
                (booking.receiver?.name?.toLowerCase().includes('india'))
            );

            setBookings(indiaStoreBookings);
            setTotalPages(response.meta?.totalPages || 1);
            setTotalItems(indiaStoreBookings.length);
        } catch (error) {
            console.error('Error fetching store bookings:', error);
            toast.error('Failed to fetch store bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [currentPage, searchTerm]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
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
                                        India Store Bookings
                                    </CardTitle>
                                    <p className="text-gray-600 mt-1">Viewing successful bookings for India store</p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <div className="mb-6 space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search successful bookings..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Sender</TableHead>
                                        <TableHead className="font-semibold">Receiver</TableHead>
                                        <TableHead className="font-semibold">Branch</TableHead>
                                        <TableHead className="font-semibold">Pickup Partner</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Expected Date</TableHead>
                                        <TableHead className="font-semibold">Bundles</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="text-center font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                <div className="flex items-center justify-center">
                                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-2"></div>
                                                    Loading bookings...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : bookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <Calendar className="h-12 w-12 text-gray-400 mb-2" />
                                                    <p className="text-gray-500">No successful bookings found for India store</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bookings.map((booking) => (
                                            <TableRow key={booking._id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {booking.sender.name}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {booking.receiver.name}
                                                </TableCell>
                                                <TableCell>
                                                    {booking.receiverBranch || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {booking.pickupPartner.name}
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
                                                    <StatusBadge status={booking.status} />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => navigate(`/dashboard/bookings/view/${booking._id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
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
            </div>
        </div>
    );
};

export default StoreBookings;
