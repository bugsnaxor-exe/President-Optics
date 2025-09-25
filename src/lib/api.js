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

export async function listCustomer({ page = 1, limit = 10, search = "" } = {}) {
    let allCustomers = [];

    // First, try to fetch from local API
    try {
        const localResponse = await fetch('/api/listCustomers');
        if (localResponse.ok) {
            const localData = await localResponse.json();
            console.log('Local customers data:', localData);

            // Transform local data to expected format
            const localCustomers = (localData.customers || []).map(customer => ({
                id: customer.id.toString(),
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone || '',
                address: {
                    city: customer.address || 'Unknown',
                    state: ''
                },
                createdAt: customer.createdAt
            }));
            allCustomers = [...allCustomers, ...localCustomers];
        }
    } catch (localError) {
        console.warn('Local API not available for customers:', localError.message);
    }

    // Then, try to fetch from external API
    try {
        const response = await fetch('https://itcropsolutions.com/PresidentOptical/public/api/listCustomers');
        if (response.ok) {
            const externalData = await response.json();
            console.log('Raw API response for listCustomers:', externalData);

            // Handle different response structures
            let customerArray = externalData;
            if (typeof externalData === 'object' && !Array.isArray(externalData)) {
                // If it's an object, try to find the array in common keys
                if (externalData.customers) {
                    customerArray = externalData.customers;
                } else if (externalData.data) {
                    customerArray = externalData.data;
                } else if (externalData.results) {
                    customerArray = externalData.results;
                } else {
                    // If no known key, assume the object is the array (unlikely)
                    customerArray = [externalData];
                }
            }

            // Transform external API data to match expected format
            const externalCustomers = customerArray.map(customer => ({
                id: customer.id.toString(),
                name: customer.customer_name,
                email: customer.customer_email || '',
                phone: customer.customer_phone,
                address: {
                    city: customer.customer_city || 'Unknown',
                    state: customer.customer_state || ''
                },
                createdAt: customer.created_at
            }));

            // Combine and remove duplicates by id
            const combinedMap = new Map();
            [...allCustomers, ...externalCustomers].forEach(customer => {
                combinedMap.set(customer.id, customer);
            });
            allCustomers = Array.from(combinedMap.values());
        }
    } catch (externalError) {
        console.warn('External API not available for customers:', externalError.message);
    }

    // Apply search filter
    if (search) {
        allCustomers = allCustomers.filter(customer =>
            customer.name.toLowerCase().includes(search.toLowerCase()) ||
            customer.email.toLowerCase().includes(search.toLowerCase()) ||
            customer.phone.includes(search)
        );
    }

    // Paginate the results
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
        customers: allCustomers.slice(start, end),
        total: allCustomers.length,
        page,
        limit
    };
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

export async function addCustomer(data) {
    console.log('addCustomer called with data:', data);
    const requestBody = {
      name: data.name,
      phone: data.phone,
      address: data.address?.city || 'Unknown'
    };
    console.log('Sending request body:', requestBody);

    try {
      const response = await fetch('/api/addCustomers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`Failed to create customer: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Response data:', result);
      return result;
    } catch (error) {
      console.error('addCustomer error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

export async function editCustomer(id, data) {
     const response = await fetch(`https://itcropsolutions.com/PresidentOptical/public/api/editCustomers/${id}`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             customer_name: data.name,
             customer_email: data.email,
             customer_phone: parseInt(data.phone.replace(/\D/g, '')) || 0,
             customer_city: data.address?.city || 'Unknown',
             customer_state: data.address?.state || ''
           })
       });
       if (!response.ok) throw new Error('Failed to update customer');
       return await response.json();
  }

