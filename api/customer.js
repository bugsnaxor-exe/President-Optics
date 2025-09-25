const { customers, invoices, nextIds } = require('./data');

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { page = 1, limit = 10, search = '' } = req.query;
    let filtered = customers;

    if (search) {
      filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }

    const startIndex = (page - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginated = filtered.slice(startIndex, endIndex);

    res.json({
      customers: paginated,
      total: filtered.length,
      page: Number(page),
      totalPages: Math.ceil(filtered.length / Number(limit))
    });
  } else if (req.method === 'POST') {
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
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}