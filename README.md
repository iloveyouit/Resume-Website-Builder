# Resume Website Builder - Proof of Concept

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Create a professional online resume website in minutes! This package transforms your data into a beautiful, responsive website that can be hosted on GitHub Pages for free.

## 🎯 Proof of Concept Status

This is a **working proof of concept** that demonstrates the core functionality of transforming the rob.loftin.github.io repository into a reusable resume website builder.

### ✅ What's Implemented

- ✓ **Modular Architecture**: Separates template from data using Handlebars
- ✓ **JSON Configuration**: Easy-to-edit resume-data.json file
- ✓ **Build System**: Automated compilation of template + data → HTML
- ✓ **Professional Design**: Responsive CSS with modern styling
- ✓ **Multiple Sections**: Experience, Skills, Projects, Education, Certifications, Testimonials
- ✓ **SEO Optimized**: Meta tags, sitemap.xml, robots.txt
- ✓ **Print Friendly**: Optimized for PDF export

### 📋 What's Not Implemented (Future Enhancements)

- LinkedIn API integration
- Resume file parser (PDF, DOCX)
- Interactive configuration wizard
- Multiple theme support
- CLI tool
- GitHub Actions deployment

## 🚀 Quick Start

### Prerequisites

- Node.js v14 or higher
- npm v6 or higher

### Installation

```bash
# Clone or navigate to the project directory
cd resume-website-builder

# Install dependencies (already done in this demo)
npm install
```

### Configuration

1. Edit `config/resume-data.json` with your information:

```json
{
  "personal": {
    "fullName": "Your Name",
    "title": "Your Title",
    "email": "your.email@example.com",
    ...
  },
  "experience": [...],
  "education": [...],
  ...
}
```

2. Add your profile photo to `src/images/profile.jpg`

### Build

```bash
npm run build
```

This will:
- Load your configuration from `config/resume-data.json`
- Compile the Handlebars template with your data
- Generate the final HTML in `dist/index.html`
- Copy all CSS, JavaScript, and images to `dist/`
- Create sitemap.xml and robots.txt

### Preview

Open `dist/index.html` in your web browser to see your resume website!

```bash
open dist/index.html
```

## 📂 Project Structure

```
resume-website-builder/
├── config/
│   └── resume-data.json          # Your resume data (edit this!)
├── src/
│   ├── index.html                # Handlebars template
│   ├── css/
│   │   └── styles.css            # Styles
│   ├── js/
│   │   └── main.js               # JavaScript functionality
│   └── images/
│       └── profile.jpg           # Your photo
├── scripts/
│   └── build.js                  # Build script
├── dist/                         # Generated website (output)
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── sitemap.xml
│   └── robots.txt
├── package.json
└── README.md
```

## 🎨 Customization

### Edit Your Information

Simply edit `config/resume-data.json`. All sections are configurable:

- **Personal Info**: Name, title, contact, social links
- **Summary**: Professional summary and about me
- **Experience**: Work history with achievements
- **Education**: Academic background
- **Skills**: Categorized skills with proficiency levels
- **Projects**: Featured portfolio items
- **Certifications**: Professional credentials
- **Testimonials**: Client recommendations
- **Articles**: Blog posts or publications

### Enable/Disable Sections

In `config/resume-data.json`, control which sections appear:

```json
"settings": {
  "sectionsEnabled": {
    "professionalSummary": true,
    "about": true,
    "skills": true,
    "projects": true,
    "articles": false,      // Disable articles section
    "testimonials": true,
    "certifications": true
  }
}
```

### Customize Colors

Change the theme colors in `config/resume-data.json`:

```json
"settings": {
  "colors": {
    "primary": "#2563eb",
    "secondary": "#1e40af",
    "accent": "#3b82f6"
  }
}
```

### Advanced Customization

- **Styles**: Edit `src/css/styles.css`
- **Layout**: Modify `src/index.html` template
- **Behavior**: Update `src/js/main.js`

## 🔧 How It Works

### 1. Template System

The `src/index.html` file uses Handlebars syntax:

