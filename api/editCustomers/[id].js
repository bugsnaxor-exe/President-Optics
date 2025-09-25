const { customers } = require('../data');

module.exports = function handler(req, res) {
  const { id } = req.query;
  const customerId = Number(id);

  if (req.method === 'PUT') {
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    customers[customerIndex] = { ...customers[customerIndex], ...req.body, updatedAt: new Date().toISOString() };
    res.json(customers[customerIndex]);
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}