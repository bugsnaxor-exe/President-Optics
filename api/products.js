const { products } = require('./data');

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(products);
  } else if (req.method === 'POST') {
    const { id, name, description, price, stock, type, brand, createdAt } = req.body;
    if (!id || !name || price === undefined || stock === undefined || !type) {
      return res.status(400).json({ error: 'id, name, price, stock, type are required' });
    }
    const newProduct = {
      id,
      name,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      type,
      brand: brand || '',
      createdAt: createdAt || new Date().toISOString().split('T')[0]
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}