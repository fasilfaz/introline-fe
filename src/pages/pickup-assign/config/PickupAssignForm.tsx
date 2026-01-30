import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ClipboardList, Calendar, Truck, Package, Plus, X, CheckCircle, Loader2, Save, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { pickupAssignService, type CreatePickupAssignPayload, type LRNumber } from '@/services/pickupAssignService';
import { pickupPartnerService, type PickupPartner } from '@/services/pickupPartnerService';

interface PickupAssignFormProps {
  mode: 'create' | 'edit';
}

export const PickupAssignForm: React.FC<PickupAssignFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [transportPartners, setTransportPartners] = useState<PickupPartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  const [formData, setFormData] = useState<CreatePickupAssignPayload>({
    transportPartnerId: '',
    lrNumbers: [{ lrNumber: '', status: 'Not Collected' }],
    assignDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => {
    fetchTransportPartners();
    if (mode === 'edit' && id) {
      fetchPickupAssign();
    }
  }, [mode, id]);

  const fetchTransportPartners = async () => {
    try {
      setLoadingPartners(true);
      const response = await pickupPartnerService.listPickupPartners({
        limit: 100,
        status: 'Active'
      });
      setTransportPartners(response.data);
    } catch (error) {
      console.error('Error fetching transport partners:', error);
      toast.error('Failed to fetch transport partners');
    } finally {
      setLoadingPartners(false);
    }
  };

  const fetchPickupAssign = async () => {
    try {
      setLoading(true);
      const response = await pickupAssignService.getPickupAssign(id!);
      const pickupAssign = response.data;
      setFormData({
        transportPartnerId: typeof pickupAssign.transportPartnerId === 'object'
          ? pickupAssign.transportPartnerId._id
          : pickupAssign.transportPartnerId,
        lrNumbers: pickupAssign.lrNumbers,
        assignDate: new Date(pickupAssign.assignDate).toISOString().split('T')[0],
        status: pickupAssign.status
      });
    } catch (error) {
      console.error('Error fetching pickup assignment:', error);
      toast.error('Failed to fetch pickup assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.transportPartnerId || !formData.assignDate || formData.lrNumbers.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate LR numbers
    const validLRNumbers = formData.lrNumbers.filter(lr => lr.lrNumber.trim() !== '');
    if (validLRNumbers.length === 0) {
      toast.error('Please add at least one LR number');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        lrNumbers: validLRNumbers
      };

      if (mode === 'create') {
        await pickupAssignService.createPickupAssign(submitData);
        toast.success('Pickup assignment created successfully');
      } else {
        await pickupAssignService.updatePickupAssign(id!, submitData);
        toast.success('Pickup assignment updated successfully');
      }

      navigate('/dashboard/pickup-assigns');
    } catch (error: any) {
      console.error('Error saving pickup assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to save pickup assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePickupAssignPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleLRNumberChange = (index: number, field: keyof LRNumber, value: string) => {
    const updatedLRNumbers = [...formData.lrNumbers];
    updatedLRNumbers[index] = { ...updatedLRNumbers[index], [field]: value };
    handleInputChange('lrNumbers', updatedLRNumbers);
  };

  // Auto-update status when all LR numbers are collected
  useEffect(() => {
    if (formData.lrNumbers.length > 0) {
      const allCollected = formData.lrNumbers.every(lr => lr.lrNumber.trim() !== '' && lr.status === 'Collected');
      if (allCollected && formData.status !== 'Completed') {
        setFormData(prev => ({ ...prev, status: 'Completed' }));
      } else if (!allCollected && formData.status === 'Completed') {
        // Optionally reset to Pending if not all are collected
        // setFormData(prev => ({ ...prev, status: 'Pending' }));
      }
    }
  }, [formData.lrNumbers]);

  const addLRNumber = () => {
    const newLRNumbers = [...formData.lrNumbers, { lrNumber: '', status: 'Not Collected' as const }];
    handleInputChange('lrNumbers', newLRNumbers);
  };

  const removeLRNumber = (index: number) => {
    if (formData.lrNumbers.length > 1) {
      const updatedLRNumbers = formData.lrNumbers.filter((_, i) => i !== index);
      handleInputChange('lrNumbers', updatedLRNumbers);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      navigate('/dashboard/pickup-assigns');
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardDialog(false);
    navigate('/dashboard/pickup-assigns');
  };

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
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'create' ? 'Create Pickup Assignment' : 'Edit Pickup Assignment'}
              </h1>
              <p className="text-gray-600">Assign transport partner and manage LR numbers</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Pickup Assignment Details</CardTitle>
            <CardDescription className="text-blue-600">
              {mode === 'create' ? 'Fill in the pickup assignment details below' : 'Update the pickup assignment details below'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Assignment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="transportPartnerId" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <Truck className="h-4 w-4" />
                      Transport Partner <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.transportPartnerId}
                      onValueChange={(value) => handleInputChange('transportPartnerId', value)}
                      disabled={loadingPartners}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4">
                        <SelectValue placeholder={loadingPartners ? "Loading..." : "Select transport partner"} />
                      </SelectTrigger>
                      <SelectContent>
                        {transportPartners.map((partner) => (
                          <SelectItem key={partner._id} value={partner._id!}>
                            <div className="flex flex-col">
                              <span className="font-medium">{partner.name}</span>
                              <span className="text-sm text-gray-500">{partner.phoneNumber}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="assignDate" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <Calendar className="h-4 w-4" />
                      Assign Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="assignDate"
                      type="date"
                      value={formData.assignDate}
                      onChange={(e) => handleInputChange('assignDate', e.target.value)}
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="status" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value as 'Pending' | 'Completed')}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    LR Numbers <span className="text-red-500">*</span>
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLRNumber}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add LR Number
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.lrNumbers.map((lrNumber, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <Label htmlFor={`lrNumber-${index}`} className="text-sm font-medium text-gray-700">
                          LR Number {index + 1}
                        </Label>
                        <Input
                          id={`lrNumber-${index}`}
                          value={lrNumber.lrNumber}
                          onChange={(e) => handleLRNumberChange(index, 'lrNumber', e.target.value)}
                          placeholder="Enter LR number"
                          className="mt-1"
                        />
                      </div>
                      <div className="w-40">
                        <Label htmlFor={`status-${index}`} className="text-sm font-medium text-gray-700">
                          Status
                        </Label>
                        <Select
                          value={lrNumber.status}
                          onValueChange={(value) => handleLRNumberChange(index, 'status', value as 'Collected' | 'Not Collected')}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Collected">Not Collected</SelectItem>
                            <SelectItem value="Collected">Collected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.lrNumbers.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeLRNumber(index)}
                          className="text-red-600 hover:bg-red-50 mt-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  * Required fields
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {mode === 'create' ? 'Creating...' : 'Updating...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {mode === 'create' ? <UserPlus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {mode === 'create' ? 'Create' : 'Update'}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Discard Changes Dialog */}
        <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Discard Changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes. Are you sure you want to discard them?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
                Keep Editing
              </Button>
              <Button variant="destructive" onClick={handleDiscardChanges}>
                Discard Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};