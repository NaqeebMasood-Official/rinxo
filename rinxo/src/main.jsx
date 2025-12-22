import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import  { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'  
import Dashboard from './features/component/dashboard/Dashboard.jsx'

const mainRoute =  createBrowserRouter([
  {
    path:"/",
    element:<Home/>
  },
  {
    path:"/login",
    element:<Login/>
  },
  {
    path:"/register",
    element:<Register/>
  },
  {
    path:"/dashboard",
    element:<Dashboard/>
  }
 

  
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={mainRoute}/>
  </StrictMode>,
)
