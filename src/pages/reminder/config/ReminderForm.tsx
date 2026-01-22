import { useParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Bell,
  Calendar,
  FileText,
  Target,
  MessageCircle,
  AlertCircle,
  Loader2,
  Save,
  Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reminderService, type CreateReminderPayload, type UpdateReminderPayload } from '@/services/reminderService';

// Form validation schema
const reminderFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  purpose: z.string().min(1, 'Purpose is required').max(200, 'Purpose must be less than 200 characters'),
  whatsapp: z.boolean(),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export default function ReminderForm() {
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
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      date: '',
      description: '',
      purpose: '',
      whatsapp: false,
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // Fetch reminder data for editing
  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchReminder = async () => {
        try {
          const response = await reminderService.getReminder(id);
          const reminder = response.data;

          if (!reminder) throw new Error('Failed to fetch reminder');

          // Format date for input field
          const formatDateForInput = (dateString: string) => {
            return new Date(dateString).toISOString().split('T')[0];
          };

          reset({
            date: formatDateForInput(reminder.date),
            description: reminder.description,
            purpose: reminder.purpose,
            whatsapp: reminder.whatsapp,
          });
        } catch (err) {
          setError('Failed to load reminder data');
          toast.error('Failed to load reminder data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchReminder();
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

  const onSubmit: SubmitHandler<ReminderFormValues> = async (data) => {
    console.log('Form submitted with data:', data);
    setError('');

    try {
      setIsLoading(true);

      const reminderPayload: CreateReminderPayload | UpdateReminderPayload = {
        date: data.date,
        description: data.description.trim(),
        purpose: data.purpose.trim(),
        whatsapp: data.whatsapp,
      };

      if (isEditing && id) {
        const response = await reminderService.updateReminder(id, reminderPayload);
        if (!response.data) throw new Error('Reminder update failed');
        toast.success('Reminder updated successfully!');
      } else {
        const response = await reminderService.createReminder(reminderPayload as CreateReminderPayload);
        if (!response.data) throw new Error('Reminder creation failed');
        toast.success('Reminder created successfully!');
      }

      setTimeout(() => navigate('/dashboard/reminders'), 1000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to save reminder. Please check all fields and try again.');
      toast.error(error.message || 'Failed to save reminder. Please check all fields and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading reminder data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Update Reminder' : 'Create New Reminder'}
              </h1>
              <p className="text-gray-600">Create or update reminder information</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Reminder Information</CardTitle>
            <CardDescription className="text-blue-600">
              {isEditing ? 'Update the reminder details below' : 'Fill in the reminder details below to create a new reminder'}
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

              {/* Reminder Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Reminder Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      {...register('date')}
                      className={errors.date ? 'border-red-300' : ''}
                    />
                    {errors.date && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Checkbox */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-medium">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      WhatsApp Notification
                    </Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="whatsapp"
                        checked={watch('whatsapp')}
                        onCheckedChange={(checked) => setValue('whatsapp', Boolean(checked))}
                      />
                      <Label htmlFor="whatsapp" className="text-sm font-normal cursor-pointer">
                        Send reminder via WhatsApp
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mt-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter reminder description..."
                      {...register('description')}
                      className={`min-h-[100px] ${errors.description ? 'border-red-300' : ''}`}
                    />
                    <div className="flex justify-between items-center">
                      {errors.description && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.description.message}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 ml-auto">
                        {watch('description')?.length || 0}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="space-y-2">
                    <Label htmlFor="purpose" className="flex items-center gap-2 font-medium">
                      <Target className="h-4 w-4 text-orange-500" />
                      Purpose <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="purpose"
                      placeholder="Enter reminder purpose..."
                      {...register('purpose')}
                      className={errors.purpose ? 'border-red-300' : ''}
                    />
                    <div className="flex justify-between items-center">
                      {errors.purpose && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.purpose.message}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 ml-auto">
                        {watch('purpose')?.length || 0}/200 characters
                      </p>
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
                    onClick={() => navigate('/dashboard/reminders')}
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
                        {isEditing ? 'Update Reminder' : 'Create Reminder'}
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