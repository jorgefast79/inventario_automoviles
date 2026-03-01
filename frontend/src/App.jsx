import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './App.css'

function App(){
  const [parts,setParts] = useState([]);
  const [name,setName] = useState('');
  const [quantity,setQuantity] = useState(0);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const token = localStorage.getItem('token');
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [supplier, setSupplier] = useState("");
  const [condition, setCondition] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
      `${API_URL}/categories`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCategories(res.data);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const brandsRes = await axios.get(
        `${API_URL}/brands`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const suppliersRes = await axios.get(
        `${API_URL}/suppliers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBrands(brandsRes.data);
      setSuppliers(suppliersRes.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!brand) return;

    const fetchModels = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/models/${brand}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModels(res.data);
    };

    fetchModels();
  }, [brand]);

  useEffect(()=>{
    if(token){
      axios.get(`${API_URL}/parts`,{
        headers:{Authorization:'Bearer '+token}
      }).then(res=>setParts(res.data));
    }
  },[token]);

  const addPart = () => {
    axios.post(
      `${API_URL}/parts`,
      {
        code: Date.now().toString(),
        name,
        category_id: category,
        brand_id: brand,
        model_id: model,
        condition_status: condition,
        quantity,
        purchase_price: 0,
        sale_price: 0,
        min_stock: 1,
        year: null,
        vin: null,
        location: null,
        supplier_id: supplier || null
      },
      {
        headers: { Authorization: 'Bearer ' + token }
      }
    ).then(() => window.location.reload());
  }

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return(
    <div style={{padding:40}}>
      <h1>Inventario de Piezas</h1>
      <input placeholder="Nombre" onChange={e=>setName(e.target.value)}/>
      <input type="number" placeholder="Cantidad" onChange={e=>setQuantity(e.target.value)}/>
      <select onChange={e => setCategory(e.target.value)}>
        <option value="">Seleccione categoría</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <select onChange={e => setCondition(e.target.value)}>
        <option value="">Seleccione estado</option>
        <option value="BUENO">BUENO</option>
        <option value="REGULAR">REGULAR</option>
        <option value="PARA_REPARAR">PARA_REPARAR</option>
      </select>
      <select onChange={e => setBrand(e.target.value)}>
        <option value="">Seleccione marca</option>
        {brands.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      <select onChange={e => setModel(e.target.value)}>
        <option value="">Seleccione modelo</option>
        {models.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <select onChange={e => setSupplier(e.target.value)}>
        <option value="">Seleccione proveedor</option>
        {suppliers.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <button onClick={addPart}>Agregar</button>
      <ul>
        {parts.map(p=>(
          <li key={p.id}>{p.name} - {p.quantity}</li>
        ))}
      </ul>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}

export default App
