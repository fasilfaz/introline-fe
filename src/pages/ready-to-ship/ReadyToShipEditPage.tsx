import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Package, 
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { readyToShipService } from '@/services/readyToShipService';
import { containerService } from '@/services/containerService';
import { ReadyToShipBundle, ReadyToShipBundleUpdate } from '@/services/readyToShipService';

interface ReadyToShipEditPageProps {}

const ReadyToShipEditPage: React.FC<ReadyToShipEditPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState<ReadyToShipBundle | null>(null);
  const [formData, setFormData] = useState<ReadyToShipBundleUpdate>({
    bundleNumber: '',
    description: '',
    quantity: 0,
    netWeight: 0,
    grossWeight: 0,
    actualCount: 0,
    priority: 'medium',
    readyToShipStatus: 'pending',
    container: undefined, // Use undefined instead of empty string initially
    products: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containers, setContainers] = useState<any[]>([]);
  const [showContainerSelect, setShowContainerSelect] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bundle data
        const bundleResponse = await readyToShipService.get(id);
        const fetchedBundle = bundleResponse.data;
        
        setBundle(fetchedBundle);
        setFormData({
          bundleNumber: fetchedBundle.bundleNumber,
          description: fetchedBundle.description || '',
          quantity: fetchedBundle.quantity,
          netWeight: fetchedBundle.netWeight || 0,
          grossWeight: fetchedBundle.grossWeight || 0,
          actualCount: fetchedBundle.actualCount || 0,
          priority: fetchedBundle.priority || 'medium',
          readyToShipStatus: fetchedBundle.readyToShipStatus || 'pending',
          container: fetchedBundle.container?._id || undefined, // Use undefined instead of empty string
          products: [...fetchedBundle.products]
        });
        
        // Fetch containers
        const containerResponse = await containerService.listContainers();
        setContainers(containerResponse.data);
        
        // Show container select if status is stuffed or dispatched
        setShowContainerSelect(['stuffed', 'dispatched'].includes(fetchedBundle.readyToShipStatus));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch bundle details');
        toast.error('Failed to fetch bundle details', {
          description: 'Please try again later'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Only depend on id, not toast

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Weight') || name === 'quantity' || name === 'actualCount' 
        ? Number(value) 
        : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newState = {
        ...prev,
        [name]: value
      };
      
      // Clear container if changing from 'stuffed' or 'dispatched' to another status
      if (name === 'readyToShipStatus' && prev.readyToShipStatus && ['stuffed', 'dispatched'].includes(prev.readyToShipStatus) && !['stuffed', 'dispatched'].includes(value)) {
        newState.container = undefined;
      }
      
      return newState;
    });

    // Show/hide container selection based on readyToShipStatus
    if (name === 'readyToShipStatus') {
      setShowContainerSelect(['stuffed', 'dispatched'].includes(value));
    }
  };

  const handleContainerChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      container: value || undefined  // Use undefined instead of empty string when no container is selected
    }));
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products!];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: value
      };
      return { ...prev, products: updatedProducts };
    });
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products!,
        {
          id: `temp_${Date.now()}`,
          productName: '',
          productQuantity: 0,
          fabric: '',
          description: ''
        }
      ]
    }));
  };

  const removeProduct = (index: number) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products!];
      updatedProducts.splice(index, 1);
      return { ...prev, products: updatedProducts };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare form data by excluding empty container field if not needed
      const submitData = { ...formData };
      
      // Only send container field if it has a value and readyToShipStatus is 'stuffed' or 'dispatched'
      if (!(formData.readyToShipStatus && ['stuffed', 'dispatched'].includes(formData.readyToShipStatus)) || !formData.container) {
        delete submitData.container;
      }

      await readyToShipService.update(id!, submitData);
      toast.success('Bundle updated successfully', {
        description: 'Changes have been saved'
      });
      navigate('/dashboard/ready-to-ship'); // Navigate to the ready to ship listing page
    } catch (err) {
      console.error('Error updating bundle:', err);
      toast.error('Failed to update bundle', {
        description: 'Please try again later'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Bundle Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested bundle could not be found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Bundle</h1>
          <p className="text-muted-foreground mt-1">
            Edit details for bundle {bundle.bundleNumber}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Bundle Information</CardTitle>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              {bundle.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="bundleNumber" className="block text-sm font-medium mb-1">
                    Bundle Number *
                  </label>
                  <Input
                    id="bundleNumber"
                    name="bundleNumber"
                    value={formData.bundleNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter bundle description..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleSelectChange('priority', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <Flag className="h-4 w-4 mr-2 text-yellow-500" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <Flag className="h-4 w-4 mr-2 text-green-500" />
                          Low
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="readyToShipStatus">Ready to Ship Status *</Label>
                  <Select 
                    value={formData.readyToShipStatus} 
                    onValueChange={(value) => handleSelectChange('readyToShipStatus', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="stuffed">Stuffed</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {showContainerSelect && (
                  <div>
                    <Label htmlFor="container">Container *</Label>
                    <Select 
                      value={formData.container || ''} 
                      onValueChange={handleContainerChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select container" />
                      </SelectTrigger>
                      <SelectContent>
                        {containers.map(container => (
                          <SelectItem key={container._id} value={container._id}>
                            {container.containerCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                    Quantity *
                  </label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="netWeight" className="block text-sm font-medium mb-1">
                    Net Weight (kg)
                  </label>
                  <Input
                    id="netWeight"
                    name="netWeight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.netWeight}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="grossWeight" className="block text-sm font-medium mb-1">
                    Gross Weight (kg)
                  </label>
                  <Input
                    id="grossWeight"
                    name="grossWeight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.grossWeight}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="actualCount" className="block text-sm font-medium mb-1">
                    Actual Count
                  </label>
                  <Input
                    id="actualCount"
                    name="actualCount"
                    type="number"
                    min="0"
                    value={formData.actualCount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Products in Bundle</h3>
                <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
              
              {formData.products && formData.products.length > 0 ? (
                <div className="space-y-4">
                  {formData.products.map((product, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Product Name *
                          </label>
                          <Input
                            value={product.productName}
                            onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                            placeholder="Product name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Quantity *
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={product.productQuantity}
                            onChange={(e) => handleProductChange(index, 'productQuantity', Number(e.target.value))}
                            placeholder="Quantity"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Fabric
                          </label>
                          <Input
                            value={product.fabric}
                            onChange={(e) => handleProductChange(index, 'fabric', e.target.value)}
                            placeholder="Fabric type"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeProduct(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <Input
                          value={product.description}
                          onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                          placeholder="Product description"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-muted-foreground">No products added</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click "Add Product" to add products to this bundle
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadyToShipEditPage;