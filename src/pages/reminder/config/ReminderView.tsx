import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Bell,
  Calendar,
  FileText,
  Target,
  MessageCircle,
  Edit,
  Loader2,
  Clock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reminderService, type Reminder } from '@/services/reminderService';

export default function ReminderView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Reminder ID is required');
      setLoading(false);
      return;
    }

    const fetchReminder = async () => {
      try {
        setLoading(true);
        const response = await reminderService.getReminder(id);
        setReminder(response.data);
      } catch (err: any) {
        console.error('Error fetching reminder:', err);
        setError('Failed to load reminder data');
        toast.error('Failed to load reminder data');
      } finally {
        setLoading(false);
      }
    };

    fetchReminder();
  }, [id]);

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // WhatsApp badge component
  const WhatsAppBadge: React.FC<{ whatsapp: boolean }> = ({ whatsapp }) => {
    return whatsapp ? (
      <Badge className="bg-green-100 text-green-800 border-green-200 border">
        <MessageCircle className="h-4 w-4 mr-1" />
        WhatsApp Enabled
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">
        WhatsApp Disabled
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading reminder details...</p>
      </div>
    );
  }

  if (error || !reminder) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/reminders')}
              className="hover:bg-blue-100 transition-colors duration-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Reminder Details</h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{error || 'Reminder not found'}</p>
                <Button
                  onClick={() => navigate('/dashboard/reminders')}
                  className="mt-4"
                >
                  Back to Reminders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/reminders')}
              className="hover:bg-blue-100 transition-colors duration-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reminder Details</h1>
                <p className="text-gray-600">View reminder information</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/dashboard/reminders/edit/${reminder._id}`)}
            className="transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Reminder
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Reminder Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Reminder Date
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(reminder.date)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  WhatsApp Notification
                </div>
                <div>
                  <WhatsAppBadge whatsapp={reminder.whatsapp} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <FileText className="h-4 w-4 text-purple-500" />
                Description
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {reminder.description}
                </p>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Target className="h-4 w-4 text-orange-500" />
                Purpose
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">
                  {reminder.purpose}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            {(reminder.createdAt || reminder.updatedAt) && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timestamps
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reminder.createdAt && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTime(reminder.createdAt)}
                      </p>
                    </div>
                  )}
                  {reminder.updatedAt && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTime(reminder.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}