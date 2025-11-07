// ✅ Path: src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'   // ✅ fixed — default import (no curly braces)
import './index.css'

// ✅ Create React root and render App

// Global image fallback and auto class for loading -> fade-in
try{
  const originalImage = (window as any).HTMLImageElement;
  // attach onerror fallback for images that fail to load
  (window as any).HTMLImageElement.prototype.__orig_setAttribute = (window as any).HTMLImageElement.prototype.setAttribute;
  (window as any).HTMLImageElement.prototype.setAttribute = function(name, value){
    if(name === 'src'){
      this.classList.add('loading');
      this.addEventListener('load', ()=>{ this.classList.remove('loading'); this.classList.add('fade-in'); }, { once: true });
      this.addEventListener('error', ()=>{ this.src = "/placeholder-600x400.png"; this.classList.remove('loading'); }, { once: true });
    }
    return (window as any).HTMLImageElement.prototype.__orig_setAttribute.apply(this, arguments);
  }
}catch(e){
  // ignore if prototype can't be patched
  console.warn('Image prototype patch failed', e);
}


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
