import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { packingListService, type PackingListInput } from '@/services/packingListService';
import { bookingService, type Booking } from '@/services/bookingService';
import toast from 'react-hot-toast';

interface PackingListFormState {
  bookingReference: string;
  netWeight: number;
  grossWeight: number;
  packedBy: string;
  plannedBundleCount: number;
  actualBundleCount: number;
  packingStatus: 'pending' | 'in_progress' | 'completed';
}

const DEFAULT_FORM: PackingListFormState = {
  bookingReference: '',
  netWeight: 0,
  grossWeight: 0,
  packedBy: '',
  plannedBundleCount: 0,
  actualBundleCount: 0,
  packingStatus: 'pending'
};

export const PackingListForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formState, setFormState] = useState<PackingListFormState>(DEFAULT_FORM);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBookings();
    if (isEditing) {
      loadPackingList();
    }
  }, [id, isEditing]);

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await bookingService.list({ limit: 1000 });
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to load bookings', error);
      toast.error('Unable to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadPackingList = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await packingListService.get(id);
      const packingList = response.data;
      
      setFormState({
        bookingReference: packingList.bookingReference?._id || '',
        netWeight: packingList.netWeight,
        grossWeight: packingList.grossWeight,
        packedBy: packingList.packedBy,
        plannedBundleCount: packingList.plannedBundleCount,
        actualBundleCount: packingList.actualBundleCount,
        packingStatus: packingList.packingStatus
      });
    } catch (error) {
      console.error('Failed to load packing list', error);
      toast.error('Unable to load packing list');
      navigate('/dashboard/packing-lists');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PackingListFormState, value: string | number) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.bookingReference) {
      toast.error('Please select a booking reference');
      return;
    }
    
    if (!formState.packedBy.trim()) {
      toast.error('Please enter who packed the items');
      return;
    }
    
    if (formState.netWeight <= 0 || formState.grossWeight <= 0) {
      toast.error('Please enter valid weights');
      return;
    }
    
    if (formState.plannedBundleCount <= 0) {
      toast.error('Please enter a valid planned bundle count');
      return;
    }

    try {
      setSaving(true);
      
      const payload: PackingListInput = {
        bookingReference: formState.bookingReference,
        netWeight: formState.netWeight,
        grossWeight: formState.grossWeight,
        packedBy: formState.packedBy.trim(),
        plannedBundleCount: formState.plannedBundleCount,
        actualBundleCount: formState.actualBundleCount,
        packingStatus: formState.packingStatus
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
              <div className="space-y-2">
                <Label htmlFor="bookingReference">Booking Reference *</Label>
                <select
                  id="bookingReference"
                  className="border rounded-md px-3 py-2 text-sm bg-background h-10 w-full focus:ring-2 focus:ring-primary/20"
                  value={formState.bookingReference}
                  onChange={(e) => handleInputChange('bookingReference', e.target.value)}
                  disabled={loadingBookings}
                  required
                >
                  <option value="">Select a booking</option>
                  {bookings.map((booking) => (
                    <option key={booking._id || booking.id} value={booking._id || booking.id}>
                      {booking.sender?.name} → {booking.receiver?.name} ({booking.bundleCount} bundles)
                    </option>
                  ))}
                </select>
                {loadingBookings && (
                  <p className="text-sm text-muted-foreground">Loading bookings...</p>
                )}
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="netWeight">Net Weight (kg) *</Label>
                <Input
                  id="netWeight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.netWeight || ''}
                  onChange={(e) => handleInputChange('netWeight', parseFloat(e.target.value) || 0)}
                  placeholder="Enter net weight"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grossWeight">Gross Weight (kg) *</Label>
                <Input
                  id="grossWeight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.grossWeight || ''}
                  onChange={(e) => handleInputChange('grossWeight', parseFloat(e.target.value) || 0)}
                  placeholder="Enter gross weight"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedBundleCount">Planned Bundle Count *</Label>
                <Input
                  id="plannedBundleCount"
                  type="number"
                  min="0"
                  value={formState.plannedBundleCount || ''}
                  onChange={(e) => handleInputChange('plannedBundleCount', parseInt(e.target.value) || 0)}
                  placeholder="Enter planned bundle count"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualBundleCount">Actual Bundle Count</Label>
                <Input
                  id="actualBundleCount"
                  type="number"
                  min="0"
                  value={formState.actualBundleCount || ''}
                  onChange={(e) => handleInputChange('actualBundleCount', parseInt(e.target.value) || 0)}
                  placeholder="Enter actual bundle count"
                />
              </div>

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