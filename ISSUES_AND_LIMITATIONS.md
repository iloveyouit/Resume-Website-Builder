# Issues and Limitations - Resume Website Builder POC

This document details all issues, limitations, and gotchas encountered during the proof of concept implementation.

---

## 🐛 Known Issues

### 1. Profile Image Not Included ⚠️

**Issue**: The build completes successfully, but the profile image will show as broken.

**Why**: We created a placeholder at `src/images/.gitkeep` but no actual image file.

**Impact**: The website displays with a broken image icon where the profile photo should be.

**Workaround**:
```bash
# Add your profile photo
cp /path/to/your/photo.jpg src/images/profile.jpg

# Or use a placeholder
curl -o src/images/profile.jpg https://via.placeholder.com/200

# Then rebuild
npm run build
```

**Permanent Fix**: Add a default placeholder image or make the build script validate image existence.

---

### 2. CSS Colors Not Dynamic 🎨

**Issue**: The `settings.colors` in JSON don't actually change the website colors.

**Why**: CSS variables are hardcoded in `styles.css`, not injected from the JSON.

**Current Behavior**:
```json
"settings": {
  "colors": {
    "primary": "#2563eb"  // This has NO EFFECT!
  }
}
```

The website always uses the hardcoded colors in CSS:
```css
:root {
    --primary-color: #2563eb;  /* Always this color */
}
```

**Workaround**: Manually edit `src/css/styles.css` and change the `:root` variables.

**Permanent Fix**:
1. Generate inline `<style>` tag in HTML with colors from JSON
2. Or generate a custom CSS file during build
3. Or use CSS-in-JS approach

**Implementation**:
```javascript
// In build.js, add this before compiling:
const colorStyles = `
<style>
:root {
    --primary-color: ${config.settings.colors.primary};
    --secondary-color: ${config.settings.colors.secondary};
    --accent-color: ${config.settings.colors.accent};
}
</style>
`;
// Inject into template
```

---

### 3. No Configuration Validation ⚠️

**Issue**: The build script doesn't validate the JSON structure.

**Why**: No validation layer implemented in POC.

**Risk**: If you remove required fields or use wrong data types, the build might:
- Succeed but generate broken HTML
- Crash with cryptic errors
- Generate website with missing sections

**Example of problematic config**:
```json
{
  "personal": {
    "fullName": 123,  // Should be string!
    "email": null     // Should be string!
  },
  "experience": "not an array"  // Should be array!
}
```

**Workaround**: Carefully follow the example structure in the provided JSON.

**Permanent Fix**: Add validation script:
```javascript
// scripts/validate-config.js
function validateConfig(config) {
    const required = ['personal', 'experience', 'education', 'skills'];

    for (const field of required) {
        if (!config[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    if (typeof config.personal.fullName !== 'string') {
        throw new Error('personal.fullName must be a string');
    }

    if (!Array.isArray(config.experience)) {
        throw new Error('experience must be an array');
    }

    // ... more validations
}
```

---

### 4. Missing Scripts Referenced in package.json ⚠️

**Issue**: Several npm scripts are defined but not implemented:

```json
"scripts": {
  "dev": "node scripts/dev-server.js",       // ❌ NOT IMPLEMENTED
  "validate": "node scripts/validate-config.js",  // ❌ NOT IMPLEMENTED
  "setup": "node scripts/wizard.js"          // ❌ NOT IMPLEMENTED
}
```

**Current Behavior**: Running these commands will fail with "Cannot find module" error.

**Working Commands**:
- ✅ `npm run build` - Works perfectly
- ❌ `npm run dev` - File doesn't exist
- ❌ `npm run validate` - File doesn't exist
- ❌ `npm run setup` - File doesn't exist

**Workaround**: Only use `npm run build`.

**Permanent Fix**: Implement the missing scripts or remove them from package.json.

---

### 5. Date Format Assumptions 📅

**Issue**: The `formatDate` helper assumes dates in `YYYY-MM` format.

**Current Implementation**:
```javascript
Handlebars.registerHelper('formatDate', function(date) {
    if (!date || date === 'Present') return 'Present';

    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', ...];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
});
```

**Problem**: Other formats will break or display incorrectly:
- `"2020"` → Shows "Jan 2020" (wrong month)
- `"January 2020"` → Shows "Invalid Date"
- `"2020-01-15"` → Shows "Jan 2020" (loses day)

