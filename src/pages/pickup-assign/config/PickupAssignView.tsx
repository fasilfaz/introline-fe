import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ClipboardList, Calendar, Truck, Package, Edit, CheckCircle,  Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { pickupAssignService, type PickupAssign, type LRNumber } from '@/services/pickupAssignService';

export const PickupAssignView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pickupAssign, setPickupAssign] = useState<PickupAssign | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPickupAssign();
    }
  }, [id]);

  const fetchPickupAssign = async () => {
    try {
      setLoading(true);
      const response = await pickupAssignService.getPickupAssign(id!);
      setPickupAssign(response.data);
    } catch (error) {
      console.error('Error fetching pickup assignment:', error);
      toast.error('Failed to fetch pickup assignment details');
      navigate('/dashboard/pickup-assigns');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        weekday: 'long'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'Completed'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const getLRStatusBadgeColor = (status: string) => {
    return status === 'Collected'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';
  };

  const getLRStatusSummary = (lrNumbers: LRNumber[]) => {
    const collected = lrNumbers.filter(lr => lr.status === 'Collected').length;
    const total = lrNumbers.length;
    return { collected, total, percentage: total > 0 ? Math.round((collected / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!pickupAssign) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Pickup assignment not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusSummary = getLRStatusSummary(pickupAssign.lrNumbers);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/pickup-assigns')}
            className="hover:bg-blue-100 transition-colors duration-200 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </Button>
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 rounded-lg bg-blue-100">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pickup Assignment Details</h1>
              <p className="text-gray-600">View pickup assignment information</p>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/dashboard/pickup-assigns/edit/${pickupAssign._id}`)}
            className="transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Assignment
          </Button>
        </div>

        {/* Assignment Overview */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Assignment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Truck className="h-4 w-4" />
                  Transport Partner
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{pickupAssign.transportPartner?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{pickupAssign.transportPartner?.phoneNumber || ''}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Assign Date
                </div>
                <p className="font-semibold text-gray-900">{formatDate(pickupAssign.assignDate)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <CheckCircle className="h-4 w-4" />
                  Status
                </div>
                <Badge
                  variant="outline"
                  className={`font-medium ${getStatusBadgeColor(pickupAssign.status)}`}
                >
                  {pickupAssign.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Package className="h-4 w-4" />
                  LR Progress
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {statusSummary.collected}/{statusSummary.total} Collected
                  </p>
                  <p className="text-sm text-gray-500">{statusSummary.percentage}% Complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LR Numbers */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <Package className="h-5 w-5" />
              LR Numbers ({pickupAssign.lrNumbers.length})
            </CardTitle>
            <CardDescription>
              View individual LR number statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {pickupAssign.lrNumbers.map((lrNumber, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lrNumber.lrNumber}</p>
                      <p className="text-sm text-gray-500">LR Number</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className={`font-medium ${getLRStatusBadgeColor(lrNumber.status)}`}
                    >
                      {lrNumber.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Progress Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Collection Progress</span>
                <span className="text-sm font-medium text-gray-900">{statusSummary.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${statusSummary.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{statusSummary.collected} Collected</span>
                <span>{statusSummary.total - statusSummary.collected} Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Assignment Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Created Date</p>
                <p className="text-gray-900">{formatDate(pickupAssign.createdAt || '')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-gray-900">{formatDate(pickupAssign.updatedAt || '')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};