export async function deleteCustomer(id) {
    try {
        // Try external API first
        const externalResponse = await fetch(`https://itcropsolutions.com/PresidentOptical/public/api/deleteCustomers/${id}`, {
            method: 'DELETE'
        });
        if (externalResponse.ok) {
            return await externalResponse.json();
        }
    } catch (externalError) {
        console.warn('External delete failed:', externalError.message);
    }

    // Fallback to local API
    try {
        const localResponse = await fetch(`/api/deleteCustomers/${id}`, {
            method: 'DELETE'
        });
        if (localResponse.ok) {
            return await localResponse.json();
        } else {
            throw new Error(`Local delete failed: ${localResponse.status}`);
        }
    } catch (localError) {
        console.error('Local delete failed:', localError.message);
        throw new Error('Failed to delete customer from any source');
    }
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
  let allInvoices = [];

  // First, try to fetch from local API
  try {
    const localResponse = await fetch('/api/invoices');
    if (localResponse.ok) {
      const localInvoices = await localResponse.json();
      console.log('Local invoices data:', localInvoices);

      // Transform local invoices to expected format
      const transformedLocalInvoices = localInvoices.map(invoice => ({
        id: invoice.id,
        patientId: invoice.customer?.id?.toString() || '',
        patientName: invoice.customer?.name || 'Unknown Patient',
        issueDate: invoice.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        dueDate: invoice.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        total: invoice.totalAmount || 0,
        status: invoice.status || 'Unpaid',
        items: invoice.items?.map(item => ({
          productId: item.product?.id?.toString() || '',
          productName: item.product?.name || 'Unknown Product',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0
        })) || [],
        shopId: 'SHOP001'
      }));
      allInvoices = [...allInvoices, ...transformedLocalInvoices];
    }
  } catch (localError) {
    console.warn('Local API not available for invoices:', localError.message);
  }

  // Then, try to fetch from external API
  try {
    const response = await fetch('https://itcropsolutions.com/PresidentOptical/public/api/listInvoice');
    if (response.ok) {
      const externalData = await response.json();

      // Handle different response structures
      let invoiceArray = externalData;
      if (typeof externalData === 'object' && !Array.isArray(externalData)) {
        // If it's an object, try to find the array in common keys
        if (externalData.invoices) {
          invoiceArray = externalData.invoices;
        } else if (externalData.data) {
          invoiceArray = externalData.data;
        } else if (externalData.results) {
          invoiceArray = externalData.results;
        } else {
          // If no known key, assume the object is the array (unlikely)
          invoiceArray = [externalData];
        }
      }

      // Group invoice items by invoice_id since API returns individual line items
      const invoiceGroups = {};
      invoiceArray.forEach(item => {
        const invoiceId = item.invoice_id || `INV-${item.id}`;
        if (!invoiceGroups[invoiceId]) {
          invoiceGroups[invoiceId] = {
            id: invoiceId,
            patientId: item.customer_id?.toString() || '',
            patientName: item.customer_email || 'Unknown Patient', // Using email as name since name isn't provided
            issueDate: item.issue_date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            dueDate: item.due_date || item.issue_date || new Date().toISOString().split('T')[0],
            total: 0, // Will calculate from items
            status: 'Unpaid', // API doesn't provide status, defaulting to Unpaid
            items: [],
            shopId: 'SHOP001'
          };
        }

        // Add item to the invoice
        const invoiceItem = {
          productId: item.product_id?.toString() || '',
          productName: item.product_name || 'Unknown Product',
          quantity: parseInt(item.product_qty) || 1,
          unitPrice: parseFloat(item.unit_price) || 0
        };

        invoiceGroups[invoiceId].items.push(invoiceItem);
        invoiceGroups[invoiceId].total += invoiceItem.quantity * invoiceItem.unitPrice;
      });

      // Convert grouped invoices to array and combine with local
      const externalInvoices = Object.values(invoiceGroups);

      // Combine and remove duplicates by id
      const combinedMap = new Map();
      [...allInvoices, ...externalInvoices].forEach(invoice => {
        combinedMap.set(invoice.id, invoice);
      });
      allInvoices = Array.from(combinedMap.values());
    }
  } catch (externalError) {
    console.warn('External API not available for invoices:', externalError.message);
  }

  return allInvoices;
}

