import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Eye,
  Edit,
  Package,
  PackageCheck,
  Printer
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { readyToShipService } from '@/services/readyToShipService';
import { ReadyToShipBundle } from '@/services/readyToShipService';

interface ReadyToShipListPageProps { }

const ReadyToShipListPage: React.FC<ReadyToShipListPageProps> = () => {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<ReadyToShipBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10; // Fixed page size, no setter needed
  const [selectedBundle, setSelectedBundle] = useState<ReadyToShipBundle | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [shippingStatusFilter, setShippingStatusFilter] = useState<string>('all');

  const fetchBundles = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await readyToShipService.list({
        page,
        limit: pageSize,
        search,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        readyToShipStatus: shippingStatusFilter !== 'all' ? shippingStatusFilter : undefined
      });

      // Update according to the actual API response structure
      setBundles(response.data);
      // For pagination, we need to calculate from the response if possible
      // Or fetch separately if needed
      const statsResponse = await readyToShipService.getStats();
      setTotalItems(statsResponse.data.totalBundles || 0);
      setTotalPages(Math.ceil((statsResponse.data.totalBundles || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching ready to ship bundles:', error);
      toast.error('Failed to fetch ready to ship bundles', {
        description: 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles(currentPage, searchTerm);
  }, [currentPage, searchTerm, pageSize]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleView = (bundle: ReadyToShipBundle) => {
    setSelectedBundle(bundle);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (bundle: ReadyToShipBundle) => {
    navigate(`/dashboard/ready-to-ship/edit/${bundle._id}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ready to Ship</h1>
          <p className="text-muted-foreground mt-1">
            View and manage bundles that are ready for shipping
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto justify-end">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={shippingStatusFilter} onValueChange={setShippingStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Shipping Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="stuffed">Stuffed</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
              </SelectContent>
            </Select>
            <Button
            className="w-full sm:w-auto"
              variant="outline"
              onClick={() => navigate('/ready-to-ship-print')}
            >
              <Printer className="h-4 w-4" />
              Print All
            </Button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bundles..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Ready to Ship Bundles</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {bundles.length} of {totalItems} completed bundles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <PackageCheck className="h-3 w-3" />
              {totalItems} Ready to Ship
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-muted-foreground">No bundles found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm
                  ? 'No bundles match your search.'
                  : 'There are no completed bundles ready to ship yet.'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bundle Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Net Weight</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Shipping Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundles.map((bundle) => (
                    <TableRow key={bundle._id}>
                      <TableCell className="font-medium">{bundle.bundleNumber}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={bundle.description || ''}>
                          {bundle.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{bundle.quantity}</TableCell>
                      <TableCell>{bundle.netWeight ? `${bundle.netWeight} kg` : '-'}</TableCell>
                      <TableCell>
                        {bundle.bundleType ? (
                          <Badge 
                            className={
                              bundle.bundleType === 'box' 
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                                : 'bg-green-100 text-green-800 hover:bg-green-100'
                            }
                          >
                            {bundle.bundleType.charAt(0).toUpperCase() + bundle.bundleType.slice(1)}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(bundle.status)}>
                          {bundle.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(bundle.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(bundle)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(bundle)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Bundle Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bundle Details</DialogTitle>
          </DialogHeader>
          {selectedBundle && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Bundle Number</h3>
                  <p className="text-lg font-semibold">{selectedBundle.bundleNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge className={getStatusBadgeVariant(selectedBundle.status)}>
                    {selectedBundle.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                  <Badge
                    className={
                      selectedBundle.priority === 'high'
                        ? 'bg-red-100 text-red-800 hover:bg-red-100'
                        : selectedBundle.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          : 'bg-green-100 text-green-800 hover:bg-green-100'
                    }
                  >
                    {selectedBundle.priority.charAt(0).toUpperCase() + selectedBundle.priority.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Ready to Ship Status</h3>
                  <Badge
                    className={
                      selectedBundle.readyToShipStatus === 'pending'
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        : selectedBundle.readyToShipStatus === 'stuffed'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          : 'bg-green-100 text-green-800 hover:bg-green-100'
                    }
                  >
                    {selectedBundle.readyToShipStatus.charAt(0).toUpperCase() + selectedBundle.readyToShipStatus.slice(1)}
                  </Badge>
                </div>
              </div>

              {selectedBundle.container && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Container</h3>
                  <p className="text-lg font-semibold">{selectedBundle.container.containerCode}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{selectedBundle.description || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                  <p>{selectedBundle.quantity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Actual Count</h3>
                  <p>{selectedBundle.actualCount || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Net Weight</h3>
                  <p>{selectedBundle.netWeight ? `${selectedBundle.netWeight} kg` : '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Gross Weight</h3>
                  <p>{selectedBundle.grossWeight ? `${selectedBundle.grossWeight} kg` : '-'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Products</h3>
                <div className="mt-2 border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Fabric</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBundle.products && selectedBundle.products.length > 0 ? (
                        selectedBundle.products.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{product.productName}</TableCell>
                            <TableCell>{product.productQuantity}</TableCell>
                            <TableCell>{product.fabric || '-'}</TableCell>
                            <TableCell>{product.description || '-'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No products in this bundle
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p>{formatDate(selectedBundle.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
                  <p>{formatDate(selectedBundle.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default ReadyToShipListPage;