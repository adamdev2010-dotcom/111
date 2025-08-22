const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('.'));
app.use(bodyParser.json());

// API لجلب المنتجات
app.get('/api/products', (req, res) => {
  const data = JSON.parse(fs.readFileSync('products.json'));
  res.json(data);
});

// API لإضافة / حذف المنتجات
app.post('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync('products.json'));
  const action = req.body.action;
  if(action === 'add') {
    products.push(req.body.product);
  } else if(action === 'delete') {
    products.splice(req.body.index, 1);
  }
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  res.json({status: "success", products});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});