export async function addInvoice(invoiceData) {
  console.log('addInvoice called with data:', invoiceData);

  const requestBody = {
    customer: {
      name: invoiceData.patientName,
      phone: invoiceData.phone,
      address: invoiceData.address?.city || 'Unknown'
    },
    items: invoiceData.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })),
    paymentMethod: 'cash',
    staffId: 1,
    paidAmount: 0,
    discount: 0,
    issueDate: invoiceData.issueDate,
    dueDate: invoiceData.dueDate,
    total: invoiceData.total
  };

  console.log('Sending request body:', requestBody);

  try {
    const response = await fetch('/api/customer/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`Failed to create invoice: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Response data:', result);

    // Try to sync with external API
    try {
      const externalResponse = await fetch('/api/proxy/addInvoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mysecrettoken' // Use the local token
        },
        body: JSON.stringify(requestBody)
      });
      if (externalResponse.ok) {
        console.log('External invoice sync successful');
      } else {
        console.warn('External invoice sync failed:', externalResponse.status);
      }
    } catch (externalError) {
      console.warn('External invoice sync error:', externalError.message);
    }

    return result;
  } catch (error) {
    console.error('addInvoice error:', error);
    throw error;
  }
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

export async function updateProduct(productId, productData) {
    const localApiUrl = `http://localhost:3000/api/products/${productId}`;

    try {
        const response = await fetch(localApiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedProduct = await response.json();
        return updatedProduct;
    } catch (error) {
        console.error('Error updating product:', error);
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

  let combinedProducts = [];

  // Always try to fetch local products first as fallback
  let localProducts = [];
  try {
    const localResponse = await fetch('/api/products');
    if (localResponse.ok) {
      localProducts = await localResponse.json();
      console.log('Local products fetched:', localProducts.length);
    }
  } catch (error) {
    console.warn('Local API not available:', error.message);
  }

  try {
    // Fetch from external API
    const externalUrl = 'https://itcropsolutions.com/PresidentOptical/public/api/products';
    const externalResponse = await fetch(externalUrl);

    if (externalResponse.status === 429) {
      // Rate limited - use local products
      console.warn('External API rate limited (429). Using local products.');
      combinedProducts = [...localProducts];
    } else if (!externalResponse.ok) {
      console.warn(`External API error: ${externalResponse.status}. Using local products.`);
      combinedProducts = [...localProducts];
    } else {
      const apiData = await externalResponse.json();
      console.log('External API data received:', apiData);

      // Transform API data to match expected format
      // API prices are in INR, keep as is
      const externalProducts = Array.isArray(apiData) ? apiData.map(product => ({
        id: product.id?.toString() || '', // Convert to string to match mock format
        name: product.product_name || '',
        description: product.description || '',
        price: parseFloat(product.price) || 0, // Keep in INR
        stock: product.stock || 0,
        type: product.product_type || 'Eyewear',
        brand: product.brand || '',
        createdAt: product.creation_date || new Date().toISOString().split('T')[0],
      })) : [];

      console.log('External products transformed:', externalProducts.length);

      // Combine external and local products, removing duplicates by id
      combinedProducts = [...externalProducts];
      localProducts.forEach(localProduct => {
        if (!combinedProducts.find(p => p.id === localProduct.id)) {
          combinedProducts.push(localProduct);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching external products:', error);
    // Use only local products
    combinedProducts = [...localProducts];
  }

  // If still no products, throw error
  if (combinedProducts.length === 0) {
    throw new Error('No products available from any source');
  }

  // Cache the combined response
  cache.set(cacheKey, {
    data: combinedProducts,
    timestamp: Date.now()
  });

  console.log('Returning combined products:', combinedProducts.length);
  return combinedProducts;
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

export async function addAppointment(appointmentData) {
  console.log('addAppointment called with data:', appointmentData);

  try {
    const response = await fetch('/api/appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`Failed to create appointment: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Response data:', result);
    return result;
  } catch (error) {
    console.error('addAppointment error:', error);
    throw error;
  }
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
export const getCustomers = listCustomer;
export const getProduct = getProducts;
export const getInvoice = getInvoices;
export const getPatients = getCustomers;
export const getPatientById = getCustomerById;
export const createPatient = addCustomer;
