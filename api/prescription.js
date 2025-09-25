const { prescriptions, nextIds } = require('./data');

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { page = 1, limit = 10, patientId } = req.query;
    let filtered = prescriptions;

    if (patientId) {
      filtered = prescriptions.filter(p => p.patientId === Number(patientId));
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginated = filtered.slice(startIndex, endIndex);

    res.json({
      prescriptions: paginated,
      total: filtered.length,
      page: Number(page),
      totalPages: Math.ceil(filtered.length / Number(limit))
    });
  } else if (req.method === 'POST') {
    const { patientId, rightEye, leftEye } = req.body;
    if (!patientId || !rightEye || !leftEye) {
      return res.status(400).json({ error: 'patientId, rightEye, leftEye are required' });
    }
    const now = new Date().toISOString();
    const prescription = {
      id: nextIds.prescription++,
      patientId: Number(patientId),
      rightEye,
      leftEye,
      createdAt: now,
      updatedAt: now
    };
    prescriptions.push(prescription);
    res.status(201).json(prescription);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}