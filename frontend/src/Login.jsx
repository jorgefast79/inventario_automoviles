import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/"); // redirige a la app principal
    } catch {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      <input
        placeholder="Usuario"
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />
      <button onClick={handleLogin}>Ingresar</button>
    </div>
  );
}

export default Login;