const { appointments, nextIds } = require('./data');

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(appointments);
  } else if (req.method === 'POST') {
    const { patientName, date, time, doctorName = 'General Staff', status = 'Scheduled', shopId = 'SHOP001' } = req.body;
    if (!patientName || !date || !time) {
      return res.status(400).json({ error: 'patientName, date, time are required' });
    }

    const appointment = {
      id: `APP${nextIds.appointment++}`,
      patientId: `PAT-${Date.now()}`, // temp id
      patientName,
      doctorName,
      date,
      time,
      status,
      shopId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    appointments.push(appointment);
    res.status(201).json(appointment);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}