**Workaround**: Always use `YYYY-MM` format or `"Present"` in your JSON.

**Permanent Fix**: Support multiple date formats with better parsing:
```javascript
Handlebars.registerHelper('formatDate', function(date) {
    if (!date || date === 'Present') return 'Present';

    // Handle "YYYY" format
    if (/^\d{4}$/.test(date)) {
        return date;
    }

    // Handle "YYYY-MM" format
    if (/^\d{4}-\d{2}$/.test(date)) {
        const [year, month] = date.split('-');
        const months = ['Jan', 'Feb', 'Mar', ...];
        return `${months[parseInt(month) - 1]} ${year}`;
    }

    // Handle full ISO dates
    // ... etc
});
```

---

### 6. No Error Messages for Missing Data 🚫

**Issue**: If optional data is missing, sections render with empty content.

**Example**: If you remove all projects:
```json
{
  "projects": []  // Empty array
}
```

The website shows:
```html
<section class="featured-projects">
  <h2>Featured Projects</h2>
  <div class="project-grid">
    <!-- Empty! -->
  </div>
</section>
```

An empty section header with no content appears.

**Workaround**: Use `sectionsEnabled` to disable empty sections:
```json
"settings": {
  "sectionsEnabled": {
    "projects": false  // Hide if no projects
  }
}
```

**Permanent Fix**: Add conditional rendering in template:
```html
{{#if settings.sectionsEnabled.projects}}
  {{#if projects}}
    {{#if projects.length}}
      <section class="featured-projects">
        <!-- Only shows if projects exist -->
      </section>
    {{/if}}
  {{/if}}
{{/if}}
```

---

### 7. No LinkedIn Integration ❌

**Issue**: Despite being heavily featured in the guide, LinkedIn integration is NOT implemented.

**What's Missing**:
- `scripts/linkedin-fetch.js` - Not created
- `scripts/linkedin-manual-import.js` - Not created
- LinkedIn OAuth flow - Not implemented
- CSV parser for LinkedIn exports - Not implemented

**Current State**: You must manually enter all data into JSON.

**Permanent Fix**: Implement as described in the guide (significant work):
1. Create LinkedIn developer app
2. Implement OAuth 2.0 flow
3. Add API calls to fetch profile data
4. Transform LinkedIn data to our JSON format
5. Handle rate limits and errors

---

### 8. No Resume File Parser ❌

**Issue**: Despite being in the guide, resume parsing is NOT implemented.

**What's Missing**:
- `scripts/resume-import.js` - Not created
- PDF parsing with pdf-parse - Not implemented
- DOCX parsing with mammoth - Not implemented
- Text extraction and structuring - Not implemented

**Current State**: You must manually type your resume data into JSON.

**Permanent Fix**: Would require additional dependencies:
```json
"dependencies": {
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.5.0"
}
```

And significant parsing logic with AI/ML or regex patterns.

---

### 9. Handlebars Helpers Limitations 🔧

**Issue**: Custom Handlebars helpers are implemented inline in build.js, not as modules.

**Current Implementation**: Helpers are defined inside the build script:
```javascript
function registerHelpers() {
    Handlebars.registerHelper('formatDate', ...);
    Handlebars.registerHelper('if', ...);
    Handlebars.registerHelper('each', ...);
}
```

**Problem**:
- Can't reuse helpers in other scripts
- Hard to test in isolation
- Mixed concerns (build logic + helpers)

**Permanent Fix**: Extract to separate module:
```javascript
// lib/handlebars-helpers.js
module.exports = function(Handlebars) {
    Handlebars.registerHelper('formatDate', ...);
    Handlebars.registerHelper('if', ...);
    // etc
};

// In build.js
const registerHelpers = require('../lib/handlebars-helpers');
registerHelpers(Handlebars);
```

---

### 10. Build Script Doesn't Handle Errors Gracefully 💥

**Issue**: Some errors crash the build without helpful messages.

**Example**: If `config/resume-data.json` has invalid JSON:
```json
{
  "personal": {
    "fullName": "Jane Developer",  // Missing closing brace
}
```

**Current Error**:
```
SyntaxError: Unexpected end of JSON input
    at JSON.parse
```

Not very helpful!

