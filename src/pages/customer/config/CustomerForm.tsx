import { useParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  UserPlus,
  DollarSign,
  Building,
  CreditCard,
  Plus,
  Trash2,
  MessageSquare,
  Globe,
  Percent,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { customerService, type CreateCustomerPayload, type UpdateCustomerPayload, type Branch, type PaymentHistory } from '@/services/customerService';

// Form field configuration interface
interface FormFieldConfig {
  name: keyof CustomerFormValues;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'number';
  placeholder?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  options?: { value: string; label: string }[];
  validation?: z.ZodTypeAny;
  gridCols?: 1 | 2;
  showFor?: 'all' | 'Sender' | 'Receiver';
}

// Branch schema for validation
const branchSchema = z.object({
  branchName: z.string().optional().transform(val => val === '' ? undefined : val),
  location: z.string().optional().transform(val => val === '' ? undefined : val),
  phone: z.string().optional().transform(val => val === '' ? undefined : val),
  contactPerson: z.string().optional().transform(val => val === '' ? undefined : val),
});

// Account details schema for validation
const accountDetailsSchema = z.object({
  accountNumber: z.string().optional().transform(val => val === '' ? undefined : val),
  ifscCode: z.string().optional().transform(val => val === '' ? undefined : val),
  ibanCode: z.string().optional().transform(val => val === '' ? undefined : val),
  bankName: z.string().optional().transform(val => val === '' ? undefined : val),
  accountHolderName: z.string().optional().transform(val => val === '' ? undefined : val),
  swiftCode: z.string().optional().transform(val => val === '' ? undefined : val),
}).optional();

// Payment history schema for validation
const paymentHistorySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.union([
    z.string().transform(val => Number(val)),
    z.number()
  ]).refine(val => val > 0, 'Amount must be positive'),
  paymentMethod: z.string().optional().transform(val => val === '' ? undefined : val),
  reference: z.string().optional().transform(val => val === '' ? undefined : val),
  notes: z.string().optional().transform(val => val === '' ? undefined : val),
});

// Dynamic form configuration
const formFieldsConfig: FormFieldConfig[] = [
  {
    name: 'customerType',
    label: 'Customer Type',
    type: 'select',
    required: true,
    icon: User,
    options: [
      { value: 'Sender', label: 'Sender' },
      { value: 'Receiver', label: 'Receiver' },
    ],
    validation: z.enum(['Sender', 'Receiver'], {
      required_error: 'Please select a customer type',
    }),
    gridCols: 2,
    showFor: 'all',
  },
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter full name',
    required: true,
    icon: User,
    validation: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
    gridCols: 2,
    showFor: 'all',
  },
  
  // Sender specific fields
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Enter location',
    icon: MapPin,
    validation: z.string().optional().transform(val => val === '' ? undefined : val),
    gridCols: 2,
    showFor: 'Sender',
  },
  {
    name: 'gstNumber',
    label: 'GST Number',
    type: 'text',
    placeholder: 'Enter GST number',
    icon: Calendar,
    validation: z.string().optional().transform(val => val === '' ? undefined : val),
    gridCols: 2,
    showFor: 'Sender',
  },
  {
    name: 'whatsappNumber',
    label: 'WhatsApp Number',
    type: 'tel',
    placeholder: 'WhatsApp number',
    icon: MessageSquare,
    validation: z.string().optional().transform(val => val === '' ? undefined : val),
    gridCols: 2,
    showFor: 'Sender',
  },
  {
    name: 'shopName',
    label: 'Shop Name',
    type: 'text',
    placeholder: 'Enter shop name',
    icon: Building,
    validation: z.string().optional().transform(val => val === '' ? undefined : val),
    gridCols: 2,
    showFor: 'all',
  },
  {
    name: 'contactPerson',
    label: 'Contact Person',
    type: 'text',
    placeholder: 'Enter contact person name',
    icon: User,
    validation: z.string().optional().transform(val => val === '' ? undefined : val),
    gridCols: 2,
    showFor: 'all',
  },
  // Receiver specific fields
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter phone number',
    icon: Phone,
    validation: z.string().optional().transform(val => val === '' ? undefined : val),
    gridCols: 2,
    showFor: 'Receiver',
  },
  {
    name: 'credit',
    label: 'Credit',
    type: 'number',
    placeholder: '0.00',
    icon: DollarSign,
    validation: z.union([
      z.string().transform(val => val === '' ? undefined : Number(val)),
      z.number(),
      z.undefined()
    ]).optional(),
    gridCols: 2,
    showFor: 'Receiver',
  },
  {
    name: 'country',
    label: 'Country',
    type: 'text',
    placeholder: 'Enter country',
    icon: Globe,
    validation: z.string().optional().transform(val => val === '' ? undefined : val),
    gridCols: 2,
    showFor: 'Receiver',
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    placeholder: 'Enter address',
    icon: MapPin,
    validation: z.string().optional().transform(val => val === '' ? undefined : val),
    gridCols: 1,
    showFor: 'Receiver',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    icon: CheckCircle,
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ],
    validation: z.enum(['Active', 'Inactive'], {
      required_error: 'Please select a status',
    }),
    gridCols: 2,
    showFor: 'all',
  },
  {
    name: 'discount',
    label: 'Discount (%)',
    type: 'number',
    placeholder: '0',
    icon: Percent,
    validation: z.union([
      z.string().transform(val => val === '' ? undefined : Number(val)),
      z.number(),
      z.undefined()
    ]).optional(),
    gridCols: 2,
    showFor: 'Receiver',
  },
];

