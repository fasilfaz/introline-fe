import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, DollarSign, MapPin, CheckCircle, Loader2, Save, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { priceListingService, type CreatePriceListingPayload } from '@/services/priceListingService';
import { deliveryPartnerService, type DeliveryPartner } from '@/services/deliveryPartnerService';

interface PriceListingFormProps {
  mode: 'create' | 'edit';
}

export const PriceListingForm: React.FC<PriceListingFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [formData, setFormData] = useState<CreatePriceListingPayload>({
    fromCountry: 'India',
    toCountry: '',
    deliveryPartnerId: undefined,
    amount: 0,
    status: 'Active'
  });

  useEffect(() => {
    fetchDeliveryPartners();
    if (mode === 'edit' && id) {
      fetchPriceListing();
    }
  }, [mode, id]);

  // Set selected delivery partner after both delivery partners and form data are loaded
  useEffect(() => {
    if (formData.deliveryPartnerId && deliveryPartners.length > 0) {
      const partner = deliveryPartners.find(p => p._id === formData.deliveryPartnerId);
      setSelectedDeliveryPartner(partner || null);
    } else {
      setSelectedDeliveryPartner(null);
    }
  }, [formData.deliveryPartnerId, deliveryPartners]);

  const fetchDeliveryPartners = async () => {
    try {
      const response = await deliveryPartnerService.listDeliveryPartners({ status: 'Active', limit: 100 });
      setDeliveryPartners(response.data);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
    }
  };

  const fetchPriceListing = async () => {
    try {
      setLoading(true);
      const response = await priceListingService.getPriceListing(id!);
      const priceListing = response.data;
      
      const deliveryPartnerId = typeof priceListing.deliveryPartnerId === 'string' 
        ? priceListing.deliveryPartnerId 
        : priceListing.deliveryPartnerId?._id || undefined;
      
      setFormData({
        fromCountry: priceListing.fromCountry,
        toCountry: priceListing.toCountry,
        deliveryPartnerId: deliveryPartnerId,
        amount: priceListing.amount,
        status: priceListing.status
      });
    } catch (error) {
      console.error('Error fetching price listing:', error);
      toast.error('Failed to fetch price listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromCountry.trim() || !formData.toCountry.trim() || formData.amount < 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        deliveryPartnerId: formData.deliveryPartnerId || undefined
      };
      
      if (mode === 'create') {
        await priceListingService.createPriceListing(payload);
        toast.success('Price listing created successfully');
      } else {
        await priceListingService.updatePriceListing(id!, payload);
        toast.success('Price listing updated successfully');
      }
      
      navigate('/dashboard/price-listings');
    } catch (error: any) {
      console.error('Error saving price listing:', error);
      toast.error(error.response?.data?.message || 'Failed to save price listing');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePriceListingPayload, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleDeliveryPartnerChange = (partnerId: string) => {
    const actualPartnerId = partnerId === 'none' ? '' : partnerId;
    handleInputChange('deliveryPartnerId', actualPartnerId);
    const partner = deliveryPartners.find(p => p._id === actualPartnerId);
    setSelectedDeliveryPartner(partner || null);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      navigate('/dashboard/price-listings');
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardDialog(false);
    navigate('/dashboard/price-listings');
  };

  const calculateTotal = () => {
    let total = formData.amount;
    if (selectedDeliveryPartner) {
      total += selectedDeliveryPartner.price;
    }
    return total;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/price-listings')}
            className="hover:bg-blue-100 transition-colors duration-200 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'create' ? 'Create Price Listing' : 'Edit Price Listing'}
              </h1>
              <p className="text-gray-600">Manage price listing information</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Price Listing Information</CardTitle>
            <CardDescription className="text-blue-600">
              {mode === 'create' ? 'Fill in the price listing details below' : 'Update the price listing details below'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="fromCountry" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <MapPin className="h-4 w-4" />
                      From Country <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fromCountry"
                      value={formData.fromCountry}
                      onChange={(e) => handleInputChange('fromCountry', e.target.value)}
                      placeholder="Enter from country"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="toCountry" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <MapPin className="h-4 w-4" />
                      To Country <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="toCountry"
                      value={formData.toCountry}
                      onChange={(e) => handleInputChange('toCountry', e.target.value)}
                      placeholder="Enter to country"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="deliveryPartnerId" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <MapPin className="h-4 w-4" />
                      Delivery Partner (Optional)
                    </Label>
                    <Select
                      value={formData.deliveryPartnerId || undefined}
                      onValueChange={handleDeliveryPartnerChange}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4">
                        <SelectValue placeholder="Select delivery partner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Delivery Partner</SelectItem>
                        {deliveryPartners.map((partner) => (
                          <SelectItem key={partner._id} value={partner._id!}>
                            {partner.name} - ${partner.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="amount" className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <DollarSign className="h-4 w-4" />
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount === 0 ? '' : formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      placeholder="Enter amount"
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

                  <div className="space-y-2 group">
                    <Label className="text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium">
                      <DollarSign className="h-4 w-4" />
                      Total Amount
                    </Label>
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                      <span className="text-lg font-semibold text-blue-800">${calculateTotal().toFixed(2)}</span>
                      {selectedDeliveryPartner && (
                        <div className="text-sm text-blue-600 mt-1">
                          Amount: ${formData.amount.toFixed(2)} + Delivery: ${selectedDeliveryPartner.price.toFixed(2)}
                        </div>
                      )}
                    </div>
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