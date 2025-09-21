var express = require('express');
var router = express.Router();

// -----------------------------
// Mock Data Stores
// -----------------------------
const { patients } = require('../src/lib/data.js');

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

let nextIds = { customer: 2, prescription: 2 };

// -----------------------------
// Helper Functions
// -----------------------------
function paginate(list, page = 1, limit = 10) {
  const p = Math.max(parseInt(page) || 1, 1);
  const l = Math.max(parseInt(limit) || 10, 1);
  const start = (p - 1) * l;
  const end = start + l;
  const total = list.length;
  const totalPages = Math.max(Math.ceil(total / l), 1);
  return { data: list.slice(start, end), total, page: p, totalPages };
}

// -----------------------------
// Auth Middleware
// -----------------------------
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Bearer Token' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== 'mysecrettoken') {
    return res.status(403).json({ error: 'Forbidden: Invalid Token' });
  }
  next();
}

// -----------------------------
// Customer Endpoints
// -----------------------------
router.post('/customer', function (req, res) {
  const { name, phone, address } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const now = new Date().toISOString();
  const customer = { id: nextIds.customer++, name, phone, address, createdAt: now, updatedAt: now };
  customers.push(customer);
  res.status(201).json(customer);
});

router.get('/customer', function (req, res) {
  const { page = '1', limit = '10', search = '' } = req.query;
  const s = String(search).toLowerCase();
  const filtered = s ? customers.filter(c => c.name.toLowerCase().includes(s)) : customers;
  const { data, total, totalPages, page: p } = paginate(filtered, page, limit);
  res.json({ customers: data, total, page: p, totalPages });
});

router.get('/customer/:id', function (req, res) {
  const id = parseInt(req.params.id);
  const customer = customers.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ ...customer, invoices: [] });
});

router.put('/customer/:id', function (req, res) {
  const id = req.params.id;
  const customerIndex = customers.findIndex(c => c.id === parseInt(id));
  if (customerIndex === -1) return res.status(404).json({ error: 'Customer not found' });
  customers[customerIndex] = { ...customers[customerIndex], ...req.body, updatedAt: new Date().toISOString() };
  res.json(customers[customerIndex]);
});

router.get('/customer/hotspots', function (req, res) {
  res.json([
    { address: 'Main Street', customerCount: 15 },
    { address: 'Oak Avenue', customerCount: 12 },
  ]);
});

router.post('/customer/invoice', function (req, res) {
  const { customer, items, paymentMethod = 'cash', staffId = 1, paidAmount = 0, discount = 0 } = req.body || {};
  if (!customer || !Array.isArray(items)) return res.status(400).json({ error: 'customer and items are required' });

  const now = new Date().toISOString();
  const createdCustomer = {
    id: nextIds.customer++,
    name: customer.name || 'Walk-in Customer',
    phone: customer.phone || '',
    address: customer.address || '',
    createdAt: now,
    updatedAt: now,
  };
  customers.push(createdCustomer);

  const totalAmount = items.reduce((sum, it) => sum + (Number(it.unitPrice) * Number(it.quantity || 1)), 0) - Number(discount || 0);

  const invoice = {
    id: 'INV-' + Date.now(),
    staffId,
    paymentMethod,
    paidAmount,
    totalAmount,
    status: paidAmount >= totalAmount ? 'PAID' : 'UNPAID',
    prescription: req.body.prescription || null,
    items: items.map((it, idx) => ({
      id: idx + 1,
      quantity: it.quantity || 1,
      unitPrice: Number(it.unitPrice) || 0,
      product: { name: it.product?.name || 'Item' },
    })),
    createdAt: now,
    updatedAt: now,
    customer: createdCustomer,
  };

  res.status(201).json(invoice);
});

// -----------------------------
// Patient Endpoints
// -----------------------------
router.post('/patient', authMiddleware, function (req, res) {
  const { name, age, gender, phone, address, medicalHistory } = req.body || {};
  if (!name || !age || !gender) return res.status(400).json({ error: 'name, age, gender are required' });

  const now = new Date().toISOString();
  const newId = patients.length + 1;
  const patient = {
    id: newId,
    name,
    age,
    gender,
    phone: phone || '',
    address: address || '',
    medicalHistory: medicalHistory || '',
    createdAt: now,
    updatedAt: now,
  };
  patients.push(patient);
  res.status(201).json(patient);
});

// -----------------------------
// Prescription Endpoints
// -----------------------------
router.post('/prescription', function (req, res) {
  const { patientId, rightEye, leftEye } = req.body || {};
  if (!patientId || !rightEye || !leftEye) return res.status(400).json({ error: 'patientId, rightEye, leftEye are required' });

  const now = new Date().toISOString();
  const record = { id: nextIds.prescription++, patientId: Number(patientId), rightEye, leftEye, createdAt: now, updatedAt: now };
  prescriptions.push(record);

  const patient = patients.find(p => String(p.id) === String(patientId));
  res.status(201).json({ ...record, patient: patient ? { id: patientId, name: patient.name } : undefined });
});

router.get('/prescription', function (req, res) {
  const { page = '1', limit = '10', patientId } = req.query;
  const list = patientId ? prescriptions.filter(pr => String(pr.patientId) === String(patientId)) : prescriptions;
  const { data, total, totalPages, page: p } = paginate(list, page, limit);
  const enriched = data.map(pr => {
    const patient = patients.find(pt => String(pt.id) === String(pr.patientId));
    return {
      ...pr,
      patient: patient ? { id: pr.patientId, name: patient.name, age: patient.age, gender: patient.gender } : undefined,
    };
  });
  res.json({ prescriptions: enriched, total, page: p, totalPages });
});

