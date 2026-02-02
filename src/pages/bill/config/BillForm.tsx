import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Package, Truck, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { billService, type GenerateBillInput } from '@/services/billService';
import { readyToShipService } from '@/services/readyToShipService';
import { deliveryPartnerService } from '@/services/deliveryPartnerService';
import type { ReadyToShipBundle } from '@/services/readyToShipService';
import type { DeliveryPartner } from '@/services/deliveryPartnerService';
import toast from 'react-hot-toast';

export const BillForm = () => {
  const navigate = useNavigate();
  
  const [bundles, setBundles] = useState<ReadyToShipBundle[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [lrNumber, setLrNumber] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [loadingDeliveryPartners, setLoadingDeliveryPartners] = useState(true);

  useEffect(() => {
    loadBundles();
    loadDeliveryPartners();
  }, []);

  const loadBundles = async () => {
    try {
      setLoadingBundles(true);
      // Fetch bundles with readyToShipStatus = 'dispatched'
      const response = await readyToShipService.list({ 
        limit: 100,
        readyToShipStatus: 'dispatched'  // Only get dispatched bundles
      });
      
      setBundles(response.data);
    } catch (error) {
      console.error('Failed to load bundles', error);
      toast.error('Unable to load bundles');
    } finally {
      setLoadingBundles(false);
    }
  };

  const loadDeliveryPartners = async () => {
    try {
      setLoadingDeliveryPartners(true);
      const response = await deliveryPartnerService.listDeliveryPartners({ 
        status: 'Active',
        limit: 1000 
      });
      setDeliveryPartners(response.data);
    } catch (error) {
      console.error('Failed to load delivery partners', error);
      toast.error('Unable to load delivery partners');
    } finally {
      setLoadingDeliveryPartners(false);
    }
  };

  const handleBundleSelection = (bundleId: string, checked: boolean) => {
    if (checked) {
      setSelectedBundleIds([...selectedBundleIds, bundleId]);
    } else {
      setSelectedBundleIds(selectedBundleIds.filter(id => id !== bundleId));
    }
  };

  const handleSelectAllBundles = (checked: boolean) => {
    if (checked) {
      setSelectedBundleIds(bundles.map(b => b._id));
    } else {
      setSelectedBundleIds([]);
    }
  };

  const handleDeliveryPartnerChange = (partnerId: string) => {
    const partner = deliveryPartners.find(p => p._id === partnerId) || null;
    setSelectedDeliveryPartner(partner);
    
    // Set default delivery charge from partner
    if (partner) {
      setDeliveryCharge(partner.price.toString());
    } else {
      setDeliveryCharge('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedBundleIds.length === 0) {
      toast.error('Please select at least one bundle');
      return;
    }

    if (!selectedDeliveryPartner) {
      toast.error('Please select a delivery partner');
      return;
    }

    if (!lrNumber.trim()) {
      toast.error('Please enter LR number');
      return;
    }

    const charge = parseFloat(deliveryCharge);
    if (isNaN(charge) || charge < 0) {
      toast.error('Please enter a valid delivery charge');
      return;
    }

    try {
      setSaving(true);

      // Create one bill per selected bundle
      for (const bundleId of selectedBundleIds) {
        const payload: GenerateBillInput = {
          bundleId: bundleId,
          deliveryPartnerId: selectedDeliveryPartner._id || '',
          lrNumber: lrNumber.trim(),
          deliveryCharge: charge
        };

        await billService.generate(payload);
      }
      
      toast.success(`${selectedBundleIds.length} bill(s) generated successfully`);
      navigate('/dashboard/bills');
    } catch (error: any) {
      console.error('Failed to generate bill(s)', error);
      const errorMessage = error?.message || 'Unable to generate bill(s)';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/bills')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Generate Bill</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bundle Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Bundle Selection
              </CardTitle>
              <CardDescription>
                Select dispatched bundles to generate bill for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Bundles</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedBundleIds.length === bundles.length && bundles.length > 0}
                      onCheckedChange={handleSelectAllBundles}
                    />
                    <Label htmlFor="select-all">Select All</Label>
                  </div>
                </div>
                
                {loadingBundles ? (
                  <p className="text-sm text-muted-foreground">Loading bundles...</p>
                ) : bundles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No dispatched bundles available</p>
                ) : (
                  <div className="border rounded-lg divide-y">
                    {bundles.map((bundle) => (
                      <div key={bundle._id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`bundle-${bundle._id}`}
                            checked={selectedBundleIds.includes(bundle._id)}
                            onCheckedChange={(checked) => handleBundleSelection(bundle._id, checked as boolean)}
                          />
                          <div>
                            <div className="font-medium">{bundle.bundleNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {bundle.packingList.bookingReference?.bookingCode || 'No Booking'} • {bundle.quantity} items
                              {bundle.products && bundle.products.length > 0 && (
                                <span> • {bundle.products.length} product{bundle.products.length > 1 ? 's' : ''}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedBundleIds.length > 0 && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Selected Bundles ({selectedBundleIds.length})</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBundleIds([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {bundles
                      .filter(bundle => selectedBundleIds.includes(bundle._id))
                      .map((bundle) => (
                        <div key={bundle._id} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{bundle.bundleNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {bundle.packingList.bookingReference?.bookingCode || 'No Booking'}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBundleSelection(bundle._id, false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity:</span> {bundle.quantity}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Description:</span> {bundle.description || 'N/A'}
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-muted-foreground">Weight:</span> {bundle.netWeight || 0} kg (Net) / {bundle.grossWeight || 0} kg (Gross)
                            </div>
                            
                            {/* Product Details Section */}
                            {bundle.products && bundle.products.length > 0 && (
                              <div className="md:col-span-2 mt-2 pt-2 border-t">
                                <div className="text-xs text-muted-foreground mb-2">Products ({bundle.products.length}):</div>
                                <div className="space-y-2">
                                  {bundle.products.map((product: any, index: number) => (
                                    <div key={index} className="bg-muted/50 p-2 rounded text-sm">
                                      <div className="font-medium">{product.productName || 'Unnamed Product'}</div>
                                      <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">Quantity:</span> {product.productQuantity || 0}
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Fabric:</span> {product.fabric || 'N/A'}
                                        </div>
                                        {product.description && (
                                          <div className="col-span-2">
                                            <span className="text-muted-foreground">Description:</span> {product.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {bundle.packingList.bookingReference && (
                              <div className="md:col-span-2 mt-2 pt-2 border-t">
                                <div className="text-xs text-muted-foreground">Booking Info:</div>
                                <div className="text-sm">
                                  Sender: {bundle.packingList.bookingReference.sender?.name || 'N/A'}<br />
                                  Receiver: {bundle.packingList.bookingReference.receiver?.name || 'N/A'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bill Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryPartner">Delivery Partner *</Label>
                  <Select
                    value={selectedDeliveryPartner?._id || ''}
                    onValueChange={handleDeliveryPartnerChange}
                    disabled={loadingDeliveryPartners}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryPartners.map((partner) => (
                        <SelectItem key={partner._id} value={partner._id || ''}>
                          {partner.name} (₹{partner.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingDeliveryPartners && (
                    <p className="text-sm text-muted-foreground">Loading delivery partners...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lrNumber">LR Number *</Label>
                  <Input
                    id="lrNumber"
                    value={lrNumber}
                    onChange={(e) => setLrNumber(e.target.value)}
                    placeholder="Enter LR/tracking number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryCharge">Delivery Charge *</Label>
                  <Input
                    id="deliveryCharge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    placeholder="Enter delivery charge"
                  />
                  {selectedDeliveryPartner && (
                    <p className="text-xs text-muted-foreground">
                      Default charge: ₹{selectedDeliveryPartner.price}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Selected Bundles:</span>
                  <span className="font-medium">{selectedBundleIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-medium">
                    ₹{deliveryCharge ? parseFloat(deliveryCharge).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-lg">
                    ₹{deliveryCharge ? parseFloat(deliveryCharge).toFixed(2) : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/bills')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={saving || selectedBundleIds.length === 0 || !selectedDeliveryPartner || !lrNumber.trim()}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Generate Bill{selectedBundleIds.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};