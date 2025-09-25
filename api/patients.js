const { patients } = require('./data');

module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(patients);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}