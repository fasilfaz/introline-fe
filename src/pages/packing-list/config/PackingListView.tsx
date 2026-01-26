import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, User, Weight, Hash, Truck, Building2, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { packingListService, type PackingList } from '@/services/packingListService';
import toast from 'react-hot-toast';

export const PackingListView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [packingList, setPackingList] = useState<PackingList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackingList = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await packingListService.get(id);
        setPackingList(response.data);
      } catch (error) {
        console.error('Failed to fetch packing list', error);
        toast.error('Failed to load packing list details');
        navigate('/dashboard/packing-lists');
      } finally {
        setLoading(false);
      }
    };

    fetchPackingList();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!packingList) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Packing list not found</h3>
        <p className="text-muted-foreground">The requested packing list could not be found.</p>
        <Button onClick={() => navigate('/dashboard/packing-lists')}>Go Back</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/packing-lists')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Packing List Details</h1>
            <p className="text-muted-foreground">View packing list information and booking details</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/dashboard/packing-lists/edit/${id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {packingList.packingListCode}
              </CardTitle>
              <CardDescription>Auto-generated packing list code</CardDescription>
            </div>
            {getStatusBadge(packingList.packingStatus)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Packed By
              </p>
              <p className="font-medium">{packingList.packedBy}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Net Weight
              </p>
              <p className="font-medium">{packingList.netWeight} kg</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Gross Weight
              </p>
              <p className="font-medium">{packingList.grossWeight} kg</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Planned Bundle Count
              </p>
              <p className="font-medium">{packingList.plannedBundleCount}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Actual Bundle Count
              </p>
              <p className="font-medium">{packingList.actualBundleCount}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created Date
              </p>
              <p className="font-medium">
                {new Date(packingList.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Reference Card */}
      {packingList.bookingReference && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Booking Reference
            </CardTitle>
            <CardDescription>Associated booking information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Sender
                  </p>
                  <p className="font-medium">
                    {packingList.bookingReference.sender?.name || 'N/A'}
                  </p>
                  {packingList.bookingReference.sender?.email && (
                    <p className="text-sm text-muted-foreground">
                      {packingList.bookingReference.sender.email}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Receiver
                  </p>
                  <p className="font-medium">
                    {packingList.bookingReference.receiver?.name || 'N/A'}
                  </p>
                  {packingList.bookingReference.receiver?.email && (
                    <p className="text-sm text-muted-foreground">
                      {packingList.bookingReference.receiver.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Pickup Partner
                  </p>
                  <p className="font-medium">
                    {packingList.bookingReference.pickupPartner?.name || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Booking Bundle Count
                  </p>
                  <p className="font-medium">
                    {packingList.bookingReference.bundleCount || 0}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Booking Date
                  </p>
                  <p className="font-medium">
                    {packingList.bookingReference.date 
                      ? new Date(packingList.bookingReference.date).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expected Receiving Date
                  </p>
                  <p className="font-medium">
                    {packingList.bookingReference.expectedReceivingDate 
                      ? new Date(packingList.bookingReference.expectedReceivingDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Booking Status</span>
                <Badge className={packingList.bookingReference.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {packingList.bookingReference.status?.toUpperCase() || 'PENDING'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {new Date(packingList.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(packingList.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};