router.get('/prescription/:id', function (req, res) {
  const id = parseInt(req.params.id);
  const pr = prescriptions.find(x => x.id === id);
  if (!pr) return res.status(404).json({ error: 'Prescription not found' });

  const patient = patients.find(pt => String(pt.id) === String(pr.patientId));
  res.json({
    ...pr,
    patient: patient ? { id: pr.patientId, name: patient.name, age: patient.age, gender: patient.gender } : undefined,
  });
});

// -----------------------------
// Additional Endpoints for Frontend Compatibility
// -----------------------------

// GET /api/patient - Return patients without auth for frontend
router.get('/patient', function (req, res) {
  const { page = '1', limit = '10', search = '' } = req.query;
  const s = String(search).toLowerCase();
  const filtered = s ? patients.filter(p => p.name.toLowerCase().includes(s)) : patients;
  const { data, total, totalPages, page: p } = paginate(filtered, page, limit);
  res.json({ patients: data, total, page: p, totalPages });
});

router.put('/patient/:id', function (req, res) {
  const id = req.params.id;
  const patientIndex = patients.findIndex(p => p.id === id);
  if (patientIndex === -1) return res.status(404).json({ error: 'Patient not found' });
  patients[patientIndex] = { ...patients[patientIndex], ...req.body, updatedAt: new Date().toISOString() };
  res.json(patients[patientIndex]);
});

// GET /api/invoices - Mock invoices data
let invoices = [
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
      { productId: 'U3I-O6P-L9K', productName: 'Blue-Light Filtering Add-on', quantity: 1, unitPrice: 50.00 },
    ],
    shopId: 'SHOP001',
  },
  {
    id: 'INV-2024-002',
    patientId: 'PAT002',
    patientName: 'Rohan Mehta',
    issueDate: '2023-11-02',
    dueDate: '2023-12-02',
    total: 120.0,
    status: 'Overdue',
    items: [
      { productId: 'A1S-D4F-G7H', productName: 'Comprehensive Eye Exam', quantity: 1, unitPrice: 120.00 },
    ],
    shopId: 'SHOP002',
  },
];

router.get('/invoices', function (req, res) {
   res.json(invoices);
});

router.put('/invoices/:id', function (req, res) {
   const id = req.params.id;
   const index = invoices.findIndex(inv => inv.id === id);
   if (index === -1) return res.status(404).json({ error: 'Invoice not found' });

   const updatedInvoice = { ...invoices[index], ...req.body, updatedAt: new Date().toISOString() };
   invoices[index] = updatedInvoice;
   res.json(updatedInvoice);
});

// GET /api/products - Mock products data
let products = [
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
  },
  {
    id: 'Q2W-E5R-T8Y',
    name: 'AquaSoft Daily Lenses (30-pack)',
    description: 'Daily disposable contact lenses for ultimate convenience.',
    price: 45.5,
    stock: 200,
    type: 'Contact Lenses',
    brand: 'AquaSoft',
  },
];

router.post('/products', function (req, res) {
  const { id, name, description, price, stock, type, brand, createdAt } = req.body || {};
  if (!id || !name || !price || stock === undefined || !type) {
    return res.status(400).json({ error: 'id, name, price, stock, and type are required' });
  }

  const newProduct = {
    id,
    name,
    description: description || '',
    price: parseFloat(price),
    stock: parseInt(stock),
    type,
    brand: brand || '',
    createdAt: createdAt || new Date().toISOString().split('T')[0],
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.get('/products', function (req, res) {
  res.json(products);
});

// GET /api/purchase-orders - Mock purchase orders
let purchaseOrders = [
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
  },
];

router.get('/purchase-orders', function (req, res) {
  res.json(purchaseOrders);
});

// GET /api/shops - Mock shops data
let shops = [
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

router.get('/shops', function (req, res) {
  res.json(shops);
});

// GET /api/appointments - Mock appointments
let appointments = [
  { id: 'APP001', patientId: 'PAT001', patientName: 'Priya Sharma', doctorName: 'Dr. Sunita Gupta', date: '2024-09-06', time: '10:00 AM', status: 'Scheduled', shopId: 'SHOP001' },
  { id: 'APP002', patientId: 'PAT002', patientName: 'Rohan Mehta', doctorName: 'Dr. Ramesh Sharma', date: '2024-09-08', time: '11:00 AM', status: 'Scheduled', shopId: 'SHOP002' },
];

router.get('/appointments', function (req, res) {
  res.json(appointments);
});

// GET /api/admins - Mock admins
let admins = [
  { id: 'ADM001', name: 'Admin User', email: 'admin@example.com', lastLogin: '2024-05-22 09:00 AM' },
];

router.get('/admins', function (req, res) {
  res.json(admins);
});

// GET /api/staff - Mock staff
let staff = [
  { id: 'STF001', name: 'Staff User', email: 'staff@example.com', lastLogin: '2024-05-22 10:00 AM' },
];

router.get('/staff', function (req, res) {
  res.json(staff);
});

// GET /api/doctors - Mock doctors
let doctors = [
  { id: 'DOC001', name: 'Dr. Sunita Gupta', email: 'doctor@example.com', lastLogin: '2024-05-20 11:00 AM' },
  { id: 'DOC002', name: 'Dr. Ramesh Sharma', email: 'doctor2@example.com', lastLogin: '2024-05-21 09:30 AM' },
];

router.get('/doctors', function (req, res) {
  res.json(doctors);
});

// GET /api/admin-payment-notices - Mock payment notices
let adminPaymentNotices = [
  {
    adminEmail: 'admin@example.com',
    amountDue: 250,
    dueDate: '2024-10-01',
    lockOnExpire: true,
    status: 'pending',
  }
];

router.get('/admin-payment-notices', function (req, res) {
  res.json(adminPaymentNotices);
});

module.exports = router;
