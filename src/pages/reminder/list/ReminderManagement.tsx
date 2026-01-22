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
  Bell,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reminderService, type Reminder, type ListRemindersParams } from '@/services/reminderService';

const ITEMS_PER_PAGE = 10;

export const ReminderManagement: React.FC = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsappFilter, setWhatsappFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteReminderId, setDeleteReminderId] = useState<string | null>(null);

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const params: ListRemindersParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        whatsapp: whatsappFilter !== 'all' ? whatsappFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await reminderService.listReminders(params);
      setReminders(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [currentPage, searchTerm, whatsappFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleWhatsappFilter = (value: string) => {
    setWhatsappFilter(value);
    setCurrentPage(1);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await reminderService.deleteReminder(id);
      toast.success('Reminder deleted successfully');
      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    } finally {
      setDeleteReminderId(null);
    }
  };

  // WhatsApp badge component
  const WhatsAppBadge: React.FC<{ whatsapp: boolean }> = ({ whatsapp }) => {
    return whatsapp ? (
      <Badge className="bg-green-100 text-green-800 border-green-200 border">
        <MessageCircle className="h-3 w-3 mr-1" />
        WhatsApp
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">
        No WhatsApp
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
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    Reminder Management
                  </CardTitle>
                  <p className="text-gray-600 mt-1">Manage your reminder records</p>
                </div>
              </div>
              <Button onClick={() => navigate('/dashboard/reminders/create')} className="transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Create Reminder
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reminders..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-1 sm:flex-none">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={whatsappFilter} onValueChange={handleWhatsappFilter}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Filter by WhatsApp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">WhatsApp</SelectItem>
                        <SelectItem value="false">No WhatsApp</SelectItem>
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
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Purpose</TableHead>
                    <TableHead className="font-semibold">WhatsApp</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="text-center font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-2"></div>
                          Loading reminders...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : reminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Bell className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-gray-500">No reminders found</p>
                          <p className="text-sm text-gray-400">Create your first reminder to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reminders.map((reminder) => (
                      <TableRow key={reminder._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {formatDate(reminder.date)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={reminder.description}>
                            {reminder.description}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={reminder.purpose}>
                            {reminder.purpose}
                          </div>
                        </TableCell>
                        <TableCell>
                          <WhatsAppBadge whatsapp={reminder.whatsapp} />
                        </TableCell>
                        <TableCell>
                          {reminder.createdAt ? formatDate(reminder.createdAt) : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/dashboard/reminders/view/${reminder._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/dashboard/reminders/edit/${reminder._id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeleteReminderId(reminder._id!)}
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
            {!loading && reminders.length > 0 && (
              <div className="border-t p-4">
                <Pagination />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteReminderId} onOpenChange={() => setDeleteReminderId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Reminder</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this reminder? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => deleteReminderId && handleDelete(deleteReminderId)}
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