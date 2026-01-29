import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Container as ContainerIcon,
  Building,
  Calendar,
  DollarSign,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { containerService, type Container } from '@/services/containerService';

export default function ContainerView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [container, setContainer] = useState<Container | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchContainer();
    }
  }, [id]);

  const fetchContainer = async () => {
    try {
      setLoading(true);
      const response = await containerService.getContainer(id!);
      setContainer(response.data);
    } catch (error) {
      console.error('Error fetching container:', error);
      setError('Failed to load container data');
      toast.error('Failed to load container data');
    } finally {
      setLoading(false);
    }
  };

  // Status badge component with icons
  const StatusBadge: React.FC<{ status: Container['status'] }> = ({ status }) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      completed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Completed'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Cancelled'
      }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1 px-3 py-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading container details...</p>
      </div>
    );
  }

  if (error || !container) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">Failed to load container</p>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => navigate('/dashboard/containers')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Containers
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
              onClick={() => navigate('/dashboard/containers')}
              className="hover:bg-blue-100 transition-colors duration-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ContainerIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Container Details</h1>
                <p className="text-gray-600">View container information</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/dashboard/containers/edit/${container._id}`)}
            className="transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Container
          </Button>
        </div>

        {/* Container Information Card */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <ContainerIcon className="h-5 w-5 text-blue-600" />
                Container Information
              </CardTitle>
              <StatusBadge status={container.status} />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Building className="h-5 w-5 text-gray-500" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Container Code:</span>
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {container.containerCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Company Name:</span>
                      <span className="font-semibold text-gray-900">{container.companyName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Stuffing Date:
                      </span>
                      <span className="font-semibold text-gray-900">{formatDate(container.bookingDate)}</span>
                    </div>
                    {container.cutOffDate && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Cut Off Date:
                        </span>
                        <span className="font-semibold text-gray-900">{formatDate(container.cutOffDate)}</span>
                      </div>
                    )}
                    {container.etaCok && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          ETA COK:
                        </span>
                        <span className="font-semibold text-gray-900">{formatDate(container.etaCok)}</span>
                      </div>
                    )}
                    {container.etdCok && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          ETD COK:
                        </span>
                        <span className="font-semibold text-gray-900">{formatDate(container.etdCok)}</span>
                      </div>
                    )}
                    {container.etaJea && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          ETA JEA:
                        </span>
                        <span className="font-semibold text-gray-900">{formatDate(container.etaJea)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    Financial Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Booking Charge:</span>
                      <span className="font-bold text-gray-900 text-lg">
                        {formatCurrency(container.bookingCharge)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Advance Payment:</span>
                      <span className="font-bold text-gray-900 text-lg">
                        {formatCurrency(container.advancePayment)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 bg-gray-50 px-3 rounded-lg">
                      <span className="text-gray-700 font-semibold">Balance Amount:</span>
                      <span className="font-bold text-gray-900 text-xl">
                        {formatCurrency(container.balanceAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            {(container.createdAt || container.updatedAt) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {container.createdAt && (
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(container.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                  {container.updatedAt && (
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{new Date(container.updatedAt).toLocaleString()}</span>
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