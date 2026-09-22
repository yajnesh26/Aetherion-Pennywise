import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const entryParams = new URLSearchParams(window.location.search)
const oauthToken = entryParams.get("token")
if (oauthToken) {
  localStorage.setItem("token", oauthToken)
  window.history.replaceState({}, document.title, window.location.pathname)
  if (window.location.pathname !== "/dashboard") {
    window.location.replace("/dashboard")
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
