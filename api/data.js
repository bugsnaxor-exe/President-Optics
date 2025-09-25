// Shared data for API endpoints
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

let products = [
  {
    id: 'Z5X-C9V-B2N',
    name: 'VisionPro Ultra-Thin Frames',
    description: 'Lightweight and durable frames for all-day comfort.',
    price: 199.99,
    stock: 50,
    type: 'Eyewear',
    brand: 'VisionPro',
    createdAt: '2024-01-01',
  },
  {
    id: 'A1S-D4F-G7H',
    name: 'Comprehensive Eye Exam',
    description: 'Full eye health and vision assessment.',
    price: 120.0,
    stock: 999,
    type: 'Service',
    brand: '',
    createdAt: '2024-01-01',
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

let nextIds = { customer: 2, prescription: 2, patient: 3, appointment: 3 };

let appointments = [
  { id: 'APP001', patientId: 'PAT001', patientName: 'Priya Sharma', doctorName: 'Dr. Sunita Gupta', date: new Date().toISOString().split('T')[0], time: '10:00', status: 'Scheduled', shopId: 'SHOP001' },
  { id: 'APP002', patientId: 'PAT002', patientName: 'Rohan Mehta', doctorName: 'Dr. Ramesh Sharma', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '11:00', status: 'Scheduled', shopId: 'SHOP002' }
];

module.exports = {
  patients,
  products,
  invoices,
  purchaseOrders,
  shops,
  doctors,
  admins,
  staff,
  adminPaymentNotices,
  customers,
  prescriptions,
  nextIds,
  appointments
};