// Dynamic schema generation
const createFormSchema = () => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  formFieldsConfig.forEach(field => {
    if (field.validation) {
      schemaFields[field.name] = field.validation;
    }
  });

  // Add complex field schemas
  schemaFields.branches = z.array(branchSchema).optional();
  schemaFields.accountDetails = accountDetailsSchema.optional();
  schemaFields.paymentHistory = z.array(paymentHistorySchema).optional();

  return z.object(schemaFields);
};

const customerFormSchema = createFormSchema();
type CustomerFormValues = z.infer<typeof customerFormSchema>;

// Generate customer ID - REMOVED (no longer needed)
// function generateCustomerId(lastNumber = 1): string {
//   const now = new Date();
//   const dd = String(now.getDate()).padStart(2, '0');
//   const mm = String(now.getMonth() + 1).padStart(2, '0');
//   const yy = String(now.getFullYear()).slice(-2);
//   const serial = String(lastNumber).padStart(4, '0');
//   return `CUST-${dd}${mm}${yy}-${serial}`;
// }

// Dynamic field renderer component
const FormFieldRenderer: React.FC<{
  field: FormFieldConfig;
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  clearValidationErrors: () => void;
  customerType: string;
}> = ({ field, register, errors, watch, setValue, clearValidationErrors, customerType }) => {
  // Skip field if it's not for current customer type
  if (field.showFor && field.showFor !== 'all' && field.showFor !== customerType) {
    return null;
  }

  const IconComponent = field.icon;
  const fieldError = errors[field.name];
  const fieldValue = watch(field.name);

  const baseInputClasses = `${fieldError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
    } transition-all duration-200`;

  const labelClasses = `${fieldError ? 'text-red-500' : 'text-gray-700'
    } group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 font-medium`;

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            {...register(field.name)}
            value={fieldValue || ''}
            onChange={(e) => {
              setValue(field.name, e.target.value);
              if (fieldError) {
                clearValidationErrors();
              }
            }}
            className={`${baseInputClasses} pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4 transition-all duration-200`}
          />
        );

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            min="0"
            step="0.01"
            placeholder={field.placeholder}
            {...register(field.name)}
            value={fieldValue || ''}
            onChange={(e) => {
              setValue(field.name, e.target.value);
              if (fieldError) {
                clearValidationErrors();
              }
            }}
            className={`${baseInputClasses} pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4 transition-all duration-200`}
          />
        );

      case 'select':
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => {
              setValue(field.name, value);
              if (fieldError) {
                clearValidationErrors();
              }
            }}
          >
            <SelectTrigger className={`${baseInputClasses} pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4 transition-all duration-200`}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            {...register(field.name)}
            value={fieldValue || ''}
            onChange={(e) => {
              setValue(field.name, e.target.value);
              if (fieldError) {
                clearValidationErrors();
              }
            }}
            className={`w-full resize-none min-h-[100px] ${baseInputClasses} pl-3 pr-3 py-2 rounded-md shadow-sm focus:ring-4 transition-all duration-200`}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={fieldValue}
              onCheckedChange={(checked) => {
                setValue(field.name, checked as boolean);
              }}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor={field.name} className="text-sm text-gray-600">
              Enable email notifications for this customer
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-2 group ${field.gridCols === 1 ? 'md:col-span-2' : ''}`}>
      <Label htmlFor={field.name} className={labelClasses}>
        {IconComponent && <IconComponent className="h-4 w-4" />}
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </Label>
      {renderField()}
      {fieldError && (
        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" />
          {fieldError.message}
        </p>
      )}
    </div>
  );
};

// Branch management component for Receiver customers
const BranchManager: React.FC<{
  fields: any[];
  append: (value: Branch) => void;
  remove: (index: number) => void;
  register: any;
}> = ({ fields, append, remove, register }) => {
  const addBranch = () => {
    append({
      branchName: '',
      location: '',
      phone: '',
      contactPerson: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Building className="h-5 w-5" />
          Branches
        </Label>
        <Button type="button" onClick={addBranch} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Branch
        </Button>
      </div>
      
      {fields.map((field, index) => (
        <Card key={field.id} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Branch {index + 1}</h4>
            <Button
              type="button"
              onClick={() => remove(index)}
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input
                {...register(`branches.${index}.branchName`)}
                placeholder="Enter branch name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                {...register(`branches.${index}.location`)}
                placeholder="Enter location"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                {...register(`branches.${index}.phone`)}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                {...register(`branches.${index}.contactPerson`)}
                placeholder="Enter contact person"
              />
            </div>
          </div>
        </Card>
      ))}
      
      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No branches added yet</p>
          <p className="text-sm">Click "Add Branch" to get started</p>
        </div>
      )}
    </div>
  );
};

// Account details component for Sender customers
const AccountDetailsManager: React.FC<{
  register: any;
  errors: any;
}> = ({ register }) => {
  return (
    <Card className="p-4">
      <div className="mb-4">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Account Details
        </Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input
            {...register('accountDetails.accountNumber')}
            placeholder="Enter account number"
          />
        </div>
        
        <div className="space-y-2">
          <Label>IFSC Code</Label>
          <Input
            {...register('accountDetails.ifscCode')}
            placeholder="Enter IFSC code"
          />
        </div>
        
        <div className="space-y-2">
          <Label>IBAN Code</Label>
          <Input
            {...register('accountDetails.ibanCode')}
            placeholder="Enter IBAN code"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Bank Name</Label>
          <Input
            {...register('accountDetails.bankName')}
            placeholder="Enter bank name"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Account Holder Name</Label>
          <Input
            {...register('accountDetails.accountHolderName')}
            placeholder="Enter account holder name"
          />
        </div>
        
        <div className="space-y-2">
          <Label>SWIFT Code</Label>
          <Input
            {...register('accountDetails.swiftCode')}
            placeholder="Enter SWIFT code"
          />
        </div>
      </div>
    </Card>
  );
};

// Payment history component for Receiver customers
const PaymentHistoryManager: React.FC<{
  fields: any[];
  append: (value: PaymentHistory) => void;
  remove: (index: number) => void;
  register: any;
  errors: any;
}> = ({ fields, append, remove, register, errors }) => {
  const addPayment = () => {
    append({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      paymentMethod: '',
      reference: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment History
        </Label>
        <Button type="button" onClick={addPayment} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Payment
        </Button>
      </div>
      
      {fields.map((field, index) => (
        <Card key={field.id} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Payment {index + 1}</h4>
            <Button
              type="button"
              onClick={() => remove(index)}
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                {...register(`paymentHistory.${index}.date`)}
              />
              {errors.paymentHistory?.[index]?.date && (
                <p className="text-sm text-red-500">{errors.paymentHistory[index].date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register(`paymentHistory.${index}.amount`)}
                placeholder="0.00"
              />
              {errors.paymentHistory?.[index]?.amount && (
                <p className="text-sm text-red-500">{errors.paymentHistory[index].amount.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Input
                {...register(`paymentHistory.${index}.paymentMethod`)}
                placeholder="e.g., Cash, Card, Transfer"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                {...register(`paymentHistory.${index}.reference`)}
                placeholder="Enter reference number"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                {...register(`paymentHistory.${index}.notes`)}
                placeholder="Enter any notes"
                className="min-h-[80px]"
              />
            </div>
          </div>
        </Card>
      ))}
      
      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No payment history added yet</p>
          <p className="text-sm">Click "Add Payment" to get started</p>
        </div>
      )}
    </div>
  );
};

export default function CustomerForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState('');
  
  // Create default values dynamically
  const createDefaultValues = (): CustomerFormValues => {
    const defaults: any = {};
    formFieldsConfig.forEach(field => {
      if (field.type === 'checkbox') {
        defaults[field.name] = false;
      } else if (field.name === 'status') {
        defaults[field.name] = 'Active';
      } else if (field.name === 'customerType') {
        defaults[field.name] = 'Sender';
      } else if (field.name === 'credit' || field.name === 'discount') {
        defaults[field.name] = undefined;
      } else {
        defaults[field.name] = undefined;
      }
    });
    
    // Initialize complex fields
    defaults.branches = [];
    defaults.accountDetails = {};
    defaults.paymentHistory = [];
    
    return defaults;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    trigger,
    control,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: createDefaultValues(),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // Field arrays for dynamic fields
  const { fields: branchFields, append: appendBranch, remove: removeBranch } = useFieldArray({
    control,
    name: 'branches',
  });

  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control,
    name: 'paymentHistory',
  });

  const watchedCustomerType = watch('customerType');

  // Generate customer ID for new customers - REMOVED
  // useEffect(() => {
  //   // Customer ID generation logic removed
  // }, [isEditing, companyId]);

  // Fetch customer data for editing
  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchCustomer = async () => {
        try {
          const response = await customerService.getCustomer(id);
          const customer = response.data;

          if (!customer) throw new Error('Failed to fetch customer');

          // Map database fields to form fields
          const formData: any = {};
          formFieldsConfig.forEach(field => {
            switch (field.name) {
              case 'customerType':
                formData[field.name] = customer.customerType || 'Sender';
                break;
              case 'name':
                formData[field.name] = customer.name || '';
                break;
              case 'status':
                formData[field.name] = customer.status || 'Active';
                break;
              case 'location':
                formData[field.name] = customer.location || '';
                break;
              case 'gstNumber':
                formData[field.name] = customer.gstNumber || '';
                break;
              case 'whatsappNumber':
                formData[field.name] = customer.whatsappNumber || '';
                break;
              case 'shopName':
                formData[field.name] = customer.shopName || '';
                break;
              case 'contactPerson':
                formData[field.name] = customer.contactPerson || '';
                break;
              case 'phone':
                formData[field.name] = customer.phone || '';
                break;
              case 'credit':
                formData[field.name] = customer.credit || '';
                break;
              case 'country':
                formData[field.name] = customer.country || '';
                break;
              case 'address':
                formData[field.name] = customer.address || '';
                break;
              case 'discount':
                formData[field.name] = customer.discount || '';
                break;
              default:
                formData[field.name] = '';
            }
          });

          // Set complex fields
          formData.branches = customer.branches || [];
          formData.accountDetails = customer.accountDetails || {};
          formData.paymentHistory = customer.paymentHistory || [];

          reset(formData);
        } catch (err) {
          setError('Failed to load customer data');
          toast.error('Failed to load customer data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEditing, reset]);

  // Helper function to clear validation errors
  const clearValidationErrors = () => {
    setError('');
  };

  // Function to handle form submission with proper validation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any existing validation errors
    clearValidationErrors();

    // Trigger validation for all fields
    const isValid = await trigger();

    if (!isValid) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    // If validation passes, submit the form
    handleSubmit(onSubmit)(e);
  };

  const onSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    console.log('Form submitted with data:', data);
    setError('');

    try {
      setIsLoading(true);

      // Map form data to database fields - clean up empty strings
      const customerPayload: CreateCustomerPayload | UpdateCustomerPayload = {
        customerType: data.customerType,
        name: data.name,
        status: data.status,
      };

      // Add sender-specific fields
      if (data.customerType === 'Sender') {
        if (data.location && data.location.trim()) customerPayload.location = data.location.trim();
        if (data.gstNumber && data.gstNumber.trim()) customerPayload.gstNumber = data.gstNumber.trim();
        if (data.whatsappNumber && data.whatsappNumber.trim()) customerPayload.whatsappNumber = data.whatsappNumber.trim();
        if (data.shopName && data.shopName.trim()) customerPayload.shopName = data.shopName.trim();
        if (data.contactPerson && data.contactPerson.trim()) customerPayload.contactPerson = data.contactPerson.trim();
        
        // Handle account details
        if (data.accountDetails) {
          const cleanAccountDetails: any = {};
          if (data.accountDetails.accountNumber?.trim()) cleanAccountDetails.accountNumber = data.accountDetails.accountNumber.trim();
          if (data.accountDetails.ifscCode?.trim()) cleanAccountDetails.ifscCode = data.accountDetails.ifscCode.trim();
          if (data.accountDetails.ibanCode?.trim()) cleanAccountDetails.ibanCode = data.accountDetails.ibanCode.trim();
          if (data.accountDetails.bankName?.trim()) cleanAccountDetails.bankName = data.accountDetails.bankName.trim();
          if (data.accountDetails.accountHolderName?.trim()) cleanAccountDetails.accountHolderName = data.accountDetails.accountHolderName.trim();
          if (data.accountDetails.swiftCode?.trim()) cleanAccountDetails.swiftCode = data.accountDetails.swiftCode.trim();
          
          if (Object.keys(cleanAccountDetails).length > 0) {
            customerPayload.accountDetails = cleanAccountDetails;
          }
        }
      }

      // Add receiver-specific fields
      if (data.customerType === 'Receiver') {
        if (data.shopName && data.shopName.trim()) customerPayload.shopName = data.shopName.trim();
        if (data.contactPerson && data.contactPerson.trim()) customerPayload.contactPerson = data.contactPerson.trim();
        if (data.phone && data.phone.trim()) customerPayload.phone = data.phone.trim();
        if (data.country && data.country.trim()) customerPayload.country = data.country.trim();
        if (data.address && data.address.trim()) customerPayload.address = data.address.trim();
        
        // Handle numeric fields
        if (data.credit && data.credit > 0) customerPayload.credit = data.credit;
        if (data.discount && data.discount > 0) customerPayload.discount = data.discount;
        
        // Handle branches
        if (data.branches && data.branches.length > 0) {
          const cleanBranches = data.branches.filter((branch: any) => 
            branch.branchName?.trim() || branch.location?.trim() || branch.phone?.trim() || branch.contactPerson?.trim()
          ).map((branch: any) => ({
            branchName: branch.branchName?.trim() || undefined,
            location: branch.location?.trim() || undefined,
            phone: branch.phone?.trim() || undefined,
            contactPerson: branch.contactPerson?.trim() || undefined
          }));
          
          if (cleanBranches.length > 0) {
            customerPayload.branches = cleanBranches;
          }
        }
        
        // Handle payment history
        if (data.paymentHistory && data.paymentHistory.length > 0) {
          const cleanPaymentHistory = data.paymentHistory.filter((payment: any) => 
            payment.date && payment.amount > 0
          ).map((payment: any) => ({
            date: payment.date,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod?.trim() || undefined,
            reference: payment.reference?.trim() || undefined,
            notes: payment.notes?.trim() || undefined
          }));
          
          if (cleanPaymentHistory.length > 0) {
            customerPayload.paymentHistory = cleanPaymentHistory;
          }
        }
      }

      if (isEditing && id) {
        const updatePayload: UpdateCustomerPayload = {
          ...customerPayload
        };

        const response = await customerService.updateCustomer(id, updatePayload);

        if (!response.data) throw new Error('Customer update failed');

        toast.success('Customer updated successfully!');
      } else {
        // For testing, let's create a minimal payload first
        const createPayload: CreateCustomerPayload = {
          customerType: data.customerType,
          name: data.name,
          status: data.status || 'Active'
        };

        // Only add additional fields if they exist
        if (customerPayload.shopName) createPayload.shopName = customerPayload.shopName;
        if (customerPayload.contactPerson) createPayload.contactPerson = customerPayload.contactPerson;
        if (customerPayload.location) createPayload.location = customerPayload.location;
        if (customerPayload.gstNumber) createPayload.gstNumber = customerPayload.gstNumber;
        if (customerPayload.whatsappNumber) createPayload.whatsappNumber = customerPayload.whatsappNumber;
        if (customerPayload.phone) createPayload.phone = customerPayload.phone;
        if (customerPayload.credit) createPayload.credit = customerPayload.credit;
        if (customerPayload.country) createPayload.country = customerPayload.country;
        if (customerPayload.address) createPayload.address = customerPayload.address;
        if (customerPayload.discount) createPayload.discount = customerPayload.discount;
        if (customerPayload.accountDetails) createPayload.accountDetails = customerPayload.accountDetails;
        if (customerPayload.branches) createPayload.branches = customerPayload.branches;
        if (customerPayload.paymentHistory) createPayload.paymentHistory = customerPayload.paymentHistory;

        const response = await customerService.createCustomer(createPayload);

        if (!response.data) throw new Error('Customer creation failed');

        toast.success('Customer created successfully!');
      }

      setTimeout(() => navigate('/dashboard/customer-management'), 1000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to save customer. Please check all fields and try again.');
      toast.error(error.message || 'Failed to save customer. Please check all fields and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading customer data...</p>
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
            onClick={() => navigate('/dashboard/customer-management')}
            className="hover:bg-blue-100 transition-colors duration-200 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Update Customer' : 'Create New Customer'}
              </h1>
              <p className="text-gray-600">Create or update customer information</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Customer Information</CardTitle>
            <CardDescription className="text-blue-600">
              {isEditing ? 'Update the customer details below' : 'Fill in the customer details below to create a new customer'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-8" noValidate>
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFieldsConfig.map((field) => (
                    <FormFieldRenderer
                      key={field.name}
                      field={field}
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                      clearValidationErrors={clearValidationErrors}
                      customerType={watchedCustomerType}
                    />
                  ))}
                </div>
              </div>

              {/* Sender-specific sections */}
              {watchedCustomerType === 'Sender' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Sender Details
                  </h3>
                  <AccountDetailsManager
                    register={register}
                    errors={errors}
                  />
                </div>
              )}

              {/* Receiver-specific sections */}
              {watchedCustomerType === 'Receiver' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Receiver Details
                    </h3>
                    <BranchManager
                      fields={branchFields}
                      append={appendBranch}
                      remove={removeBranch}
                      register={register}
                    />
                  </div>

                  <div>
                    <PaymentHistoryManager
                      fields={paymentFields}
                      append={appendPayment}
                      remove={removePayment}
                      register={register}
                      errors={errors}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  * Required fields
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/customer-management')}
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
                        {isEditing ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        {isEditing ? 'Update Customer' : 'Create Customer'}
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