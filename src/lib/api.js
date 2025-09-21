import {
  patients,
  invoices,
  purchaseOrders,
  appointments,
  doctors,
  admins,
  adminPaymentNotices,
  shops
} from './data.js';

// Mock delay for demo
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Simple cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Customer Management

export async function getCustomers({ page = 1, limit = 10, search = "" } = {}) {
   const response = await fetch(`/api/patient?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
   if (!response.ok) throw new Error('Failed to fetch customers');
   return await response.json();
}

export async function getCustomerById(id) {
  await delay();
  return patients.find(p => p.id === id) || null;
}

export async function createCustomerWithInvoice(data) {
  await delay();
  const newCustomer = {
    id: `CUS${Date.now()}`,
    ...data.customer,
    createdAt: new Date().toISOString()
  };
  const newInvoice = {
    id: `INV-${Date.now()}`,
    ...data.invoice,
    customerId: newCustomer.id,
    customerName: newCustomer.name,
    status: 'Unpaid',
    createdAt: new Date().toISOString()
  };
  return { customer: newCustomer, invoice: newInvoice };
}

export async function getCustomerHotspots() {
  await delay();
  // Mock hotspots based on customer cities
  const cityCounts = patients.reduce((acc, p) => {
    acc[p.address.city] = (acc[p.address.city] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(cityCounts).map(([city, count]) => ({
    city,
    count,
    latitude: Math.random() * 180 - 90, // Mock coords
    longitude: Math.random() * 360 - 180
  }));
}

// Customer Management
export async function createCustomer(data) {
   await delay();
   const newCustomer = {
     id: `CUS${Date.now()}`,
     ...data,
     lastVisit: new Date().toISOString().split('T')[0],
     loyaltyPoints: 0,
     loyaltyTier: 'Bronze'
   };
   return newCustomer;
}

export async function updateCustomer(id, data) {
   const response = await fetch(`/api/patient/${id}`, {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
   });
   if (!response.ok) throw new Error('Failed to update customer');
   return await response.json();
}

// Prescription Management
export async function createPrescription(data) {
  await delay();
  const newPrescription = {
    id: `PRE${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString()
  };
  return newPrescription;
}

export async function getPrescriptions({ page = 1, limit = 10, customerId } = {}) {
  await delay();
  let filtered = patients.flatMap(p => p.prescription ? [{ ...p.prescription, customerId: p.id, customerName: p.name }] : []);
  if (customerId) {
    filtered = filtered.filter(p => p.customerId === customerId);
  }
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    prescriptions: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit
  };
}

export async function getPrescriptionById(id) {
  await delay();
  const customer = patients.find(p => p.prescription && p.id === id);
  return customer ? { ...customer.prescription, customerId: customer.id, customerName: customer.name } : null;
}

// Additional functions for existing components compatibility
export async function getInvoices() {
  await delay();
  return invoices;
}

export async function createProduct(productData) {
   const localApiUrl = 'http://localhost:3000/api/products'; // Local API for adding products

   try {
       const response = await fetch(localApiUrl, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify(productData),
       });

       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }

       const newProduct = await response.json();
       return newProduct;
   } catch (error) {
       console.error('Error creating product:', error);
       throw error;
   }
}

export async function updateInvoice(invoiceId, invoiceData) {
   const localApiUrl = `http://localhost:3000/api/invoices/${invoiceId}`;

   try {
       const response = await fetch(localApiUrl, {
           method: 'PUT',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify(invoiceData),
       });

       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }

       const updatedInvoice = await response.json();
       return updatedInvoice;
   } catch (error) {
       console.error('Error updating invoice:', error);
       throw error;
   }
}

export async function getProducts(retryCount = 0) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  const cacheKey = 'products';

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('Returning cached products data');
    return cached.data;
  }

  try {
    // Fetch from external API
    const externalUrl = 'https://itcropsolutions.com/PresidentOptical/public/api/products';
    const externalResponse = await fetch(externalUrl);

    if (externalResponse.status === 429) {
      // Rate limited - check if we have cached data to return
      if (cached) {
        console.warn('Rate limited (429). Returning cached data.');
        return cached.data;
      }

      // No cache, implement exponential backoff
      if (retryCount < maxRetries) {
        const delayTime = baseDelay * Math.pow(2, retryCount);
        console.warn(`Rate limited (429). Retrying in ${delayTime}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayTime));
        return getProducts(retryCount + 1);
      } else {
        throw new Error('Rate limit exceeded after maximum retries.');
      }
    }

    if (!externalResponse.ok) {
      throw new Error(`HTTP error! status: ${externalResponse.status}`);
    }

    const apiData = await externalResponse.json();

    // Transform API data to match expected format
    // API prices are in INR, keep as is
    const externalProducts = apiData.map(product => ({
      id: product.id.toString(), // Convert to string to match mock format
      name: product.product_name,
      description: product.description || '',
      price: parseFloat(product.price), // Keep in INR
      stock: product.stock,
      type: product.product_type,
      brand: product.brand || '',
      createdAt: product.creation_date,
    }));

    // Fetch local products
    const localResponse = await fetch('/api/products');
    let localProducts = [];
    if (localResponse.ok) {
      localProducts = await localResponse.json();
    }

    // Combine external and local products, removing duplicates by id
    const combinedProducts = [...externalProducts];
    localProducts.forEach(localProduct => {
      if (!combinedProducts.find(p => p.id === localProduct.id)) {
        combinedProducts.push(localProduct);
      }
    });

    // Cache the combined response
    cache.set(cacheKey, {
      data: combinedProducts,
      timestamp: Date.now()
    });

    return combinedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);

    // Return cached data if available for network errors
    if (cached && (error.name === 'TypeError' || error.message.includes('fetch'))) {
      console.warn('Network error. Returning cached data.');
      return cached.data;
    }

    // For network errors, also try retry logic
    if (retryCount < maxRetries && (error.name === 'TypeError' || error.message.includes('fetch'))) {
      const delayTime = baseDelay * Math.pow(2, retryCount);
      console.warn(`Network error. Retrying in ${delayTime}ms... (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
      return getProducts(retryCount + 1);
    }

    // Throw error instead of falling back to mock data
    throw error;
  }
}

export async function getPurchaseOrders() {
  await delay();
  return purchaseOrders;
}

export async function getShops() {
  await delay();
  return shops;
}

export async function getAppointments() {
  await delay();
  return appointments;
}

export async function getAdmins() {
  await delay();
  return admins;
}

export async function getStaff() {
  await delay();
  // Mock staff data
  return [
    { id: 'STF001', name: 'John Staff', email: 'staff@example.com', lastLogin: '2024-05-20 10:00 AM' },
    { id: 'STF002', name: 'Jane Staff', email: 'staff2@example.com', lastLogin: '2024-05-21 11:30 AM' }
  ];
}

export async function getDoctors() {
  await delay();
  return doctors;
}

export async function getAdminPaymentNotices() {
  await delay();
  return adminPaymentNotices;
}

// Aliases for backward compatibility
export const getProduct = getProducts;
export const getInvoice = getInvoices;
export const getPatients = getCustomers;
export const getPatientById = getCustomerById;
export const createPatient = createCustomer;
