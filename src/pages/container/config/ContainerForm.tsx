import { useParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Container as ContainerIcon,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { containerService, type CreateContainerPayload, type UpdateContainerPayload } from '@/services/containerService';

// Form validation schema
const containerFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').trim(),
  bookingDate: z.string().min(1, 'Booking date is required'),
  bookingCharge: z.number().min(0, 'Booking charge must be a positive number'),
  advancePayment: z.number().min(0, 'Advance payment must be a positive number'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
}).refine(data => {
  return data.advancePayment <= data.bookingCharge;
}, {
  message: 'Advance payment cannot exceed booking charge',
  path: ['advancePayment']
});

type ContainerFormValues = z.infer<typeof containerFormSchema>;

export default function ContainerForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<ContainerFormValues>({
    resolver: zodResolver(containerFormSchema),
    defaultValues: {
      companyName: '',
      bookingDate: '',
      bookingCharge: 0,
      advancePayment: 0,
      status: 'pending',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const watchedBookingCharge = watch('bookingCharge');
  const watchedAdvancePayment = watch('advancePayment');

  // Calculate balance amount
  const balanceAmount = watchedBookingCharge - watchedAdvancePayment;

  // Fetch container data for editing
  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchContainer = async () => {
        try {
          const response = await containerService.getContainer(id);
          const container = response.data;

          if (!container) throw new Error('Failed to fetch container');

          // Format date for input field
          const formatDateForInput = (dateString: string) => {
            return new Date(dateString).toISOString().split('T')[0];
          };

          reset({
            companyName: container.companyName,
            bookingDate: formatDateForInput(container.bookingDate),
            bookingCharge: container.bookingCharge,
            advancePayment: container.advancePayment,
            status: container.status,
          });
        } catch (err) {
          setError('Failed to load container data');
          toast.error('Failed to load container data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchContainer();
    }
  }, [id, isEditing, reset]);

  // Helper function to clear validation errors
  const clearValidationErrors = () => {
    setError('');
  };

  // Function to handle form submission with proper validation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearValidationErrors();

    const isValid = await trigger();
    if (!isValid) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    handleSubmit(onSubmit)(e);
  };

  const onSubmit: SubmitHandler<ContainerFormValues> = async (data) => {
    console.log('Form submitted with data:', data);
    setError('');

    try {
      setIsLoading(true);

      const containerPayload: CreateContainerPayload | UpdateContainerPayload = {
        companyName: data.companyName,
        bookingDate: data.bookingDate,
        bookingCharge: Number(data.bookingCharge),
        advancePayment: Number(data.advancePayment),
        status: data.status,
      };

      if (isEditing && id) {
        const response = await containerService.updateContainer(id, containerPayload);
        if (!response.data) throw new Error('Container update failed');
        toast.success('Container updated successfully!');
      } else {
        const response = await containerService.createContainer(containerPayload as CreateContainerPayload);
        if (!response.data) throw new Error('Container creation failed');
        toast.success('Container created successfully!');
      }

      setTimeout(() => navigate('/dashboard/containers'), 1000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to save container. Please check all fields and try again.');
      toast.error(error.message || 'Failed to save container. Please check all fields and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading container data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
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
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Update Container' : 'Create New Container'}
              </h1>
              <p className="text-gray-600">Create or update container information</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Container Information</CardTitle>
            <CardDescription className="text-blue-600">
              {isEditing ? 'Update the container details below' : 'Fill in the container details below to create a new container'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-8" noValidate>
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="flex items-center gap-2 font-medium">
                      <Building className="h-4 w-4 text-blue-500" />
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      {...register('companyName')}
                      className={errors.companyName ? 'border-red-300' : ''}
                      placeholder="Enter company name"
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>

                  {/* Booking Date */}
                  <div className="space-y-2">
                    <Label htmlFor="bookingDate" className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-green-500" />
                      Booking Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bookingDate"
                      type="date"
                      {...register('bookingDate')}
                      className={errors.bookingDate ? 'border-red-300' : ''}
                    />
                    {errors.bookingDate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.bookingDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Booking Charge */}
                  <div className="space-y-2">
                    <Label htmlFor="bookingCharge" className="flex items-center gap-2 font-medium">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Booking Charge <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bookingCharge"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('bookingCharge', { valueAsNumber: true })}
                      className={errors.bookingCharge ? 'border-red-300' : ''}
                      placeholder="0.00"
                    />
                    {errors.bookingCharge && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.bookingCharge.message}
                      </p>
                    )}
                  </div>

                  {/* Advance Payment */}
                  <div className="space-y-2">
                    <Label htmlFor="advancePayment" className="flex items-center gap-2 font-medium">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      Advance Payment <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="advancePayment"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('advancePayment', { valueAsNumber: true })}
                      className={errors.advancePayment ? 'border-red-300' : ''}
                      placeholder="0.00"
                    />
                    {errors.advancePayment && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.advancePayment.message}
                      </p>
                    )}
                  </div>

                  {/* Balance Amount (Read-only) */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-medium">
                      <DollarSign className="h-4 w-4 text-orange-500" />
                      Balance Amount
                    </Label>
                    <Input
                      value={balanceAmount.toFixed(2)}
                      readOnly
                      className="bg-gray-50 text-gray-700 font-medium"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-2 font-medium">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watch('status')}
                      onValueChange={(value) => setValue('status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.status.message}
                      </p>
                    )}
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
                    onClick={() => navigate('/dashboard/containers')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {(isSubmitting || isLoading) ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {isEditing ? 'Update Container' : 'Create Container'}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}