const { customers } = require('./data');

module.exports = function handler(req, res) {
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
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}