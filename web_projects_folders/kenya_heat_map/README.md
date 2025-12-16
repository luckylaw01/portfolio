# Kenya Education Heatmap - LMS Sales Platform

A comprehensive sales tool for visualizing and managing LMS (Learning Management System) subscription leads across Kenya's educational institutions.

## 🎯 Project Overview

This platform maps **Universities** and **TVET Institutions** across Kenya's 47 counties, providing sales teams with tools to identify, track, and manage potential LMS customers.

## 📁 Project Structure

```
kenya_heat_map/
├── index.html                  # Main heatmap page
├── README.md                   # Project documentation
├── assets/
│   ├── css/
│   │   └── styles.css          # Global styles
│   ├── js/
│   │   └── main.js             # Main JavaScript
│   ├── images/                 # Image assets
│   └── fonts/                  # Custom fonts
├── src/
│   ├── components/             # Reusable components
│   ├── utils/                  # Utility functions
│   └── data/
│       └── institutions.js     # Institution data
├── pages/
│   ├── about.html              # About page
│   ├── contact.html            # Contact page
│   ├── dashboard.html          # Dashboard/Analytics page
│   └── institutions.html       # Institutions list page
├── api/                        # Backend API (PHP)
│   └── (to be created)
├── config/                     # Configuration files
│   └── (to be created)
└── database/                   # Database scripts
    └── (to be created)
```

## 🚀 Installation (XAMPP)

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) installed (Apache + MySQL + PHP)
- Web browser (Chrome, Firefox, Edge)

### Setup Steps

1. **Copy project to XAMPP htdocs**
   ```
   C:\xampp\htdocs\kenya_heat_map\
   ```

2. **Start XAMPP Services**
   - Open XAMPP Control Panel
   - Start **Apache**
   - Start **MySQL**

3. **Access the application**
   ```
   http://localhost/kenya_heat_map/
   ```

4. **Database Setup** (Phase 3+)
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create database: `kenya_lms_db`
   - Import SQL file from `/database/` folder

## ✅ Features

### Phase 1: Core Functionality (Current)
- [x] Interactive Kenya map with 47 counties
- [x] Universities markers (53 institutions)
- [x] TVET institutions markers (75+ institutions)
- [x] Heatmap visualization for market density
- [x] Filter by institution type
- [ ] Search & Filter System
- [ ] Institution Details Panel
- [ ] Data Export (CSV/Excel)

### Phase 2: Sales & Analytics
- [ ] Lead Management System (tag, notes, status)
- [ ] Dashboard Analytics
- [ ] Route Planning for field visits

### Phase 3: Enhanced Features
- [ ] User Authentication (login/register)
- [ ] Database Management (MySQL)
- [ ] Reporting & PDF generation

### Phase 4: Advanced Features
- [ ] Email Integration
- [ ] Calendar & Reminders
- [ ] Mobile Optimization & Offline Mode

## 🛠️ Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Mapping | Leaflet.js, Leaflet.heat |
| Backend | PHP 8.x |
| Database | MySQL 8.x |
| Server | Apache (XAMPP) |

## 📊 Data Included

- **53 Universities** (Public & Private)
- **75+ TVET Institutions** (National Polytechnics, TTIs, VTCs)
- **40+ Counties** covered
- Institution details: Name, Type, County, Coordinates

## 🔧 Development

### Local Development
```bash
# Access via XAMPP
http://localhost/kenya_heat_map/

# phpMyAdmin for database
http://localhost/phpmyadmin/
```

### File Permissions (if needed on Linux/Mac)
```bash
chmod -R 755 kenya_heat_map/
chmod -R 777 kenya_heat_map/uploads/  # If uploads folder exists
```

## 📝 Environment Configuration

Create `config/config.php` (Phase 3):
```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'kenya_lms_db');
?>
```

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Support

For questions or issues, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** December 2025
