const { customers, nextIds } = require('./data');

module.exports = function handler(req, res) {
  if (req.method === 'POST') {
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}