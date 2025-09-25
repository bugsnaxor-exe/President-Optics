const { customers, invoices, nextIds } = require('../data');

module.exports = function handler(req, res) {
  if (req.method === 'POST') {
    const { customer, items, paymentMethod = 'cash', staffId = 1, paidAmount = 0, discount = 0, issueDate, dueDate, total } = req.body;
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
    const invoice = {
      id: 'INV-' + Date.now(),
      patientId: `PAT-${createdCustomer.id}`,
      patientName: createdCustomer.name,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total: total || items.reduce((sum, it) => sum + (Number(it.unitPrice) * Number(it.quantity || 1)), 0) - Number(discount || 0),
      status: paidAmount >= (total || 0) ? 'Paid' : 'Unpaid',
      items: items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity || 1,
        unitPrice: Number(it.unitPrice) || 0
      })),
      shopId: 'SHOP001'
    };

    invoices.push(invoice);

    res.status(201).json(invoice);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}