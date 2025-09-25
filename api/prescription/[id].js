const { prescriptions } = require('../data');

export default function handler(req, res) {
  const { id } = req.query;
  const prescriptionId = Number(id);

  if (req.method === 'GET') {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json(prescription);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}