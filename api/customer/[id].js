const { customers, invoices } = require('../data');

export default function handler(req, res) {
  const { id } = req.query;
  const customerId = Number(id);

  if (req.method === 'GET') {
    const customer = customers.find(c => c.id === customerId);
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
  } else if (req.method === 'PUT') {
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    customers[customerIndex] = { ...customers[customerIndex], ...req.body, updatedAt: new Date().toISOString() };
    res.json(customers[customerIndex]);
  } else if (req.method === 'DELETE') {
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const deletedCustomer = customers.splice(customerIndex, 1)[0];
    res.json(deletedCustomer);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}