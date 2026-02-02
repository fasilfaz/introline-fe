export interface BillBundle {
  _id: string;
  bundleNumber: string;
  description?: string;
  quantity: number;
  netWeight?: number;
  grossWeight?: number;
  packingList: {
    _id: string;
    packingListCode: string;
    bookingReference?: {
      _id: string;
      bookingCode: string;
      sender?: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
      };
      receiver?: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
      };
    };
  };
}

export interface BillDeliveryPartner {
  _id: string;
  name: string;
  phoneNumber: string;
  price: number;
  fromCountry: string;
  toCountry: string;
}

export interface Bill {
  _id: string;
  billNumber: string;
  bundle: BillBundle;
  deliveryPartner: BillDeliveryPartner;
  lrNumber: string;
  deliveryCharge: number;
  totalAmount: number;
  status: 'draft' | 'generated' | 'paid' | 'cancelled';
  generatedAt: string;
  paidAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateBillInput {
  bundleId: string;
  deliveryPartnerId: string;
  lrNumber: string;
  deliveryCharge: number;
}

export interface BillStats {
  totalBills: number;
  totalAmount: number;
  statusCounts: {
    draft?: number;
    generated?: number;
    paid?: number;
    cancelled?: number;
  };
}

export interface BillPrintData {
  billNumber: string;
  generatedAt: string;
  lrNumber: string;
  deliveryCharge: number;
  totalAmount: number;
  status: string;
  bundle: {
    bundleNumber: string;
    description?: string;
    quantity: number;
    netWeight?: number;
    grossWeight?: number;
    packingListCode: string;
  };
  customer: {
    sender?: {
      _id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    receiver?: {
      _id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  deliveryPartner: {
    name: string;
    phoneNumber: string;
    fromCountry: string;
    toCountry: string;
  };
}