```html
<h1>{{personal.fullName}}</h1>
<p>{{personal.title}}</p>

{{#each experience}}
  <h3>{{title}}</h3>
  <p>{{company}}</p>
{{/each}}
```

### 2. Build Process

The `scripts/build.js` script:

1. Loads `config/resume-data.json`
2. Loads `src/index.html` template
3. Compiles template with Handlebars
4. Replaces placeholders with actual data
5. Outputs final HTML to `dist/index.html`
6. Copies assets (CSS, JS, images)
7. Generates sitemap.xml and robots.txt

### 3. Result

Pure HTML/CSS/JS website that can be deployed anywhere!

## 📊 Build Output Example

```
════════════════════════════════════════
   Resume Website Builder - Build
════════════════════════════════════════

✓ Configuration loaded successfully
✓ Template compiled successfully
✓ HTML file written
✓ CSS files copied
✓ JavaScript files copied
✓ Images copied
✓ Sitemap generated
✓ Robots.txt generated

════════════════════════════════════════
   ✓ Build Complete!
════════════════════════════════════════

Build Summary:
─────────────────────────────────
Name: Jane Developer
Title: Senior Full Stack Developer
Sections enabled: 7
Experience items: 3
Projects: 3
Skills categories: 4
Total size: 43.24 KB
Files: 6
─────────────────────────────────
```

## 🌐 Deployment

### GitHub Pages

1. Create a repository named `yourusername.github.io`
2. Copy contents of `dist/` folder to your repository
3. Commit and push
4. Your site will be live at `https://yourusername.github.io`

### Netlify

1. Sign up at netlify.com
2. Drag and drop the `dist` folder
3. Your site is live!

### Custom Domain

Add a `CNAME` file to `dist/` with your domain name.

## 🎯 Features Demonstrated

### ✅ Core Functionality

- **Data-Driven**: All content comes from JSON configuration
- **Template Engine**: Handlebars compiles template + data
- **Conditional Rendering**: Sections only appear if enabled
- **Iteration**: Loops through arrays (experience, projects, etc.)
- **Date Formatting**: Custom Handlebars helper formats dates
- **Responsive Design**: Mobile-first CSS with breakpoints
- **SEO Ready**: Meta tags, semantic HTML, sitemap
- **Print Optimized**: Clean print styles for PDF export
- **Fast**: Pure HTML/CSS/JS, no framework overhead

### 🎨 Design Features

- Modern, professional appearance
- Icon support via Font Awesome
- Smooth animations and transitions
- Progress bars for skills
- Card-based layouts
- Hover effects
- Print-friendly layout

## 📝 Example Configuration

The included `config/resume-data.json` has a complete example with:

- 3 work experience entries
- 1 education entry
- 4 skill categories with 6+ skills each
- 3 featured projects
- 2 certifications
- 2 articles
- 2 testimonials

You can use this as a template and replace with your own information!

## 🐛 Troubleshooting

### Build Fails

**Problem**: `Error: Cannot find module 'handlebars'`

**Solution**: Run `npm install` to install dependencies

### Missing Images

**Problem**: Profile image not showing

**Solution**: Add your image at `src/images/profile.jpg` and rebuild

### JSON Syntax Error

**Problem**: Build fails with JSON parse error

**Solution**: Validate your JSON at jsonlint.com

## 🚀 Next Steps

To turn this POC into a production tool:

1. **CLI Tool**: Create `resume-builder` command
2. **Themes**: Add multiple color themes
3. **Wizard**: Interactive setup wizard
4. **LinkedIn Import**: Fetch data from LinkedIn API
5. **Resume Parser**: Import from PDF/DOCX files
6. **Deployment**: Automated GitHub Pages deployment
7. **Testing**: Unit tests for build process
8. **NPM Package**: Publish to npm registry

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Credits

- Based on [rob.loftin.github.io](https://github.com/iloveyouit/rob.loftin.github.io)
- Built as a proof of concept for the Resume Website Builder guide

## 📧 Support

For questions or issues with this proof of concept, please review the `repoapp.md` guide for complete implementation details.

---

**Built with ❤️ as a proof of concept | October 2025**
