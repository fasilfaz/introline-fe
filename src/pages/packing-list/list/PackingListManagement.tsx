import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { packingListService, type PackingList } from '@/services/packingListService';
import toast from 'react-hot-toast';
import type { PaginationMeta } from '@/types/backend';

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export const PackingListManagement = () => {
  const navigate = useNavigate();
  const [packingLists, setPackingLists] = useState<PackingList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ field: string | null; order: 'asc' | 'desc' | null }>({ field: null, order: null });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [packingListToDelete, setPackingListToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPackingLists = useCallback(async (page?: number) => {
    setLoading(true);
    try {
      const response = await packingListService.list({
        page: page ?? pagination.page,
        limit: pagination.limit,
        packingStatus: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      });
      setPackingLists(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error('Failed to load packing lists', error);
      toast.error('Unable to load packing lists');
      setPackingLists([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter]);

  useEffect(() => {
    loadPackingLists(1);
  }, [searchQuery, statusFilter]);

  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        const nextOrder = prev.order === 'asc' ? 'desc' : prev.order === 'desc' ? null : 'asc';
        return { field: nextOrder ? field : null, order: nextOrder };
      }
      return { field, order: 'asc' };
    });
  };

  const sortedLists = useMemo(() => {
    if (!sortConfig.field || !sortConfig.order) return packingLists;
    const sorted = [...packingLists].sort((a, b) => {
      const valueA = (a as any)[sortConfig.field!];
      const valueB = (b as any)[sortConfig.field!];

      if (valueA === valueB) return 0;
      if (valueA == null || valueB == null) return valueA == null ? -1 : 1;
      const comparator = valueA > valueB ? 1 : -1;
      return sortConfig.order === 'asc' ? comparator : -comparator;
    });
    return sorted;
  }, [packingLists, sortConfig]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    const targetPage = direction === 'next' ? pagination.page + 1 : pagination.page - 1;
    if (targetPage < 1 || targetPage > pagination.totalPages) return;
    loadPackingLists(targetPage);
  };

  const handleView = (id: string) => {
    navigate(`/dashboard/packing-lists/view/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/packing-lists/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/dashboard/packing-lists/create');
  };

  const handleDeleteClick = (id: string) => {
    setPackingListToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packingListToDelete) return;

    setIsDeleting(true);
    try {
      await packingListService.delete(packingListToDelete);
      toast.success('Packing list deleted successfully');
      setShowDeleteDialog(false);
      setPackingListToDelete(null);
      loadPackingLists(pagination.page);
    } catch (error: any) {
      console.error('Failed to delete packing list', error);
      const errorMessage = error?.message || 'Unable to delete packing list';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Packing Lists
            </CardTitle>
            <CardDescription>
              Manage packing lists for bookings with detailed tracking information
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Create Packing List
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by packing list code or packed by..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    loadPackingLists(1);
                  }
                }}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('packingListCode')} className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Packing List Code
                      {sortConfig.field === 'packingListCode'
                        ? sortConfig.order === 'asc'
                          ? <ArrowUp className="h-4 w-4" />
                          : <ArrowDown className="h-4 w-4" />
                        : <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead>Booking Reference</TableHead>
                  <TableHead>Packed By</TableHead>
                  <TableHead>Bundle Count</TableHead>
                  <TableHead>Weight (Net/Gross)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading packing lists...
                    </TableCell>
                  </TableRow>
                ) : sortedLists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No packing lists found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLists.map((packingList, index) => {
                    const packingListId = packingList.id ?? packingList._id ?? `packing-${index}`;
                    return (
                      <TableRow key={packingListId}>
                        <TableCell className="font-medium">{packingList.packingListCode}</TableCell>
                        <TableCell>
                          {packingList.bookingReference ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                {packingList.bookingReference.sender?.name} → {packingList.bookingReference.receiver?.name}
                              </div>
                              <div className="text-muted-foreground">
                                {packingList.bookingReference.bundleCount} bundles
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{packingList.packedBy}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Planned: {packingList.plannedBundleCount}</div>
                            <div>Actual: {packingList.actualBundleCount}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Net: {packingList.netWeight} kg</div>
                            <div>Gross: {packingList.grossWeight} kg</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(packingList.packingStatus)}`}>
                            {packingList.packingStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(packingListId)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(packingListId)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(packingListId)}
                              title="Delete"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePageChange('prev')} disabled={!pagination.hasPrevPage}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePageChange('next')} disabled={!pagination.hasNextPage}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Packing List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this packing list? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};