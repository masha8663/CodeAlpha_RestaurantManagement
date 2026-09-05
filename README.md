# 🍽️ CodeAlpha_RestaurantManagement

An enterprise-level POS, table reservation, and real-time inventory management system built with Node.js, Express, MongoDB, and Bootstrap 5.

---

## 📌 Project Overview
**CodeAlpha_RestaurantManagement** is a web application designed for modern restaurants and POS setups. It seamlessly integrates live menu ordering with real-time stock deductions, low-stock warnings, thermal invoice generation, and table reservation tracking.

---

## ✨ Key Features
* **📊 Live Analytical Dashboard:** Real-time metrics for total revenue, orders count, low stock warnings, and tax calculations.
* **🛒 Active POS Checkout:** Interactive shopping cart with automatic price calculation, 5% tax inclusion, and stock limit checks.
* **🖨️ Thermal Receipt Generation:** Instant thermal invoice popup ready for local printing.
* **🔑 Secure Admin Panel:** Protected modal interface (`admin123`) to manage stock quantities and publish new menu items.
* **🪑 Table Reservation Management:** Live dining table status tracking (Available, Reserved, Occupied).

---

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, FontAwesome

---

## 📁 Repository Structure
```text
CodeAlpha_RestaurantManagement/
├── index.js            # Express server, API routing & business logic
├── models.js           # Mongoose Database Schemas
├── index.html          # Dynamic Bootstrap single-page UI
├── package.json        # Node.js dependencies and scripts
└── .gitignore          # Ignored files (node_modules, .env)
