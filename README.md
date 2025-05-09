
# 🚑 Kyra – Ambulance Management System

**Kyra** is a full-stack **ambulance coordination system** designed to improve emergency response by enabling **real-time communication** between ambulance drivers and hospitals. It includes two web portals:

- 🚑 **Ambulance Driver Portal** – to receive routing, update patient status, and provide real-time location updates.
- 🏥 **Hospital Portal** – to track incoming ambulances, view their ETA, and manage hospital resources.

Both portals utilize **Leaflet** for map-related functionalities.

---

## 🌐 Web Portals Overview

### 🚑 Ambulance Driver Portal (`frontend/` + `backend/`)

- View and follow real-time routing instructions
- Provide patient status updates (e.g., stable, critical)
- Track ambulance location using Leaflet for live updates
- Notify hospitals upon arrival or delays

### 🏥 Hospital Portal (`frontend_2/` + `backend_2/`)

- View incoming ambulances with live location updates (Leaflet integration)
- Monitor ambulance ETA and patient status
- Manage hospital bed/ICU availability based on patient needs

---

## 🛠️ Tech Stack

- **Frontend**: React.js (for both portals)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **APIs Used**:
  - **Leaflet**: For map integration and ambulance tracking
  - **Google Maps API** (optional for advanced routing features)
  - **Hospital Data API** (optional/mock)

---

## 📁 Folder Structure

```
kyra/
├── frontend/         # React app for ambulance drivers
├── frontend_2/       # React app for hospital staff
├── backend/          # Node/Express backend for ambulance portal
├── backend_2/        # Node/Express backend for hospital portal
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kyra.git
cd kyra
```

### 2. Set Up Backend for Ambulance Portal

```bash
cd backend
npm install
nodemon index.js
```

### 3. Set Up Backend for Hospital Portal

```bash
cd ../backend_2
npm install
nodemon index.js
```

### 4. Set Up Frontend for Ambulance Portal

```bash
cd ../frontend
npm install
npm start
```

### 5. Set Up Frontend for Hospital Portal

```bash
cd ../frontend_2
npm install
npm start
```

> ✅ Ensure `.env` files are properly set up in both backends with:
```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/kyra
GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

## 📍 Leaflet Integration

- **Frontend (Ambulance & Hospital Portals)**:  
  Both portals use **Leaflet** for mapping and real-time tracking of ambulance locations. The ambulance's GPS data is shown on a map, which updates continuously to show the ambulance's journey toward the hospital.
  
  Install Leaflet for frontend:

  ```bash
  npm install leaflet
  ```

  

## 📊 Key Features

- 🔄 **Real-Time Updates**: Between ambulance drivers and hospital staff
- 🚦 **Traffic-Aware Routing**: Optimized hospital routes for ambulances using traffic data (optional)
- 🗺️ **Leaflet Map Integration**: For live tracking of ambulances in both portals
- 🧾 **Dynamic Patient Status**: Ambulance drivers can update patient conditions
- 🛏️ **Hospital Dashboard**: Hospitals can manage bed/ICU availability and prepare for incoming patients

---

## ⚙️ Future Enhancements

- Authentication and role-based access control for added security
- Push notifications for hospital staff and ambulance drivers
- Mobile app for ambulance drivers with real-time map updates
- Integration with external emergency systems and EMR (Electronic Medical Records)

---

## 🤝 Contributing

We welcome contributions! Please fork the repository, submit a pull request, or raise an issue.

---

## 📄 License

This project is licensed under the MIT License.

