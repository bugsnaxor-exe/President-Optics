const { customers } = require('../data');

module.exports = function handler(req, res) {
  const { id } = req.query;
  const customerId = Number(id);

  if (req.method === 'DELETE') {
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const deletedCustomer = customers.splice(customerIndex, 1)[0];
    res.json(deletedCustomer);
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}