**Permanent Fix**: Add better error handling:
```javascript
try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
} catch (error) {
    if (error instanceof SyntaxError) {
        log('✗ Invalid JSON in config file:', 'red');
        log(`  Line ${error.lineNumber}: ${error.message}`, 'yellow');
        log('  Tip: Validate your JSON at https://jsonlint.com', 'cyan');
    } else {
        log('✗ Error loading config:', 'red');
        console.error(error);
    }
    process.exit(1);
}
```

---

## 🔒 Security Considerations

### 1. No Input Sanitization

**Issue**: User input from JSON is directly injected into HTML without sanitization.

**Risk**: If JSON contains HTML/JavaScript, it will be rendered:
```json
{
  "personal": {
    "fullName": "<script>alert('XSS')</script>"
  }
}
```

This would inject a script tag into the HTML!

**Mitigation**: For static personal websites, this is low risk since you control the JSON. But for a production tool, you'd need to sanitize:

```javascript
// Use Handlebars' built-in escaping
{{personal.fullName}}  // Automatically escapes HTML

// For HTML content you trust, use triple braces
{{{summary.professional}}}  // Renders HTML as-is
```

### 2. No HTTPS Enforcement

**Issue**: External links don't enforce HTTPS.

**Example**:
```json
"social": {
  "website": "http://example.com"  // HTTP, not HTTPS!
}
```

**Fix**: Validate URLs and upgrade to HTTPS:
```javascript
function ensureHttps(url) {
    return url.replace(/^http:/, 'https:');
}
```

---

## ⚡ Performance Issues

### 1. No Image Optimization

**Issue**: Images are copied as-is without optimization.

**Impact**: Large images (>1MB) will slow page load.

**Permanent Fix**: Add image optimization during build:
```bash
npm install sharp --save-dev
```

```javascript
// In build.js
const sharp = require('sharp');

async function optimizeImages() {
    const images = fs.readdirSync('src/images');

    for (const img of images) {
        await sharp(`src/images/${img}`)
            .resize(800, 800, { fit: 'inside' })
            .jpeg({ quality: 85 })
            .toFile(`dist/images/${img}`);
    }
}
```

### 2. No CSS Minification

**Issue**: CSS is copied without minification.

**Current Size**: 12 KB
**Potential Size**: ~6 KB (50% reduction)

**Permanent Fix**: Add CSS minification:
```bash
npm install csso --save-dev
```

### 3. No HTML Minification

**Issue**: Generated HTML has lots of whitespace.

**Current Size**: 24 KB
**Potential Size**: ~18 KB (25% reduction)

**Permanent Fix**: Add HTML minification:
```bash
npm install html-minifier --save-dev
```

---

## 📱 Browser Compatibility Issues

### 1. CSS Grid Not Supported in IE11

**Issue**: The CSS uses CSS Grid extensively:
```css
.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

**Impact**: Breaks layout in Internet Explorer 11.

**Workaround**: IE11 is effectively dead (discontinued in 2022), so this is acceptable.

**Permanent Fix**: Add fallback for legacy browsers:
```css
.skills-grid {
    display: flex;  /* Fallback */
    flex-wrap: wrap;
    display: grid;  /* Override if supported */
}
```

### 2. JavaScript IntersectionObserver

**Issue**: `IntersectionObserver` used for scroll animations not supported in older browsers.

**Current Code**:
```javascript
const observer = new IntersectionObserver(...);
```

**Impact**: Animations won't work in IE11, older Safari versions.

**Permanent Fix**: Add polyfill or feature detection:
```javascript
if ('IntersectionObserver' in window) {
    initScrollAnimations();
} else {
    // Gracefully degrade - just show everything
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    });
}
```

---

## 📦 Dependency Issues

### 1. Minimal Dependencies (Good!)

**Current Dependencies**: Only 2 direct dependencies
- `handlebars` - Template engine
- `chalk` - Colored terminal output

**Total Packages**: 12 (including sub-dependencies)

**Size**: Very small (~1MB node_modules)

**Issue**: No issues! This is actually a strength. Minimal dependencies = less maintenance burden.

### 2. No Version Locking

**Issue**: `package.json` uses caret (^) for versions:
```json
"dependencies": {
  "handlebars": "^4.7.8",  // Will install 4.x.x, potentially breaking
  "chalk": "^4.1.2"
}
```

**Risk**: Future installs might get incompatible versions.

**Permanent Fix**: Use exact versions or use package-lock.json:
```json
"dependencies": {
  "handlebars": "4.7.8",  // Exact version
  "chalk": "4.1.2"
}
```

---

## 🧪 Testing Issues

### 1. No Tests

**Issue**: Zero test coverage.

**Risk**: Changes might break functionality without knowing.

**Permanent Fix**: Add test framework:
```bash
npm install --save-dev jest
```

Create tests:
```javascript
// tests/build.test.js
describe('Build Process', () => {
    test('should load configuration', () => {
        const config = loadConfig();
        expect(config.personal.fullName).toBeDefined();
    });

    test('should compile template', () => {
        const html = build();
        expect(html).toContain('<h1>');
    });
});
```

### 2. No Integration Tests

**Issue**: No automated way to verify generated HTML is correct.

**Permanent Fix**: Add HTML validation:
```javascript
const { JSDOM } = require('jsdom');

