import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, UserCheck, Phone, DollarSign, CheckCircle, Loader2, Save, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { pickupPartnerService, type CreatePickupPartnerPayload } from '@/services/pickupPartnerService';

interface PickupPartnerFormProps {
  mode: 'create' | 'edit';
}

export const PickupPartnerForm: React.FC<PickupPartnerFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<CreatePickupPartnerPayload>({
    name: '',
    phoneNumber: '',
    price: 0,
    status: 'Active'
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchPickupPartner();
    }
  }, [mode, id]);

  const fetchPickupPartner = async () => {
    try {
      setLoading(true);
      const response = await pickupPartnerService.getPickupPartner(id!);
      const pickupPartner = response.data;
      setFormData({
        name: pickupPartner.name,
        phoneNumber: pickupPartner.phoneNumber,
        price: pickupPartner.price,
        status: pickupPartner.status
      });
    } catch (error) {
      console.error('Error fetching pickup partner:', error);
      toast.error('Failed to fetch pickup partner details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phoneNumber.trim() || formData.price < 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (mode === 'create') {
        await pickupPartnerService.createPickupPartner(formData);
        toast.success('Pickup partner created successfully');
      } else {
        await pickupPartnerService.updatePickupPartner(id!, formData);
        toast.success('Pickup partner updated successfully');
      }
      
      navigate('/dashboard/pickup-partners');
    } catch (error: any) {
      console.error('Error saving pickup partner:', error);
      toast.error(error.response?.data?.message || 'Failed to save pickup partner');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePickupPartnerPayload, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      navigate('/dashboard/pickup-partners');
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardDialog(false);
    navigate('/dashboard/pickup-partners');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/pickup-partners')}
            className="hover:bg-blue-100 transition-colors duration-200 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'create' ? 'Create Pickup Partner' : 'Edit Pickup Partner'}
              </h1>
              <p className="text-gray-600">Manage pickup partner information</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Pickup Partner Information</CardTitle>
            <CardDescription className="text-blue-600">
              {mode === 'create' ? 'Fill in the pickup partner details below' : 'Update the pickup partner details below'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="name" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <UserCheck className="h-4 w-4" />
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter pickup partner name"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="phoneNumber" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <Phone className="h-4 w-4" />
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter phone number"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="price" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <DollarSign className="h-4 w-4" />
                      Pickup Charge per kg<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price === 0 ? '' : formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      placeholder="Enter pickup charge"
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
                      onValueChange={(value) => handleInputChange('status', value as 'Active' | 'Inactive')}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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