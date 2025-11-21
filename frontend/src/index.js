import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import './i18n/i18n';

// Set initial language direction
const savedLanguage = localStorage.getItem('dzamarket_language') || 'ar';
document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = savedLanguage;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
