import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, X, Calendar, Package, User, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { billService, type Bill } from '@/services/billService';
import toast from 'react-hot-toast';

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'generated':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'paid':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

export const BillView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      loadBill();
    }
  }, [id]);

  const loadBill = async () => {
    try {
      setLoading(true);
      const response = await billService.get(id!);
      setBill(response.data);
    } catch (error: any) {
      console.error('Error loading bill:', error);
      toast.error(error?.message || 'Failed to load bill');
      navigate('/dashboard/bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.open(`/bill-print/${id}`, '_blank');
  };

  const handleCancelBill = async () => {
    if (!window.confirm('Are you sure you want to cancel this bill? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelling(true);
      await billService.cancel(id!);
      toast.success('Bill cancelled successfully');
      loadBill(); // Refresh the bill data
    } catch (error: any) {
      console.error('Error cancelling bill:', error);
      toast.error(error?.message || 'Failed to cancel bill');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">Bill not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/bills')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bill Details</h1>
            <p className="text-muted-foreground">
              View details for bill {bill.billNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {bill.status !== 'cancelled' && bill.status !== 'paid' && (
            <Button 
              variant="outline" 
              onClick={handleCancelBill}
              disabled={cancelling}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              {cancelling ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Bill
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bill Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Bill Information</CardTitle>
              <Badge className={getStatusBadgeVariant(bill.status)}>
                {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Bill Number</h3>
                <p className="text-lg font-semibold">{bill.billNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Generated At</h3>
                <p>{new Date(bill.generatedAt).toLocaleDateString()} {new Date(bill.generatedAt).toLocaleTimeString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">LR Number</h3>
                <p className="font-medium">{bill.lrNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Delivery Charge</h3>
                <p className="text-lg font-semibold text-green-600">₹{bill.deliveryCharge.toFixed(2)}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                <p className="text-2xl font-bold text-primary">₹{bill.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Status Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">Generated</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(bill.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {bill.paidAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium">Paid</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bill.paidAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {bill.cancelledAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-sm font-medium">Cancelled</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bill.cancelledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bundle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bundle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Bundle Number</h3>
              <p className="font-medium">{bill.bundle.bundleNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p>{bill.bundle.description || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
              <p>{bill.bundle.quantity}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Packing List</h3>
              <p>{bill.bundle.packingList.packingListCode}</p>
            </div>
            {bill.bundle.netWeight && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Net Weight</h3>
                <p>{bill.bundle.netWeight} kg</p>
              </div>
            )}
            {bill.bundle.grossWeight && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Gross Weight</h3>
                <p>{bill.bundle.grossWeight} kg</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      {bill.bundle.products && bill.bundle.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Products included in bundle {bill.bundle.bundleNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Product Name</th>
                    <th className="text-left p-3 font-medium">Quantity</th>
                    <th className="text-left p-3 font-medium">Fabric</th>
                    <th className="text-left p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.bundle.products.map((product, index) => (
                    <tr key={product.id || index} className="border-t">
                      <td className="p-3 font-medium">{product.productName || 'Unnamed Product'}</td>
                      <td className="p-3">{product.productQuantity || 0}</td>
                      <td className="p-3">{product.fabric || '-'}</td>
                      <td className="p-3">{product.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Total Products: {bill.bundle.products.length}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Information */}
      {bill.bundle.packingList.bookingReference && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bill.bundle.packingList.bookingReference.sender && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 text-primary">Sender</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{bill.bundle.packingList.bookingReference.sender.name}</p>
                    </div>
                    {bill.bundle.packingList.bookingReference.sender.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{bill.bundle.packingList.bookingReference.sender.phone}</p>
                      </div>
                    )}
                    {bill.bundle.packingList.bookingReference.sender.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{bill.bundle.packingList.bookingReference.sender.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {bill.bundle.packingList.bookingReference.receiver && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 text-primary">Receiver</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{bill.bundle.packingList.bookingReference.receiver.name}</p>
                    </div>
                    {bill.bundle.packingList.bookingReference.receiver.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{bill.bundle.packingList.bookingReference.receiver.phone}</p>
                      </div>
                    )}
                    {bill.bundle.packingList.bookingReference.receiver.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{bill.bundle.packingList.bookingReference.receiver.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Partner Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Partner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="font-medium">{bill.deliveryPartner.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
              <p>{bill.deliveryPartner.phoneNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">From Country</h3>
              <p>{bill.deliveryPartner.fromCountry}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">To Country</h3>
              <p>{bill.deliveryPartner.toCountry}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};