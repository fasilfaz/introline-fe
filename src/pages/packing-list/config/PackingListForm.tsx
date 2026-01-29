import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { packingListService, type PackingListInput } from '@/services/packingListService';
import { bookingService, type Booking } from '@/services/bookingService';
import { storeService, type Store } from '@/services/storeService';
import toast from 'react-hot-toast';

interface ProductItem {
  id: string;
  productName: string;
  productQuantity: number;
  fabric: string;
  description: string;
}

interface BundleItem {
  bundleNumber: string;
  description?: string;
  quantity: number;
  netWeight?: number;
  grossWeight?: number;
  actualCount?: number;
  status?: 'pending' | 'in_progress' | 'completed';
  products: ProductItem[];
}



interface PackingListFormState {
  store: string;
  bookingReference: string;
  packedBy: string;
  plannedBundleCount: number;
  packingStatus: 'pending' | 'in_progress' | 'completed';
  count?: number;
  bundles: BundleItem[];
}

const DEFAULT_FORM: PackingListFormState = {
  store: '',
  bookingReference: '',
  packedBy: '',
  plannedBundleCount: 0,
  packingStatus: 'pending',
  count: 0,
  bundles: []
};

export const PackingListForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formState, setFormState] = useState<PackingListFormState>(DEFAULT_FORM);
  const [stores, setStores] = useState<Store[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStores();
    if (isEditing) {
      loadPackingList();
    }
  }, [id, isEditing]);

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      const response = await storeService.listStores({ limit: 1000 });
      setStores(response.data);
    } catch (error) {
      console.error('Failed to load stores', error);
      toast.error('Unable to load stores');
    } finally {
      setLoadingStores(false);
    }
  };

  const loadBookingsForStore = async (storeId: string) => {
    try {
      setLoadingBookings(true);
      // Since the API may not directly support filtering by store in the parameters,
      // we'll fetch all bookings and filter them by store client-side
      const response = await bookingService.listBookings({ limit: 1000 });
      const bookingsForStore = response.data.filter(booking => booking.store?._id === storeId);
      setBookings(bookingsForStore);
    } catch (error) {
      console.error('Failed to load bookings for store', error);
      toast.error('Unable to load bookings for selected store');
    } finally {
      setLoadingBookings(false);
    }
  };
  
  // Handle booking selection change
  const handleBookingChange = async (bookingId: string) => {
    handleInputChange('bookingReference', bookingId);
    
    if (bookingId) {
      try {
        const bookingResponse = await bookingService.getBooking(bookingId);
        const booking = bookingResponse.data;
        
        // Set planned bundle count from booking
        handleInputChange('plannedBundleCount', booking.bundleCount || 0);
        
        // Conditionally set packedBy based on repacking status
        if (booking.repacking === 'repacking-required') {
          // If booking has repacking status, we need to show packedBy field
          // We'll leave it as is or set a default if needed
        } else {
          // If booking doesn't have repacking status, clear packedBy
          handleInputChange('packedBy', '');
        }
      } catch (error) {
        console.error('Failed to load booking details', error);
        toast.error('Unable to load booking details');
      }
    } else {
      handleInputChange('plannedBundleCount', 0);
      handleInputChange('packedBy', '');
    }
  };

  const loadPackingList = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await packingListService.get(id);
      const packingList = response.data;
      
      if (!packingList.bookingReference) {
        throw new Error('Packing list has no booking reference');
      }
      
      // Get the booking to determine the store
      const bookingId = typeof packingList.bookingReference === 'string' 
        ? packingList.bookingReference 
        : packingList.bookingReference._id;
        
      const bookingResponse = await bookingService.getBooking(bookingId);
      const booking = bookingResponse.data;

      // Convert backend bundle items to form bundle items
      const convertedBundles: BundleItem[] = (packingList.bundles || []).map(bundle => ({
        ...bundle,
        bundleNumber: bundle.bundleNumber?.toString() || `BUNDLE-${Date.now()}-${Math.random()}`, // Safely convert to string or generate default
        products: bundle.products || [] // Initialize with existing products or empty array
      }));

      setFormState({
        store: booking.store?._id || '',
        bookingReference: bookingId,
        packedBy: packingList.packedBy,
        plannedBundleCount: packingList.plannedBundleCount,
        packingStatus: packingList.packingStatus,
        count: packingList.count,
        bundles: convertedBundles
      });
      
      // If we have a store, we should also load the bookings for that store
      if (booking.store?._id) {
        await loadBookingsForStore(booking.store._id);
      }
    } catch (error) {
      console.error('Failed to load packing list', error);
      toast.error('Unable to load packing list');
      navigate('/dashboard/packing-lists');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PackingListFormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleNumericInputChange = (field: 'plannedBundleCount' | 'count', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    setFormState(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.bookingReference) {
      toast.error('Please select a booking reference');
      return;
    }

    // Only validate packedBy if the booking has repacking status
    const selectedBooking = bookings.find(b => b._id === formState.bookingReference || b.id === formState.bookingReference);
    if (selectedBooking?.repacking === 'repacking-required' && !formState.packedBy.trim()) {
      toast.error('Please enter who packed the items');
      return;
    } else if (selectedBooking?.repacking !== 'repacking-required') {
      // If not repacking required, clear packedBy to avoid sending unnecessary data
      setFormState(prev => ({
        ...prev,
        packedBy: ''
      }));
    }



    if (formState.plannedBundleCount <= 0) {
      toast.error('Please enter a valid planned bundle count');
      return;
    }

    // Validate bundles if any are present
    if (formState.bundles.length > 0) {
      const invalidBundleIndex = formState.bundles.findIndex(bundle => 
        !bundle.bundleNumber.trim() || 
        bundle.quantity < 0 || 
        (bundle.netWeight !== undefined && bundle.netWeight < 0) ||
        (bundle.grossWeight !== undefined && bundle.grossWeight < 0) ||
        (bundle.actualCount !== undefined && bundle.actualCount < 0) ||
        bundle.products.some(product => 
          !product.productName.trim() || 
          product.productQuantity < 0
        )
      );
      
      if (invalidBundleIndex >= 0) {
        toast.error(`Please check bundle #${invalidBundleIndex + 1} - bundle number is required and all values must be valid`);
        return;
      }
    }

    try {
      setSaving(true);

      // Convert form bundle items to backend bundle items with extended properties
      const backendBundles: Array<{
        bundleNumber: string;
        description?: string;
        quantity: number;
        netWeight?: number;
        grossWeight?: number;
        actualCount?: number;
        status?: 'pending' | 'in_progress' | 'completed';
        products?: Array<{
          id: string;
          productName: string;
          productQuantity: number;
          fabric: string;
          description: string;
        }>;
      }> = formState.bundles.map(bundle => ({
        ...bundle,
        bundleNumber: bundle.bundleNumber.toString() // Ensure bundle number stays as string
      }));

      const payload: PackingListInput = {
        bookingReference: formState.bookingReference,
        packedBy: formState.packedBy.trim(),
        plannedBundleCount: formState.plannedBundleCount,
        packingStatus: formState.packingStatus,
        count: formState.count,
        // Calculate total weights from bundles
        netWeight: formState.bundles.reduce((sum, bundle) => sum + (bundle.netWeight || 0), 0),
        grossWeight: formState.bundles.reduce((sum, bundle) => sum + (bundle.grossWeight || 0), 0),
        bundles: backendBundles
      };

      if (isEditing) {
        await packingListService.update(id!, payload);
        toast.success('Packing list updated successfully');
      } else {
        await packingListService.create(payload);
        toast.success('Packing list created successfully');
      }

      navigate('/dashboard/packing-lists');
    } catch (error: any) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} packing list`, error);
      const errorMessage = error?.message || `Unable to ${isEditing ? 'update' : 'create'} packing list`;
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/packing-lists')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Packing List' : 'Create Packing List'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Packing List Details
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update the packing list information below'
                : 'Fill in the details to create a new packing list'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Row: Store and Booking Selection */}
              <div className="space-y-2">
                <Label htmlFor="store">Store *</Label>
                <select
                  id="store"
                  className="border rounded-md px-3 py-2 text-sm bg-background h-10 w-full focus:ring-2 focus:ring-primary/20"
                  value={formState.store}
                  onChange={async (e) => {
                    const storeId = e.target.value;
                    handleInputChange('store', storeId);
                    handleInputChange('bookingReference', ''); // Reset booking when store changes
                    handleInputChange('plannedBundleCount', 0); // Reset planned bundle count
                    if (storeId) {
                      await loadBookingsForStore(storeId);
                    } else {
                      setBookings([]); // Clear bookings when store is cleared
                    }
                  }}
                  disabled={loadingStores}
                  required={!isEditing}
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.name} ({store.code})
                    </option>
                  ))}
                </select>
                {loadingStores && (
                  <p className="text-sm text-muted-foreground">Loading stores...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingReference">Booking Reference *</Label>
                <select
                  id="bookingReference"
                  className="border rounded-md px-3 py-2 text-sm bg-background h-10 w-full focus:ring-2 focus:ring-primary/20"
                  value={formState.bookingReference}
                  onChange={(e) => handleBookingChange(e.target.value)}
                  disabled={loadingBookings || !formState.store}
                  required
                >
                  <option value="">Select a booking</option>
                  {bookings.map((booking) => (
                    <option key={booking._id || booking.id} value={booking._id || booking.id}>
                      {booking.bookingCode} - {booking.sender?.name} → {booking.receiver?.name} ({booking.bundleCount} bundles)
                    </option>
                  ))}
                </select>
                {(loadingBookings || !formState.store) && (
                  <p className="text-sm text-muted-foreground">
                    {formState.store 
                      ? 'Loading bookings...' 
                      : 'Please select a store first'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Second Row: Packed By and Planned Bundle Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Show Packed By only if booking has repacking status */}
              {(() => {
                const selectedBooking = bookings.find(b => b._id === formState.bookingReference || b.id === formState.bookingReference);
                return selectedBooking?.repacking === 'repacking-required' ? (
                  <div className="space-y-2">
                    <Label htmlFor="packedBy">Packed By *</Label>
                    <Input
                      id="packedBy"
                      value={formState.packedBy}
                      onChange={(e) => handleInputChange('packedBy', e.target.value)}
                      placeholder="Enter name of person who packed"
                      required
                    />
                  </div>
                ) : null;
              })()}

              <div className="space-y-2">
                <Label htmlFor="plannedBundleCount">Planned Bundle Count</Label>
                <Input
                  id="plannedBundleCount"
                  type="number"
                  min="0"
                  value={formState.plannedBundleCount || ''}
                  onChange={(e) => handleNumericInputChange('plannedBundleCount', e.target.value)}
                  placeholder="Enter planned bundle count"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">Auto-filled from booking bundle count</p>
              </div>
            </div>

            {/* Bundle Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Bundle Information</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newBundle: BundleItem = {
                      bundleNumber: `BUNDLE-${formState.bundles.length + 1}`,
                      description: '',
                      quantity: 0,
                      netWeight: 0,
                      grossWeight: 0,
                      actualCount: 0,
                      status: 'pending',
                      products: []
                    };
                    setFormState(prev => ({
                      ...prev,
                      bundles: [...prev.bundles, newBundle]
                    }));
                  }}
                >
                  Add Bundle
                </Button>
              </div>

              {formState.bundles.length > 0 ? (
                <div className="space-y-4">
                  {formState.bundles.map((bundle, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Bundle #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormState(prev => ({
                              ...prev,
                              bundles: prev.bundles.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`bundle-number-${index}`}>Bundle Number</Label>
                          <Input
                            id={`bundle-number-${index}`}
                            value={bundle.bundleNumber || ''}
                            onChange={(e) => {
                              const updatedBundles = [...formState.bundles];
                              updatedBundles[index] = {
                                ...updatedBundles[index],
                                bundleNumber: e.target.value
                              };
                              setFormState(prev => ({
                                ...prev,
                                bundles: updatedBundles
                              }));
                            }}
                            placeholder="Bundle number"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`bundle-quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`bundle-quantity-${index}`}
                            type="number"
                            min="0"
                            value={bundle.quantity || ''}
                            onChange={(e) => {
                              const numValue = e.target.value === '' ? 0 : parseInt(e.target.value);
                              const updatedBundles = [...formState.bundles];
                              updatedBundles[index] = {
                                ...updatedBundles[index],
                                quantity: isNaN(numValue) ? 0 : numValue
                              };
                              setFormState(prev => ({
                                ...prev,
                                bundles: updatedBundles
                              }));
                            }}
                            placeholder="Quantity"
                          />
                        </div>
                        

                        
                        <div className="space-y-2">
                          <Label htmlFor={`bundle-netWeight-${index}`}>Net Weight (kg)</Label>
                          <Input
                            id={`bundle-netWeight-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={bundle.netWeight || ''}
                            onChange={(e) => {
                              const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              const updatedBundles = [...formState.bundles];
                              updatedBundles[index] = {
                                ...updatedBundles[index],
                                netWeight: isNaN(numValue) ? 0 : numValue
                              };
                              setFormState(prev => ({
                                ...prev,
                                bundles: updatedBundles
                              }));
                            }}
                            placeholder="Net weight in kg"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`bundle-grossWeight-${index}`}>Gross Weight (kg)</Label>
                          <Input
                            id={`bundle-grossWeight-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={bundle.grossWeight || ''}
                            onChange={(e) => {
                              const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              const updatedBundles = [...formState.bundles];
                              updatedBundles[index] = {
                                ...updatedBundles[index],
                                grossWeight: isNaN(numValue) ? 0 : numValue
                              };
                              setFormState(prev => ({
                                ...prev,
                                bundles: updatedBundles
                              }));
                            }}
                            placeholder="Gross weight in kg"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`bundle-actualCount-${index}`}>Actual Count</Label>
                          <Input
                            id={`bundle-actualCount-${index}`}
                            type="number"
                            min="0"
                            value={bundle.actualCount || ''}
                            onChange={(e) => {
                              const numValue = e.target.value === '' ? 0 : parseInt(e.target.value);
                              const updatedBundles = [...formState.bundles];
                              updatedBundles[index] = {
                                ...updatedBundles[index],
                                actualCount: isNaN(numValue) ? 0 : numValue
                              };
                              setFormState(prev => ({
                                ...prev,
                                bundles: updatedBundles
                              }));
                            }}
                            placeholder="Actual count"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`bundle-status-${index}`}>Status</Label>
                          <select
                            id={`bundle-status-${index}`}
                            className="border rounded-md px-3 py-2 text-sm bg-background h-10 w-full focus:ring-2 focus:ring-primary/20"
                            value={bundle.status || 'pending'}
                            onChange={(e) => {
                              const updatedBundles = [...formState.bundles];
                              updatedBundles[index] = {
                                ...updatedBundles[index],
                                status: e.target.value as 'pending' | 'in_progress' | 'completed'
                              };
                              setFormState(prev => ({
                                ...prev,
                                bundles: updatedBundles
                              }));
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`bundle-description-${index}`}>Description</Label>
                          <Input
                            id={`bundle-description-${index}`}
                            value={bundle.description || ''}
                            onChange={(e) => {
                              const updatedBundles = [...formState.bundles];
                              updatedBundles[index] = {
                                ...updatedBundles[index],
                                description: e.target.value
                              };
                              setFormState(prev => ({
                                ...prev,
                                bundles: updatedBundles
                              }));
                            }}
                            placeholder="Description"
                          />
                        </div>
                        
                        {/* Products Section */}
                        <div className="col-span-full">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">Products</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newProduct: ProductItem = {
                                    id: `product-${Date.now()}`,
                                    productName: '',
                                    productQuantity: 0,
                                    fabric: '',
                                    description: ''
                                  };
                                  const updatedBundles = [...formState.bundles];
                                  updatedBundles[index] = {
                                    ...updatedBundles[index],
                                    products: [...updatedBundles[index].products, newProduct]
                                  };
                                  setFormState(prev => ({
                                    ...prev,
                                    bundles: updatedBundles
                                  }));
                                }}
                              >
                                Add Product
                              </Button>
                            </div>
                            
                            {bundle.products.length > 0 ? (
                              <div className="space-y-4">
                                {bundle.products.map((product, productIndex) => (
                                  <div key={product.id} className="border rounded p-3 bg-muted/10">
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-medium text-sm">Product #{productIndex + 1}</h5>
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const newProduct: ProductItem = {
                                              ...product,
                                              id: `product-${Date.now()}`,
                                              productName: `${product.productName} (Copy)`
                                            };
                                            const updatedBundles = [...formState.bundles];
                                            updatedBundles[index] = {
                                              ...updatedBundles[index],
                                              products: [
                                                ...updatedBundles[index].products.slice(0, productIndex + 1),
                                                newProduct,
                                                ...updatedBundles[index].products.slice(productIndex + 1)
                                              ]
                                            };
                                            setFormState(prev => ({
                                              ...prev,
                                              bundles: updatedBundles
                                            }));
                                          }}
                                        >
                                          Copy
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const updatedBundles = [...formState.bundles];
                                            updatedBundles[index] = {
                                              ...updatedBundles[index],
                                              products: updatedBundles[index].products.filter((_, i) => i !== productIndex)
                                            };
                                            setFormState(prev => ({
                                              ...prev,
                                              bundles: updatedBundles
                                            }));
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label htmlFor={`product-name-${index}-${productIndex}`}>Product Name</Label>
                                        <Input
                                          id={`product-name-${index}-${productIndex}`}
                                          value={product.productName}
                                          onChange={(e) => {
                                            const updatedBundles = [...formState.bundles];
                                            updatedBundles[index] = {
                                              ...updatedBundles[index],
                                              products: updatedBundles[index].products.map((p, i) => 
                                                i === productIndex ? { ...p, productName: e.target.value } : p
                                              )
                                            };
                                            setFormState(prev => ({
                                              ...prev,
                                              bundles: updatedBundles
                                            }));
                                          }}
                                          placeholder="Product name"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`product-quantity-${index}-${productIndex}`}>Quantity</Label>
                                        <Input
                                          id={`product-quantity-${index}-${productIndex}`}
                                          type="number"
                                          min="0"
                                          value={product.productQuantity || ''}
                                          onChange={(e) => {
                                            const numValue = e.target.value === '' ? 0 : parseInt(e.target.value);
                                            const updatedBundles = [...formState.bundles];
                                            updatedBundles[index] = {
                                              ...updatedBundles[index],
                                              products: updatedBundles[index].products.map((p, i) => 
                                                i === productIndex ? { ...p, productQuantity: isNaN(numValue) ? 0 : numValue } : p
                                              )
                                            };
                                            setFormState(prev => ({
                                              ...prev,
                                              bundles: updatedBundles
                                            }));
                                          }}
                                          placeholder="Quantity"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`product-fabric-${index}-${productIndex}`}>Fabric</Label>
                                        <Input
                                          id={`product-fabric-${index}-${productIndex}`}
                                          value={product.fabric}
                                          onChange={(e) => {
                                            const updatedBundles = [...formState.bundles];
                                            updatedBundles[index] = {
                                              ...updatedBundles[index],
                                              products: updatedBundles[index].products.map((p, i) => 
                                                i === productIndex ? { ...p, fabric: e.target.value } : p
                                              )
                                            };
                                            setFormState(prev => ({
                                              ...prev,
                                              bundles: updatedBundles
                                            }));
                                          }}
                                          placeholder="Fabric"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`product-desc-${index}-${productIndex}`}>Description</Label>
                                        <Input
                                          id={`product-desc-${index}-${productIndex}`}
                                          value={product.description}
                                          onChange={(e) => {
                                            const updatedBundles = [...formState.bundles];
                                            updatedBundles[index] = {
                                              ...updatedBundles[index],
                                              products: updatedBundles[index].products.map((p, i) => 
                                                i === productIndex ? { ...p, description: e.target.value } : p
                                              )
                                            };
                                            setFormState(prev => ({
                                              ...prev,
                                              bundles: updatedBundles
                                            }));
                                          }}
                                          placeholder="Description"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No products added yet. Click "Add Product" to start.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No bundles added yet. Click "Add Bundle" to start.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="packingStatus">Packing Status</Label>
                <select
                  id="packingStatus"
                  className="border rounded-md px-3 py-2 text-sm bg-background h-10 w-full focus:ring-2 focus:ring-primary/20"
                  value={formState.packingStatus}
                  onChange={(e) => handleInputChange('packingStatus', e.target.value as any)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="count">Sequential Count</Label>
                  <Input
                    id="count"
                    value={formState.count || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated sequential number</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/packing-lists')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Update Packing List' : 'Create Packing List'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};