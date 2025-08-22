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

// API للمصادقة
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  let users = [];
  
  try {
    users = JSON.parse(fs.readFileSync('users.json'));
  } catch (err) {
    users = [];
  }
  
  const userIndex = users.findIndex(u => u.email === email && u.password === password);
  if (userIndex !== -1) {
    // Generate session token
    const sessionToken = Date.now().toString() + Math.random().toString(36).substr(2);
    const loginTime = new Date().toISOString();
    
    // Update user with session info and login count
    users[userIndex].sessionToken = sessionToken;
    users[userIndex].lastLogin = loginTime;
    users[userIndex].isActive = true;
    users[userIndex].loginCount = (users[userIndex].loginCount || 0) + 1;
    users[userIndex].ipAddress = req.ip || 'unknown';
    
    // Save updated users
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    
    const user = users[userIndex];
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        sessionToken: sessionToken,
        loginCount: user.loginCount
      } 
    });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  let users = [];
  
  try {
    users = JSON.parse(fs.readFileSync('users.json'));
  } catch (err) {
    users = [];
  }
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.json({ success: false, message: 'User already exists' });
  }
  
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
    isActive: false,
    sessionToken: null,
    lastLogin: null,
    loginCount: 0,
    ipAddress: req.ip || 'unknown',
    profilePicture: null,
    preferences: {
      newsletter: false,
      notifications: true
    },
    address: {
      street: '',
      city: '',
      country: '',
      zipCode: ''
    },
    cart: [],
    orders: []
  };
  
  users.push(newUser);
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

// API لتسجيل الخروج
app.post('/api/auth/logout', (req, res) => {
  const { userId } = req.body;
  let users = [];
  
  try {
    users = JSON.parse(fs.readFileSync('users.json'));
  } catch (err) {
    users = [];
  }
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].isActive = false;
    users[userIndex].sessionToken = null;
    users[userIndex].lastLogout = new Date().toISOString();
    
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  }
  
  res.json({ success: true });
});

// API للتحقق من صحة الجلسة
app.post('/api/auth/verify', (req, res) => {
  const { userId, sessionToken } = req.body;
  let users = [];
  
  try {
    users = JSON.parse(fs.readFileSync('users.json'));
  } catch (err) {
    users = [];
  }
  
  const user = users.find(u => u.id === userId && u.sessionToken === sessionToken && u.isActive);
  
  if (user) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

// API لإحصائيات المستخدمين
app.get('/api/users/stats', (req, res) => {
  let users = [];
  
  try {
    users = JSON.parse(fs.readFileSync('users.json'));
  } catch (err) {
    users = [];
  }
  
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    newUsersToday: users.filter(u => {
      const today = new Date().toDateString();
      const userDate = new Date(u.createdAt).toDateString();
      return today === userDate;
    }).length,
    totalLogins: users.reduce((sum, u) => sum + (u.loginCount || 0), 0)
  };
  
  res.json(stats);
});

// API للحصول على معلومات المستخدم
app.get('/api/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  let users = [];
  
  try {
    users = JSON.parse(fs.readFileSync('users.json'));
  } catch (err) {
    users = [];
  }
  
  const user = users.find(u => u.id === userId);
  if (user) {
    // Remove sensitive information
    const { password, sessionToken, ...userInfo } = user;
    res.json({ success: true, user: userInfo });
  } else {
    res.json({ success: false, message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
