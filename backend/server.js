
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// AUTH LOGIN
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE username=?', [username]);
  if (rows.length === 0) return res.status(401).json({message:'Usuario no encontrado'});

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({message:'Contraseña incorrecta'});

  const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, {expiresIn:'8h'});
  res.json({token});
});

// AUTH MIDDLEWARE
function auth(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.sendStatus(401);
  try{
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch{
    res.sendStatus(403);
  }
}

//Categories
app.get('/api/categories', auth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, name FROM categories"
  );
  res.json(rows);
});

// BRANDS
app.get('/api/brands', auth, async (req, res) => {
  const [rows] = await db.query("SELECT id, name FROM brands");
  res.json(rows);
});

// MODELS (filtrados por brand)
app.get('/api/models/:brandId', auth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, name FROM models WHERE brand_id=?",
    [req.params.brandId]
  );
  res.json(rows);
});

// SUPPLIERS
app.get('/api/suppliers', auth, async (req, res) => {
  const [rows] = await db.query("SELECT id, name FROM suppliers");
  res.json(rows);
});

// CRUD PARTS
app.get('/api/parts', auth, async (req,res)=>{
  const [rows] = await db.query('SELECT * FROM parts');
  res.json(rows);
});

app.post('/api/parts', auth, async (req,res)=>{
  const {
    code,
    name,
    category_id,
    brand_id,
    model_id,
    year,
    vin,
    condition_status,
    purchase_price,
    sale_price,
    quantity,
    min_stock,
    location,
    supplier_id
  } = req.body;

  await db.query(`
    INSERT INTO parts (
      code, name, category_id, brand_id, model_id,
      year, vin, condition_status,
      purchase_price, sale_price,
      quantity, min_stock,
      location, supplier_id
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `, [
    code, name, category_id, brand_id, model_id,
    year, vin, condition_status,
    purchase_price, sale_price,
    quantity, min_stock,
    location, supplier_id
  ]);

  res.json({message:'Pieza creada'});
});

app.put('/api/parts/:id', auth, async (req,res)=>{
  const {name,quantity} = req.body;
  await db.query('UPDATE parts SET name=?, quantity=? WHERE id=?',[name,quantity,req.params.id]);
  res.json({message:'Pieza actualizada'});
});

app.delete('/api/parts/:id', auth, async (req,res)=>{
  await db.query('DELETE FROM parts WHERE id=?',[req.params.id]);
  res.json({message:'Pieza eliminada'});
});

app.listen(5000,()=>console.log('Backend running on port 5000'));
