import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Package, 
  Weight,
  Ruler,
} from 'lucide-react';

import { readyToShipService } from '@/services/readyToShipService';
import { ReadyToShipBundle } from '@/services/readyToShipService';

interface ReadyToShipViewPageProps {}

const ReadyToShipViewPage: React.FC<ReadyToShipViewPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [bundle, setBundle] = useState<ReadyToShipBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBundle = async () => {
      try {
        setLoading(true);
        const response = await readyToShipService.get(id);
        setBundle(response.data);
      } catch (err) {
        console.error('Error fetching bundle:', err);
        setError('Failed to fetch bundle details');
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'pending':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Bundle Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested bundle could not be found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bundle Details</h1>
          <p className="text-muted-foreground mt-1">
            View details for bundle {bundle.bundleNumber}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Bundle Information</CardTitle>
            <Badge className={getStatusBadgeVariant(bundle.status)}>
              {bundle.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Bundle Number</h3>
                <p className="text-lg font-semibold">{bundle.bundleNumber}</p>
              </div>
                            
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{bundle.description || '-'}</p>
              </div>
                            
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <Badge className={getStatusBadgeVariant(bundle.status)}>
                  {bundle.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
                            
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                <Badge 
                  className={
                    bundle.priority === 'high' 
                      ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                      : bundle.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                        : 'bg-green-100 text-green-800 hover:bg-green-100'
                  }
                >
                  {bundle.priority.charAt(0).toUpperCase() + bundle.priority.slice(1)}
                </Badge>
              </div>
                            
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Ready to Ship Status</h3>
                <Badge 
                  className={
                    bundle.readyToShipStatus === 'pending' 
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' 
                      : bundle.readyToShipStatus === 'stuffed'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : 'bg-green-100 text-green-800 hover:bg-green-100'
                  }
                >
                  {bundle.readyToShipStatus.charAt(0).toUpperCase() + bundle.readyToShipStatus.slice(1)}
                </Badge>
              </div>
              
              {bundle.bundleType && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Bundle Type</h3>
                  <Badge 
                    className={
                      bundle.bundleType === 'box' 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                        : 'bg-green-100 text-green-800 hover:bg-green-100'
                    }
                  >
                    {bundle.bundleType.charAt(0).toUpperCase() + bundle.bundleType.slice(1)}
                  </Badge>
                </div>
              )}
                            
              {bundle.container && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Container</h3>
                  <p className="text-lg font-semibold">{bundle.container.containerCode}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                  <p className="text-lg font-semibold">{bundle.quantity}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Weight className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Net Weight</h3>
                  <p className="text-lg font-semibold">{bundle.netWeight ? `${bundle.netWeight} kg` : '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Weight className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Gross Weight</h3>
                  <p className="text-lg font-semibold">{bundle.grossWeight ? `${bundle.grossWeight} kg` : '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Ruler className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Actual Count</h3>
                  <p className="text-lg font-semibold">{bundle.actualCount || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Products in Bundle</h3>
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
                  {bundle.products && bundle.products.length > 0 ? (
                    bundle.products.map((product, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 font-medium">{product.productName}</td>
                        <td className="p-3">{product.productQuantity}</td>
                        <td className="p-3">{product.fabric || '-'}</td>
                        <td className="p-3">{product.description || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-muted-foreground">
                        No products in this bundle
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p>{formatDate(bundle.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
              <p>{formatDate(bundle.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button>
          Update Bundle
        </Button>
      </div>
    </div>
  );
};

export default ReadyToShipViewPage;