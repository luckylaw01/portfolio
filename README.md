# 🎨 Creative Portfolio Presentation

A stunning, presentation-style portfolio showcasing creative projects with beautiful animations and smooth transitions.

## 📁 Project Structure

```
portfolio-1/
│
├── index.html                 # Main HTML file
├── projects.json              # Project data configuration
│
├── assets/
│   ├── css/
│   │   ├── main.css          # Core styles & design system
│   │   ├── animations.css    # Animation & transition effects
│   │   └── slides.css        # Slide template styles
│   │
│   ├── js/
│   │   ├── main.js           # Application orchestrator
│   │   ├── slideEngine.js    # Slide management engine
│   │   ├── navigation.js     # Navigation controls
│   │   ├── gestures.js       # Touch/swipe gestures
│   │   └── utils.js          # Utility functions
│   │
│   └── images/               # Images for portfolio
│       └── projects/         # Project screenshots/images
│
├── slides/                   # Reserved for custom slide templates
│
└── web_projects_folders/     # Local web projects
    ├── budget_tracker/
    ├── fbas/
    ├── kenya_heat_map/
    └── ... (other projects)
```

## 🎯 Features

- **Horizontal Slide Navigation** - Smooth left-to-right transitions
- **Multiple Navigation Methods**:
  - Arrow buttons (prev/next)
  - Keyboard shortcuts (arrows, space, home, end)
  - Pagination dots
  - Touch/swipe gestures (mobile)
  - Mouse drag (desktop)
- **Slide Counter** - Shows current position (e.g., "3 / 12")
- **Dynamic Project Loading** - Projects loaded from `projects.json`
- **Multiple Project Types**:
  - **Web (Hosted)** - External websites with screenshots
  - **Web (Local)** - Embedded local projects via iframe
  - **Images** - Posters, flyers, designs
  - **Videos** - YouTube embeds
  - **3D Designs** - 3D model renders

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#ec4899` (Pink)
- **Accent**: `#8b5cf6` (Purple)
- **Background**: Dark gradient theme

### Typography
- **Primary Font**: Inter
- **Display Font**: Outfit

### Effects
- Glass morphism
- Gradient animations
- Smooth transitions
- Stagger animations

## 📝 How to Use

### 1. Configure Your Intro
Edit `projects.json` intro section:
```json
{
  "intro": {
    "name": "Your Name",
    "title": "Creative Portfolio",
    "bio": "Your introduction here",
    "avatar": "./assets/images/avatar.jpg"
  }
}
```

### 2. Add Projects
Add projects to the `projects` array in `projects.json`:

**Hosted Website:**
```json
{
  "id": "project-001",
  "name": "Project Name",
  "type": "web-hosted",
  "category": "website",
  "date": "2024-01",
  "description": "Brief description",
  "story": "The inspiration behind this project",
  "liveUrl": "https://example.com",
  "screenshot": "./assets/images/projects/screenshot.jpg",
  "technologies": ["HTML", "CSS", "JavaScript"]
}
```

**Local Web Project:**
```json
{
  "id": "project-002",
  "name": "Local Project",
  "type": "web-local",
  "category": "website",
  "date": "2024-02",
  "description": "Description",
  "story": "Why this was created",
  "localPath": "./web_projects_folders/project_name",
  "entryFile": "index.html",
  "technologies": ["React", "Tailwind"]
}
```

**Image/Design:**
```json
{
  "id": "project-003",
  "name": "Design Name",
  "type": "image",
  "category": "poster",
  "date": "2024-03",
  "description": "Design description",
  "story": "Creative process",
  "imagePath": "./assets/images/projects/design.jpg",
  "tools": ["Photoshop", "Illustrator"]
}
```

**Video:**
```json
{
  "id": "project-004",
  "name": "Video Project",
  "type": "video",
  "category": "motion-graphics",
  "date": "2024-04",
  "description": "Video description",
  "story": "Inspiration",
  "youtubeId": "VIDEO_ID_HERE",
  "thumbnail": "./assets/images/projects/thumb.jpg",
  "tools": ["After Effects"]
}
```

### 3. Add Images
Place your images in:
- `./assets/images/avatar.jpg` - Your profile picture
- `./assets/images/projects/` - Project screenshots and images

### 4. Run Locally
Simply open `index.html` in a modern browser, or use a local server:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# VS Code Live Server
Right-click index.html > Open with Live Server
```

## 🎮 Navigation Controls

- **Arrow Keys** ← → : Navigate between slides
- **Space Bar**: Go to next slide
- **Home**: Jump to first slide
- **End**: Jump to last slide
- **Mouse Drag**: Swipe to navigate (desktop)
- **Touch Swipe**: Swipe to navigate (mobile)
- **Dots**: Click any dot to jump to that slide
- **Buttons**: Click prev/next buttons

## 🚀 Next Steps

1. Update `projects.json` with your information
2. Add your avatar and project images
3. Customize colors in `assets/css/main.css` if needed
4. Test all navigation methods
5. Deploy to your hosting platform

## 📱 Responsive Design

The portfolio is fully responsive and works beautifully on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🎨 Customization

All design tokens are in CSS variables at the top of `assets/css/main.css`:
- Colors
- Spacing
- Typography
- Transitions
- Shadows
- Border radius

Change these to match your brand!

---

**Built with love and creativity** ✨
