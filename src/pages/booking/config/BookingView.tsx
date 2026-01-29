import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Package,
  Users,
  Truck,
  Edit,
  Loader2,
  Building,
  Phone,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bookingService, type Booking } from '@/services/bookingService';

export default function BookingView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchBooking = async () => {
        try {
          setIsLoading(true);
          const response = await bookingService.getBooking(id);
          setBooking(response.data);
        } catch (error) {
          console.error('Error fetching booking:', error);
          toast.error('Failed to load booking data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id]);

  // Status badge component
  const StatusBadge: React.FC<{ status: 'pending' | 'success' }> = ({ status }) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      success: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
      <Badge className={`${variants[status]} border text-sm px-3 py-1`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Package className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700">Booking not found</p>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/bookings')}
          className="mt-4"
        >
          Back to Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/bookings')}
              className="hover:bg-blue-100 transition-colors duration-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                <p className="text-gray-600">View booking information</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/dashboard/bookings/edit/${booking._id}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Booking
          </Button>
        </div>

        {/* Status and Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Booking Information</CardTitle>
              <StatusBadge status={booking.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700 font-medium">Booking Code</p>
              <p className="text-xl font-bold text-blue-900" id="booking-code-display">
                {booking.bookingCode}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-medium">{formatDate(booking.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Expected Receiving Date</p>
                    <p className="font-medium">{formatDate(booking.expectedReceivingDate)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Bundle Count</p>
                    <p className="font-medium text-lg">{booking.bundleCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Repacking Status</p>
                    <Badge className={`${booking.repacking === 'repacking-required' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'} border`}>
                      {booking.repacking === 'repacking-required' ? 'Repacking Required' : 'Ready to Ship'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">{booking.createdAt ? formatDateTime(booking.createdAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Sender Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-lg">{booking.sender.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Type</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {booking.sender.customerType}
                  </Badge>
                </div>
                {/* Additional sender details if available */}
                {(booking.sender as any).location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{(booking.sender as any).location}</p>
                    </div>
                  </div>
                )}
                {(booking.sender as any).phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{(booking.sender as any).phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Receiver Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Receiver Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-lg">{booking.receiver.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Type</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {booking.receiver.customerType}
                  </Badge>
                </div>
                {booking.receiverBranch && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Selected Branch</p>
                      <p className="font-medium">{booking.receiverBranch}</p>
                    </div>
                  </div>
                )}
                {/* Additional receiver details if available */}
                {(booking.receiver as any).country && (
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">{(booking.receiver as any).country}</p>
                  </div>
                )}
                {(booking.receiver as any).address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{(booking.receiver as any).address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pickup Partner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-500" />
              Transport Partner Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Partner Name</p>
                <p className="font-medium text-lg">
                  {typeof booking.pickupPartner === 'string'
                    ? booking.pickupPartner
                    : booking.pickupPartner.name}
                </p>
              </div>
              {typeof booking.pickupPartner !== 'string' && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{booking.pickupPartner.phoneNumber}</p>
                  </div>
                </div>
              )}
              {typeof booking.pickupPartner !== 'string' && booking.pickupPartner.price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup Charge</p>
                    <p className="font-medium">${booking.pickupPartner.price}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Receiver Branches (if available) */}
        {booking.receiver.branches && booking.receiver.branches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-500" />
                Available Receiver Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.receiver.branches.map((branch, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${branch.branchName === booking.receiverBranch
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{branch.branchName}</p>
                        {branch.branchName === booking.receiverBranch && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            Selected
                          </Badge>
                        )}
                      </div>
                      {branch.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {branch.location}
                        </p>
                      )}
                      {branch.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {branch.phone}
                        </p>
                      )}
                      {branch.contactPerson && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {branch.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}