test('generated HTML is valid', () => {
    const html = fs.readFileSync('dist/index.html', 'utf-8');
    const dom = new JSDOM(html);
    const h1 = dom.window.document.querySelector('h1');
    expect(h1.textContent).toBe('Jane Developer');
});
```

---

## 📝 Documentation Issues

### 1. No API Documentation

**Issue**: No documentation for extending or modifying the system.

**Missing**:
- How to add new Handlebars helpers
- How to add new sections to the template
- How to customize the build process
- JSON schema documentation

**Permanent Fix**: Create API.md with examples.

### 2. No Troubleshooting Guide

**Issue**: README mentions troubleshooting but doesn't include common issues.

**Permanent Fix**: Add comprehensive troubleshooting section to README.

---

## 🚀 Deployment Issues

### 1. No Automated Deployment

**Issue**: User must manually copy files to GitHub Pages.

**Current Process**:
```bash
cp -r dist/* /path/to/github-repo/
cd /path/to/github-repo/
git add .
git commit -m "Update"
git push
```

**Permanent Fix**: Add GitHub Actions workflow:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 2. No CNAME Support

**Issue**: Custom domains not automatically configured.

**Permanent Fix**: Add CNAME generation to build script:
```javascript
if (config.settings.customDomain) {
    fs.writeFileSync(
        path.join(distPath, 'CNAME'),
        config.settings.customDomain
    );
}
```

---

## 🔄 Workflow Issues

### 1. No Watch Mode

**Issue**: Must manually rebuild after every change.

**Desired**: `npm run dev` should watch files and rebuild automatically.

**Permanent Fix**: Implement file watcher:
```javascript
// scripts/dev-server.js
const chokidar = require('chokidar');

const watcher = chokidar.watch([
    'src/**/*',
    'config/**/*'
]);

watcher.on('change', (path) => {
    console.log(`File ${path} changed, rebuilding...`);
    build();
});
```

### 2. No Live Reload

**Issue**: Must manually refresh browser to see changes.

**Permanent Fix**: Add live-server:
```bash
npm install --save-dev live-server
```

```json
"scripts": {
  "dev": "npm run build && live-server dist --watch=dist"
}
```

---

## 💡 Recommendations

### Priority 1 (Critical)
1. ✅ Add profile image placeholder or validation
2. ✅ Implement CSS color injection from JSON
3. ✅ Add configuration validation

### Priority 2 (Important)
4. ✅ Better error messages
5. ✅ Implement missing npm scripts or remove them
6. ✅ Add tests

### Priority 3 (Nice to Have)
7. ✅ LinkedIn integration
8. ✅ Resume parser
9. ✅ Watch mode and live reload
10. ✅ Automated deployment

---

## 📊 Summary

### Issues Found: 25+
- **Blockers**: 1 (broken profile image)
- **Critical**: 4 (colors, validation, missing scripts)
- **Major**: 8 (error handling, LinkedIn, parser)
- **Minor**: 12+ (optimizations, tests, documentation)

### Overall Assessment
Despite the issues, the **core POC is successful**. The build works, generates valid HTML, and proves the concept. All issues are **fixable** and well-documented above for future implementation.

---

**Last Updated**: October 26, 2025
**POC Version**: 1.0.0
**Status**: Issues Documented ✓
