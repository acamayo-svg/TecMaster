import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProveedorAuth } from './contexto/AuthContext'
import { ProveedorTema } from './contexto/TemaContext'
import App from './App'
import './estilos/global.css'

ReactDOM.createRoot(document.getElementById('raiz')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProveedorTema>
        <ProveedorAuth>
          <App />
        </ProveedorAuth>
      </ProveedorTema>
    </BrowserRouter>
  </React.StrictMode>,
)
