# X - The Everything App

Interactive mobile app mockup built with HTML, CSS, and JavaScript.

## Features

- 📱 Realistic iPhone mockup interface
- 🔐 User authentication (signup/login)
- 📝 Post creation and feed
- ❤️ Like and retweet functionality
- 👤 User profiles
- 💬 Messaging (coming soon)
- 💰 Payments (coming soon)
- 🛍️ Marketplace (coming soon)

## How to Run

1. Open `index.html` in a web browser
2. Or use a local server (recommended):
   ```
   # Using PowerShell
   ./start-server.ps1
   
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

## Project Structure

```
x_the_everything_app/
├── index.html          # Main entry point
├── css/
│   ├── phone.css      # Phone mockup styles
│   └── styles.css     # App styles
├── js/
│   ├── navigation.js  # SPA routing
│   ├── app.js         # Core logic
│   ├── view-handlers.js
│   └── view-handlers-2.js
├── views/             # HTML view files
└── assets/            # Images and media
```

## Technology Stack

- Pure HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript (ES6+)
- LocalStorage for data persistence

## Author

Built following the NiTRUST mockup structure - 2025
