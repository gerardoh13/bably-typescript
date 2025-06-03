import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap'
import "bootstrap-icons/font/bootstrap-icons.css";
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
