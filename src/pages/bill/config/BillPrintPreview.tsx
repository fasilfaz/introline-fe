import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { billService, type BillPrintData } from '@/services/billService';
import toast from 'react-hot-toast';

const BillPrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [billData, setBillData] = useState<BillPrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const printContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadBillData();
    }
  }, [id]);

  const loadBillData = async () => {
    try {
      setLoading(true);
      const response = await billService.getPrintData(id!);
      setBillData(response.data);
    } catch (error: any) {
      console.error('Error loading bill data:', error);
      toast.error(error?.message || 'Failed to load bill data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Bill data not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Print Controls - Hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <h1 className="text-xl font-bold">Bill Print Preview</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div 
        ref={printContentRef}
        className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none"
      >
        <div className="p-8 print:p-4">
          {/* Company Header */}
          <div className="border-b border-gray-200 pb-6 mb-6 print:pb-4 print:mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 print:text-xl">INTROLINES</h1>
                <div className="mt-2 text-sm text-gray-600 print:text-xs">
                  <p>No.25(2)/22, Ground Floor,</p>
                  <p>Opp Vinayakar Kovil, Kumarapuram 1st Street Ryapuram,</p>
                  <p>Tirupur, TN 641601 IN</p>
                  <p>Phone: +91 8681 800 075</p>
                  <p>Email: allibastrading@gmail.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900 print:text-lg">BILL</h2>
                <p className="text-gray-600 mt-1 print:text-sm">Bill #: {billData.billNumber}</p>
                <p className="text-gray-600 print:text-sm">
                  Date: {new Date(billData.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:gap-4 print:mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">LR Details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">LR Number</p>
                  <p className="font-medium print:text-sm">{billData.lrNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Status</p>
                  <p className="font-medium print:text-sm">
                    {billData.status.charAt(0).toUpperCase() + billData.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">Amount Details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Delivery Charge</p>
                  <p className="font-medium text-green-600 print:text-sm">
                    ₹{billData.deliveryCharge.toFixed(2)}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <p className="text-sm text-gray-600 print:text-xs">Total Amount</p>
                  <p className="text-xl font-bold text-primary print:text-lg">
                    ₹{billData.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bundle Information */}
          <div className="mb-6 print:mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">Bundle Information</h3>
            <div className="border border-gray-200 rounded-lg p-4 print:border print:p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Bundle Number</p>
                  <p className="font-medium print:text-sm">{billData.bundle.bundleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Packing List</p>
                  <p className="font-medium print:text-sm">{billData.bundle.packingListCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Quantity</p>
                  <p className="font-medium print:text-sm">{billData.bundle.quantity}</p>
                </div>
                {billData.bundle.description && (
                  <div>
                    <p className="text-sm text-gray-600 print:text-xs">Description</p>
                    <p className="font-medium print:text-sm">{billData.bundle.description}</p>
                  </div>
                )}
                {billData.bundle.netWeight && (
                  <div>
                    <p className="text-sm text-gray-600 print:text-xs">Net Weight</p>
                    <p className="font-medium print:text-sm">{billData.bundle.netWeight} kg</p>
                  </div>
                )}
                {billData.bundle.grossWeight && (
                  <div>
                    <p className="text-sm text-gray-600 print:text-xs">Gross Weight</p>
                    <p className="font-medium print:text-sm">{billData.bundle.grossWeight} kg</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Information */}
          {billData.bundle.products && billData.bundle.products.length > 0 && (
            <div className="mb-6 print:mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">Product Details</h3>
              <div className="border border-gray-200 rounded-lg p-4 print:border print:p-3">
                <div className="space-y-3">
                  {billData.bundle.products.map((product, index) => (
                    <div key={product.id || index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="font-medium text-gray-900 print:text-sm">{product.productName || 'Unnamed Product'}</div>
                      <div className="grid grid-cols-2 gap-2 mt-1 text-sm print:text-xs">
                        <div>
                          <span className="text-gray-600 print:text-gray-500">Quantity:</span> {product.productQuantity || 0}
                        </div>
                        {product.fabric && (
                          <div>
                            <span className="text-gray-600 print:text-gray-500">Fabric:</span> {product.fabric}
                          </div>
                        )}
                        {product.description && (
                          <div className="col-span-2">
                            <span className="text-gray-600 print:text-gray-500">Description:</span> {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 print:border-gray-300">
                  <p className="text-sm text-gray-600 print:text-xs">
                    Total Products: {billData.bundle.products.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          {(billData.customer.sender || billData.customer.receiver) && (
            <div className="mb-6 print:mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                {billData.customer.sender && (
                  <div className="border border-gray-200 rounded-lg p-4 print:border print:p-3">
                    <h4 className="font-medium text-primary mb-2 print:text-sm print:mb-1">Sender</h4>
                    <div className="space-y-1">
                      <p className="font-medium print:text-sm">{billData.customer.sender.name}</p>
                      {billData.customer.sender.phone && (
                        <p className="text-sm text-gray-600 print:text-xs">Phone: {billData.customer.sender.phone}</p>
                      )}
                      {billData.customer.sender.email && (
                        <p className="text-sm text-gray-600 print:text-xs">Email: {billData.customer.sender.email}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {billData.customer.receiver && (
                  <div className="border border-gray-200 rounded-lg p-4 print:border print:p-3">
                    <h4 className="font-medium text-primary mb-2 print:text-sm print:mb-1">Receiver</h4>
                    <div className="space-y-1">
                      <p className="font-medium print:text-sm">{billData.customer.receiver.name}</p>
                      {billData.customer.receiver.phone && (
                        <p className="text-sm text-gray-600 print:text-xs">Phone: {billData.customer.receiver.phone}</p>
                      )}
                      {billData.customer.receiver.email && (
                        <p className="text-sm text-gray-600 print:text-xs">Email: {billData.customer.receiver.email}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Partner Information */}
          <div className="mb-8 print:mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">Delivery Partner</h3>
            <div className="border border-gray-200 rounded-lg p-4 print:border print:p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Name</p>
                  <p className="font-medium print:text-sm">{billData.deliveryPartner.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">Phone</p>
                  <p className="font-medium print:text-sm">{billData.deliveryPartner.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">From Country</p>
                  <p className="font-medium print:text-sm">{billData.deliveryPartner.fromCountry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 print:text-xs">To Country</p>
                  <p className="font-medium print:text-sm">{billData.deliveryPartner.toCountry}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-t border-gray-200 pt-6 print:pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 print:text-xs print:mb-1">Terms & Conditions</h3>
            <ul className="text-xs text-gray-600 space-y-1 print:text-[10px]">
              <li>• This is a computer-generated bill and does not require signature</li>
              <li>• Please check the LR number for delivery tracking</li>
              <li>• Delivery charges are non-refundable</li>
              <li>• For any queries, contact our support team</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center print:mt-6 print:pt-4">
            <p className="text-sm text-gray-500 print:text-xs">
              Thank you for your business!
            </p>
            <p className="text-xs text-gray-400 mt-1 print:text-[9px] print:mt-0">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPrintPreview;