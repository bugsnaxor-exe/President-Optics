const express = require('express');
const cors = require('cors');

// Mock data - in a real app, this would come from a database
const patients = [
  {
    id: 'PAT001',
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '555-0101',
    address: { city: 'Optic City', state: 'CA' },
    insuranceProvider: 'Global Health',
    insurancePolicyNumber: 'GH-12345678',
    prescription: {
      sphere: { right: -1.25, left: -1.5 },
      cylinder: { right: -0.5, left: -0.75 },
      axis: { right: 180, left: 175 },
      add: { right: 0, left: 0 },
    },
    lastVisit: '2023-10-15',
    loyaltyPoints: 1250,
    loyaltyTier: 'Silver',
    shopId: 'SHOP001',
  },
  {
    id: 'PAT002',
    name: 'Rohan Mehta',
    email: 'rohan.m@example.com',
    phone: '555-0102',
    address: { city: 'Visionville', state: 'CA' },
    insuranceProvider: 'United Coverage',
    insurancePolicyNumber: 'UC-87654321',
    prescription: {
      sphere: { right: 2.0, left: 2.25 },
      cylinder: { right: 0, left: 0 },
      axis: { right: 0, left: 0 },
      add: { right: 1.75, left: 1.75 },
    },
    lastVisit: '2023-11-02',
    loyaltyPoints: 800,
    loyaltyTier: 'Bronze',
    shopId: 'SHOP002',
  }
];

const products = [
  {
    id: 'Z5X-C9V-B2N',
    name: 'VisionPro Ultra-Thin Frames',
    description: 'Lightweight and durable frames for all-day comfort.',
    price: 199.99,
    stock: 50,
    type: 'Eyewear',
    brand: 'VisionPro',
  },
  {
    id: 'A1S-D4F-G7H',
    name: 'Comprehensive Eye Exam',
    description: 'Full eye health and vision assessment.',
    price: 120.0,
    stock: 999,
    type: 'Service',
  }
];

const invoices = [
  {
    id: 'INV-2024-001',
    patientId: 'PAT001',
    patientName: 'Priya Sharma',
    issueDate: '2023-10-15',
    dueDate: '2023-11-14',
    total: 249.99,
    status: 'Paid',
    items: [
      { productId: 'Z5X-C9V-B2N', productName: 'VisionPro Ultra-Thin Frames', quantity: 1, unitPrice: 199.99 },
      { productId: 'A1S-D4F-G7H', productName: 'Comprehensive Eye Exam', quantity: 1, unitPrice: 50.00 },
    ],
    shopId: 'SHOP001',
  }
];

const purchaseOrders = [
  {
    id: 'PO-2024-001',
    supplier: 'VisionPro Optics',
    orderDate: '2024-01-10',
    total: 2500,
    status: 'Received',
    items: [
      { productId: 'Z5X-C9V-B2N', productName: 'VisionPro Ultra-Thin Frames', quantity: 25, unitPrice: 100, brand: 'VisionPro' },
    ],
    shopId: 'SHOP001',
  }
];

const appointments = [
  { id: 'APP001', patientId: 'PAT001', patientName: 'Priya Sharma', doctorName: 'Dr. Sunita Gupta', date: new Date().toISOString().split('T')[0], time: '10:00 AM', status: 'Scheduled', shopId: 'SHOP001' },
  { id: 'APP002', patientId: 'PAT002', patientName: 'Rohan Mehta', doctorName: 'Dr. Ramesh Sharma', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '11:00 AM', status: 'Scheduled', shopId: 'SHOP002' }
];

const shops = [
  {
    id: 'SHOP001',
    name: 'OptaCore Flagship (Optic City)',
    address: '123 Visionary Ave, Optic City, CA 90210',
    phone: '555-123-4567',
  },
  {
    id: 'SHOP002',
    name: 'OptaCore Visionville',
    address: '456 Lens Lane, Visionville, CA 90211',
    phone: '555-987-6543',
  }
];

const doctors = [
  { id: 'DOC001', name: 'Dr. Sunita Gupta', email: 'doctor@example.com', lastLogin: '2024-05-20 11:00 AM' },
  { id: 'DOC002', name: 'Dr. Ramesh Sharma', email: 'doctor2@example.com', lastLogin: '2024-05-21 09:30 AM' },
  { id: 'DOC003', name: 'Dr. Meena Iyer', email: 'doctor3@example.com', lastLogin: '2024-05-21 09:30 AM' },
];

const admins = [
  { name: 'Admin User', email: 'admin@example.com', lastLogin: '2024-05-22 09:00 AM' },
];

const staff = [
  { name: 'Raj Patel', email: 'staff@example.com', lastLogin: '2024-05-20 10:00 AM' },
];

const adminPaymentNotices = [
  {
    adminEmail: 'admin@example.com',
    amountDue: 250,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lockOnExpire: true,
    status: 'pending',
  }
];

// In-memory stores for new endpoints
let customers = [
  {
    id: 1,
    name: 'Jane Smith',
    phone: '+91-9876543210',
    address: '456 Oak Ave, Sometown, USA',
    createdAt: new Date('2025-09-04T10:30:00.000Z').toISOString(),
    updatedAt: new Date('2025-09-04T10:30:00.000Z').toISOString(),
  },
];

let prescriptions = [
  {
    id: 1,
    patientId: 1,
    rightEye: { sph: -1.25, cyl: -0.5, axis: 180, add: 0, pd: 32, bc: 8.6 },
    leftEye: { sph: -1.5, cyl: -0.75, axis: 170, add: 0, pd: 32, bc: 8.6 },
    createdAt: new Date('2025-09-04T10:35:00.000Z').toISOString(),
    updatedAt: new Date('2025-09-04T10:35:00.000Z').toISOString(),
  },
];

let nextIds = { customer: 2, prescription: 2, patient: 3 };

const app = express();
app.use(cors());
app.use(express.json());

// Original endpoints
app.get('/api/patients', (req, res) => res.json(patients));
app.get('/api/products', (req, res) => res.json(products));
app.get('/api/invoices', (req, res) => res.json(invoices));
app.get('/api/purchase-orders', (req, res) => res.json(purchaseOrders));
app.get('/api/appointments', (req, res) => res.json(appointments));
app.get('/api/shops', (req, res) => res.json(shops));
app.get('/api/doctors', (req, res) => res.json(doctors));
app.get('/api/admins', (req, res) => res.json(admins));
app.get('/api/staff', (req, res) => res.json(staff));
app.get('/api/admin-payment-notices', (req, res) => res.json(adminPaymentNotices));

// New endpoints as requested


// Prescription endpoints
app.post('/api/prescription', (req, res) => {
  const { patientId, rightEye, leftEye } = req.body;
  if (!patientId || !rightEye || !leftEye) {
    return res.status(400).json({ error: 'patientId, rightEye, leftEye are required' });
  }
  const now = new Date().toISOString();
  const prescription = {
    id: nextIds.prescription++,
    patientId: Number(patientId),
    rightEye,
    leftEye,
    createdAt: now,
    updatedAt: now
  };
  prescriptions.push(prescription);
  res.status(201).json(prescription);
});

app.get('/api/prescription', (req, res) => {
  const { page = 1, limit = 10, patientId } = req.query;
  let filtered = prescriptions;

  if (patientId) {
    filtered = prescriptions.filter(p => p.patientId === Number(patientId));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + Number(limit);
  const paginated = filtered.slice(startIndex, endIndex);

  res.json({
    prescriptions: paginated,
    total: filtered.length,
    page: Number(page),
    totalPages: Math.ceil(filtered.length / Number(limit))
  });
});

app.get('/api/prescription/:id', (req, res) => {
  const id = Number(req.params.id);
  const prescription = prescriptions.find(p => p.id === id);
  if (!prescription) {
    return res.status(404).json({ error: 'Prescription not found' });
  }
  res.json(prescription);
});

// Customer endpoints
app.post('/api/customer', (req, res) => {
  const { name, phone, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const now = new Date().toISOString();
  const customer = {
    id: nextIds.customer++,
    name,
    phone: phone || '',
    address: address || '',
    createdAt: now,
    updatedAt: now
  };
  customers.push(customer);
  res.status(201).json(customer);
});

app.get('/api/customer', (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  let filtered = customers;

  if (search) {
    filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }

  const startIndex = (page - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginated = filtered.slice(startIndex, endIndex);

  res.json({
    customers: paginated,
    total: filtered.length,
    page: Number(page),
    totalPages: Math.ceil(filtered.length / Number(limit))
  });
});

app.get('/api/customer/:id', (req, res) => {
  const id = Number(req.params.id);
  const customer = customers.find(c => c.id === id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  // Mock invoices for this customer
  const relatedInvoices = invoices.filter(inv => inv.patientName === customer.name);
  res.json({
    ...customer,
    invoices: relatedInvoices.map(inv => ({
      id: inv.id,
      totalAmount: inv.total,
      status: inv.status?.toUpperCase() || 'PAID',
      items: inv.items?.map(it => ({
        id: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        product: { name: it.productName }
      })) || []
    }))
  });
});

app.get('/api/customer/hotspots', (req, res) => {
  const hotspots = [
    { address: 'Main Street', customerCount: 15 },
    { address: 'Oak Avenue', customerCount: 12 },
  ];
  res.json(hotspots);
});

// Walk-in invoice endpoint
app.post('/api/customer/invoice', (req, res) => {
  const { customer, items, paymentMethod = 'cash', staffId = 1, paidAmount = 0, discount = 0 } = req.body;
  if (!customer || !Array.isArray(items)) {
    return res.status(400).json({ error: 'customer and items are required' });
  }

  // Create customer if not exists
  const createdCustomer = {
    id: nextIds.customer++,
    name: customer.name || 'Walk-in Customer',
    phone: customer.phone || '',
    address: customer.address || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  customers.push(createdCustomer);

  // Create invoice
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.unitPrice) * Number(it.quantity || 1)), 0) - Number(discount || 0);
  const invoice = {
    id: 'INV-' + Date.now(),
    staffId,
    paymentMethod,
    paidAmount,
    totalAmount,
    status: paidAmount >= totalAmount ? 'PAID' : 'UNPAID',
    items: items.map((it, idx) => ({
      id: idx + 1,
      quantity: it.quantity || 1,
      unitPrice: Number(it.unitPrice) || 0,
      product: { name: it.product?.name || 'Item' }
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: createdCustomer
  };

  res.status(201).json(invoice);
});

module.exports = app;
