# 💰 Budget Tracker - Mobile App Mockup

A fully interactive budget tracking mobile app mockup built with HTML, CSS, and JavaScript. Runs in any modern web browser with a realistic phone interface.

---

## 📋 Implementation Phases

### Phase 1: Foundation & Phone Frame ✅
- [x] Create project folder structure
- [x] Build `index.html` with phone frame container
- [x] Create `phone.css` (device frame, notch, status bar, home button)
- [x] Set up CSS variables and base styles in `styles.css`
- [x] Test phone frame displays correctly

### Phase 2: Navigation System ✅
- [x] Build `Navigation` class in `navigation.js`
- [x] Implement view loading with fetch API
- [x] Add view caching system
- [x] Create navigation history for back button
- [x] Add view transition animations
- [x] Test navigation between views

### Phase 3: Splash & Authentication ✅
- [x] Design `splash.html` with app logo and branding
- [x] Build `onboarding.html` signup form (name, email, PIN)
- [x] Create `login.html` with numeric PIN pad
- [x] Implement user registration (localStorage)
- [x] Implement PIN authentication
- [x] Add session management
- [x] Auto-login for returning users

### Phase 4: Dashboard & Overview ✅
- [x] Design `dashboard.html` layout
- [x] Display total balance (income - expenses)
- [x] Show recent transactions list
- [x] Add quick action buttons (add income/expense)
- [x] Create monthly spending summary
- [x] Implement bottom navigation bar

### Phase 5: Transaction Management ✅
- [x] Build `add-transaction.html` form
- [x] Toggle between income/expense types
- [x] Amount input with currency formatting
- [x] Category selection dropdown
- [x] Date picker
- [x] Notes/description field
- [x] Save transaction to localStorage
- [x] Create `transactions.html` with full history
- [x] Add search and filter functionality
- [ ] Implement transaction edit/delete

### Phase 6: Categories ✅
- [x] Design `categories.html` view
- [x] Default expense categories (Food, Transport, Bills, etc.)
- [x] Default income categories (Salary, Freelance, etc.)
- [x] Category icons/colors
- [x] Add custom category feature
- [x] Edit/delete categories
- [x] Category spending breakdown

### Phase 7: Budget Management ✅
- [x] Build `budgets.html` view
- [x] Create budget for each category
- [x] Set monthly spending limits
- [x] Progress bars showing budget usage
- [x] Budget alerts (80%, 100% thresholds)
- [x] Monthly budget reset logic

### Phase 8: Reports & Analytics ✅
- [x] Add spending charts (pie chart by category)
- [x] Income vs Expense bar chart
- [x] Monthly trends line chart
- [x] Export data feature (CSV)
- [x] Date range filtering

### Phase 9: Settings & Preferences
- [ ] Build `settings.html` view
- [ ] User profile management
- [ ] Currency selection
- [ ] Theme toggle (light/dark mode)
- [ ] Clear all data option
- [ ] Developer tools (for testing)
- [ ] About/version info

### Phase 10: Polish & Testing
- [ ] Add loading states
- [ ] Implement toast notifications
- [ ] Error handling and validation
- [ ] Smooth animations throughout
- [ ] Cross-browser testing
- [ ] Final bug fixes

---

## 🗂️ Project Structure

```
budget_tracker/
│
├── index.html                  # Main entry point with phone frame
│
├── css/
│   ├── phone.css              # Phone device styling
│   └── styles.css             # App-specific styles
│
├── js/
│   ├── navigation.js          # View routing system
│   ├── app.js                 # Core application logic
│   └── view-handlers.js       # Event handlers for views
│
├── views/
│   ├── splash.html            # App launch screen
│   ├── onboarding.html        # User signup
│   ├── login.html             # PIN login screen
│   ├── dashboard.html         # Main home with overview
│   ├── add-transaction.html   # Add income/expense
│   ├── transactions.html      # Transaction history
│   ├── categories.html        # Expense categories
│   ├── budgets.html           # Budget management
│   └── settings.html          # App settings
│
├── assets/                    # Images and icons
│
└── README.md                  # This file
```

---

## 🚀 How to Run

1. Open the project folder in VS Code
2. Use Live Server extension or run a local server
3. Open `index.html` in your browser
4. The app mockup will display in a phone frame

---

## 💾 Data Storage

All data is stored in browser localStorage:
- `users` - User accounts
- `transactions` - Income and expense records
- `categories` - Custom categories
- `budgets` - Monthly budget limits
- `session` - Current user session

---

## 🛠️ Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling & animations
- **JavaScript (ES6+)** - Application logic
- **localStorage** - Data persistence
- **Chart.js** - Charts (Phase 8)

---

## 📱 Features

- Realistic iPhone-style mockup
- PIN-based authentication
- Track income & expenses
- Categorize transactions
- Set and monitor budgets
- Visual spending reports
- Persistent data storage
- Smooth animations

---

Built with ❤️ - Budget Tracker 2025
