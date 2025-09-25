const { customers, nextIds } = require('../data');

module.exports = function handler(req, res) {
  if (req.method === 'POST') {
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}