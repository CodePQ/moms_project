# The Quiet Return

A professional, calm, and reflective website for **The Quiet Return** project by Lorraine Paquette. This site is designed to offer a peaceful digital space for midlife women seeking reconnection and authenticity.

## 🌿 Design Philosophy
The website adheres to a "Calm and Reflective" aesthetic, using a palette inspired by natural elements:
- **Linen**: Soft, warm backgrounds for a spacious feel.
- **Misty & Seascape**: Ethereal blues and grays for imagery and accents.
- **Deep Slate**: Sharp, readable typography for a sophisticated touch.

## 📂 Project Structure
```text
moms_project/
├── assets/              # Images and visual assets
│   ├── hero-bg.png      # Custom generated misty landscape
│   └── reflections/     # Gallery of Reflections images
├── css/
│   └── styles.css       # Core design system and component styles
├── js/
│   └── main.js          # Scroll-reveal animations and smooth-scroll logic
├── supabase/             # Edge function + SQL for the contact/registration forms
├── index.html            # Homepage
├── book.html             # The Book landing / excerpt
├── community.html        # Reflective space details
├── circle.html           # Guided monthly group gathering info
├── pathway.html          # 1:1 guidance details ("Return To You" / "Becoming")
├── bridge.html           # Partner & couple resources (unfinished, noindexed, not in nav)
├── connect.html          # Contact form
├── gallery.html          # Gallery of Reflections (image gallery)
├── reader-portal.html    # Landing page for book readers
├── registration.html     # Circle gathering registration + Stripe buy button
├── privacy.html          # Privacy policy
├── disclaimer.html       # Business/website disclaimer
├── robots.txt
└── sitemap.xml
```

## 🚀 Local Development
To view the website locally:
1. Clone the repository.
2. Run a local server in the terminal:
   ```
   python -m http.server 8000
   ```
3. Open a new tab in a modern browser, Visit `http://localhost:8000`.

## 🌐 Deployment to GoDaddy
This is a static website, making it compatible with any standard web host.
1. Log in to your GoDaddy cPanel.
2. Open **File Manager** and navigate to `public_html`.
3. Upload all files and folders (`css/`, `js/`, `assets/`, and all `.html` files).
4. For detailed instructions, see the [Godaddy Integration Guide](https://github.com/CodePQ/moms_project/blob/main/godaddy_integration_guide.md) (if uploaded) or the provided artifact.

## ✨ Built With
- **HTML5/CSS3**: Custom vanilla CSS design system.
- **JavaScript**: Intersection Observer API for smooth "reveal" animations.
- **Typography**: Lora (Headings) and Inter (Body) via Google Fonts.

---
*Created with care for The Quiet Return.*
