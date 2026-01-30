import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Printer,
  Package,
  Loader2,
} from 'lucide-react';
import { readyToShipService, ReadyToShipBundle } from '@/services/readyToShipService';
import { toast } from 'sonner';

const ReadyToShipPrintPreview: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bundleId = searchParams.get('id');
  const [bundles, setBundles] = useState<ReadyToShipBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        if (bundleId) {
          const response = await readyToShipService.get(bundleId);
          setBundles([response.data]);
        } else {
          const response = await readyToShipService.list({
            page: 1,
            limit: 100,
          });

          const fetchedBundles = response.data;

          const priorityOrder: Record<string, number> = {
            high: 0,
            medium: 1,
            low: 2,
          };

          const sortedBundles = [...fetchedBundles].sort((a, b) => {
            const pa = priorityOrder[(a.priority || '').toLowerCase()] ?? 3;
            const pb = priorityOrder[(b.priority || '').toLowerCase()] ?? 3;
            return pa - pb;
          });

          setBundles(sortedBundles);
        }
      } catch (error) {
        console.error('Error fetching bundles for print:', error);
        toast.error('Failed to load bundles for printing');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [bundleId]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string = '') => {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (['completed', 'dispatched', 'stuffed'].includes(status)) {
      colorClass = 'bg-green-100 text-green-800';
    } else if (status === 'in_progress') {
      colorClass = 'bg-yellow-100 text-yellow-800';
    }

    return (
      <span
        className={`${colorClass} px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600 font-medium">Preparing print view...</p>
      </div>
    );
  }

  return (
    <div className="print-template min-h-screen bg-white text-gray-900 font-sans print:p-0">
      {/* Screen-only controls */}
      <div className="sticky top-0 z-50 bg-white border-b px-6 py-3 flex items-center justify-between print:hidden shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-5 w-px bg-gray-300 mx-2" />
          <h1 className="text-base font-bold text-gray-700 uppercase tracking-wide">
            {bundleId ? 'Bundle Print' : 'Ready to Ship Overview'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {bundles.length} bundle{bundles.length !== 1 ? 's' : ''}
          </Badge>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto px-8 py-10 print:px-10 print:py-8 print:m-0 bg-white print:shadow-none">

        {bundles.length === 0 ? (
          <div className="text-center py-20">
            <Package className="mx-auto h-20 w-20 text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-400">No bundles to display</h3>
          </div>
        ) : (
          <div className="space-y-10 print:space-y-9">
            {bundles.map((bundle) => (
              <div
                key={bundle._id}
                className="bundle-item border-b border-dashed border-gray-200 pb-10 last:border-0 last:pb-0"
              >
                {/* Header area - kept minimal */}
                <div className="flex justify-between items-center mb-7 border-b-2 border-gray-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-wide">Ready to Ship Bundle</h2>
                    <p className="text-sm text-gray-600 mt-1">Bundle #{bundle.bundleNumber}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div>Printed: {new Date().toLocaleDateString('en-GB')}</div>
                  </div>
                </div>

                {/* Summary Table – larger fonts, more padding */}
                <div className="mb-5">
                  <table className="w-full border-2 border-gray-800 text-sm">
                    <tbody>
                      <tr>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs w-1/6">Bundle No.</td>
                        <td className="p-3 border border-gray-700 font-semibold w-1/3">{bundle.bundleNumber}</td>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs w-1/6">Ship Status</td>
                        <td className="p-3 border border-gray-700">{getStatusBadge(bundle.readyToShipStatus)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs">Priority</td>
                        <td className="p-3 border border-gray-700 font-semibold uppercase">{bundle.priority || 'MEDIUM'}</td>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs">Process Status</td>
                        <td className="p-3 border border-gray-700">{getStatusBadge(bundle.status)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs">Type</td>
                        <td className="p-3 border border-gray-700 font-semibold">{bundle.bundleType}</td>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs">Total Qty</td>
                        <td className="p-3 border border-gray-700">
                          <span className="text-lg font-semibold">{bundle.quantity || 0}</span>
                          <span className="text-xs text-gray-500 ml-1.5">PCS</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs">Net Weight</td>
                        <td className="p-3 border border-gray-700 font-medium">
                          {bundle.netWeight ? `${bundle.netWeight} kg` : '—'}
                        </td>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs">Gross Weight</td>
                        <td className="p-3 border border-gray-700 font-medium">
                          {bundle.grossWeight ? `${bundle.grossWeight} kg` : '—'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs">Created</td>
                        <td className="p-3 border border-gray-700">{formatDate(bundle.createdAt)}</td>
                        <td className="p-3 border border-gray-700 bg-gray-100 font-bold uppercase text-xs">Description</td>
                        <td className="p-3 border border-gray-700 text-sm italic text-gray-600">
                          {bundle.description || '—'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Products Table – larger fonts, tighter spacing */}
                <div className="mt-3">
                  <h4 className="text-sm font-bold uppercase text-gray-700 mb-2 tracking-wide">
                    Itemized Product List
                  </h4>
                  <table className="w-full border-2 border-gray-400 text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-800 font-bold border-b-2 border-gray-500">
                        <th className="p-3 border border-gray-400 text-center w-[6%]">#</th>
                        <th className="p-3 border border-gray-400 text-left w-[38%]">Product Name</th>
                        <th className="p-3 border border-gray-400 text-center w-[14%]">Quantity</th>
                        <th className="p-3 border border-gray-400 text-left w-[18%]">Fabric</th>
                        <th className="p-3 border border-gray-400 text-left w-[24%]">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bundle.products?.length ? (
                        bundle.products.map((product, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                            <td className="p-3 border border-gray-400 text-center text-gray-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="p-3 border border-gray-400 font-medium">{product.productName}</td>
                            <td className="p-3 border border-gray-400 text-center font-semibold text-base">
                              {product.productQuantity || 0}
                            </td>
                            <td className="p-3 border border-gray-400">{product.fabric || '—'}</td>
                            <td className="p-3 border border-gray-400 text-gray-600 italic text-sm">
                              {product.description || '—'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-gray-500 italic text-base">
                            No products recorded in this bundle
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer summary */}
        <div className="mt-10 p-5 bg-gray-50 rounded-lg border border-gray-200 print:mt-6 print:bg-white print:border-0">
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold">Total Bundles:</span>{' '}
              <span className="font-bold text-blue-700">{bundles.length}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-600">Generated:</span>{' '}
              <span className="font-medium">{new Date().toLocaleString('en-GB')}</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm 10mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: white !important;
            }
            .print-hidden, .sticky {
              display: none !important;
            }
            .max-w-[210mm] {
              max-width: none !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse;
            }
            td, th {
              padding: 0.5rem 0.65rem !important;
              font-size: 13.5px !important;
            }
            .page-break-inside-avoid {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .bundle-item {
              break-before: page;
              page-break-before: always;
              padding-top: 10mm;
            }
            .bundle-item:first-child {
              break-before: avoid;
              page-break-before: avoid;
              padding-top: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `,
      }} />
    </div>
  );
};

export default ReadyToShipPrintPreview;
