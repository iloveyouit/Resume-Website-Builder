#!/usr/bin/env node

/**
 * Resume Website Builder - Build Script
 * This script compiles the Handlebars template with JSON data
 * and generates the final HTML website
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

/**
 * Colorized console log
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Main build function
 */
async function build() {
    try {
        log('\n════════════════════════════════════════', 'cyan');
        log('   Resume Website Builder - Build', 'bright');
        log('════════════════════════════════════════\n', 'cyan');

        // Step 1: Load configuration
        log('📄 Loading configuration...', 'blue');
        const configPath = path.join(__dirname, '../config/resume-data.json');

        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuration file not found: ${configPath}`);
        }

        let configData, config;
        try {
            configData = fs.readFileSync(configPath, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to read configuration file: ${error.message}`);
        }

        try {
            config = JSON.parse(configData);
        } catch (error) {
            log('✗ Invalid JSON in configuration file:', 'red');
            if (error instanceof SyntaxError) {
                log(`  ${error.message}`, 'yellow');
                log('\n  Common JSON errors:', 'cyan');
                log('  • Missing comma between items', 'cyan');
                log('  • Trailing comma at end of object/array', 'cyan');
                log('  • Missing quotes around keys or string values', 'cyan');
                log('  • Unclosed brackets or braces', 'cyan');
                log('\n  Tip: Validate your JSON at https://jsonlint.com\n', 'cyan');
            }
            throw error;
        }
        log('✓ Configuration loaded successfully', 'green');

        // Step 2: Load HTML template
        log('📝 Loading HTML template...', 'blue');
        const templatePath = path.join(__dirname, '../src/index.html');

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found: ${templatePath}`);
        }

        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        log('✓ Template loaded successfully', 'green');

        // Step 3: Register Handlebars helpers
        log('🔧 Registering Handlebars helpers...', 'blue');
        registerHelpers();
        log('✓ Helpers registered', 'green');

        // Step 4: Validate profile image exists
        log('🖼️  Validating profile image...', 'blue');
        validateProfileImage(config);
        log('✓ Profile image validated', 'green');

        // Step 5: Add current year to config
        config.currentYear = new Date().getFullYear();

        // Step 5a: Generate custom color styles from config
        log('🎨 Generating custom color styles...', 'blue');
        config.customColorStyles = generateColorStyles(config);
        log('✓ Custom color styles generated', 'green');

        // Step 6: Compile template
        log('⚙️  Compiling template...', 'blue');
        const template = Handlebars.compile(templateSource);
        const html = template(config);
        log('✓ Template compiled successfully', 'green');

        // Step 7: Create dist directory
        log('📁 Creating dist directory...', 'blue');
        const distPath = path.join(__dirname, '../dist');

        if (!fs.existsSync(distPath)) {
            fs.mkdirSync(distPath, { recursive: true });
        }
        log('✓ Dist directory ready', 'green');

        // Step 8: Write HTML output
        log('💾 Writing HTML file...', 'blue');
        const outputPath = path.join(distPath, 'index.html');
        fs.writeFileSync(outputPath, html, 'utf-8');
        log('✓ HTML file written', 'green');

        // Step 9: Copy CSS files
        log('🎨 Copying CSS files...', 'blue');
        copyDirectory(
            path.join(__dirname, '../src/css'),
            path.join(distPath, 'css')
        );
        log('✓ CSS files copied', 'green');

        // Step 10: Copy JavaScript files
        log('⚡ Copying JavaScript files...', 'blue');
        copyDirectory(
            path.join(__dirname, '../src/js'),
            path.join(distPath, 'js')
        );
        log('✓ JavaScript files copied', 'green');

        // Step 11: Copy images
        log('🖼️  Copying images...', 'blue');
        copyDirectory(
            path.join(__dirname, '../src/images'),
            path.join(distPath, 'images')
        );
        log('✓ Images copied', 'green');

        // Step 12: Generate sitemap
        log('🗺️  Generating sitemap...', 'blue');
        generateSitemap(config);
        log('✓ Sitemap generated', 'green');

        // Step 13: Generate robots.txt
        log('🤖 Generating robots.txt...', 'blue');
        generateRobotsTxt(config);
        log('✓ Robots.txt generated', 'green');

        // Step 14: Generate CNAME for custom domain
        log('🌐 Checking for custom domain...', 'blue');
        generateCNAME(config);
        log('✓ CNAME configuration complete', 'green');

        // Success message
        log('\n════════════════════════════════════════', 'cyan');
        log('   ✓ Build Complete!', 'green');
        log('════════════════════════════════════════\n', 'cyan');

        log('Output directory: ' + path.relative(process.cwd(), distPath), 'cyan');
        log('Next step: Deploy the dist folder to GitHub Pages\n', 'yellow');

        // Display build summary
        displayBuildSummary(config, distPath);

    } catch (error) {
        log('\n════════════════════════════════════════', 'red');
        log('   ✗ Build Failed', 'red');
        log('════════════════════════════════════════\n', 'red');

        if (error.code === 'ENOENT') {
            log('File not found:', 'red');
            log(`  ${error.path}\n`, 'yellow');
        } else if (error instanceof SyntaxError) {
            // JSON syntax error - already handled above
            log(`\n${error.message}\n`, 'red');
        } else if (error.message) {
            log(`Error: ${error.message}\n`, 'red');
        } else {
            log('Unexpected error occurred:\n', 'red');
            console.error(error);
        }

        log('Build failed. Please fix the errors and try again.\n', 'yellow');
        process.exit(1);
    }
}

/**
 * Register Handlebars helpers
 */
function registerHelpers() {
    // Format date helper with support for multiple formats
    Handlebars.registerHelper('formatDate', function(date) {
        if (!date || date === 'Present') return 'Present';

        try {
            // Handle "YYYY" format (just a year)
            if (/^\d{4}$/.test(date)) {
                return date;
            }

            // Handle "YYYY-MM" format
            if (/^\d{4}-\d{2}$/.test(date)) {
                const [year, month] = date.split('-');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIndex = parseInt(month, 10) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    return `${months[monthIndex]} ${year}`;
                }
            }

            // Handle full ISO date format (YYYY-MM-DD)
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                const d = new Date(date + 'T00:00:00');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[d.getMonth()]} ${d.getFullYear()}`;
            }

            // Try to parse as a Date object for other formats
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[d.getMonth()]} ${d.getFullYear()}`;
            }

            // If all else fails, return the original date string
            return date;
        } catch (e) {
            return date;
        }
    });

    // Conditional helper
    Handlebars.registerHelper('if', function(conditional, options) {
        if (conditional) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    // Each helper
    Handlebars.registerHelper('each', function(context, options) {
        let ret = '';
        if (context && context.length > 0) {
            for (let i = 0; i < context.length; i++) {
                ret += options.fn(context[i], {
                    data: {
                        index: i,
                        first: i === 0,
                        last: i === context.length - 1
                    }
                });
            }
        }
        return ret;
    });

    // Unless helper
    Handlebars.registerHelper('unless', function(conditional, options) {
        return Handlebars.helpers['if'].call(this, !conditional, options);
    });
}

/**
 * Generate custom color styles from config
 */
function generateColorStyles(config) {
    if (!config.settings || !config.settings.colors) {
        return '';
    }

    const colors = config.settings.colors;
    return `
    <style>
        :root {
            --primary-color: ${colors.primary || '#2563eb'};
            --secondary-color: ${colors.secondary || '#1e40af'};
            --accent-color: ${colors.accent || '#3b82f6'};
        }
    </style>`;
}

/**
 * Validate profile image exists
 */
function validateProfileImage(config) {
    if (!config.personal || !config.personal.profileImage) {
        log('  Warning: No profile image specified in config', 'yellow');
        return;
    }

    const imagePath = config.personal.profileImage.replace('images/', '');
    const fullImagePath = path.join(__dirname, '../src/images', imagePath);

    if (!fs.existsSync(fullImagePath)) {
        log(`  Warning: Profile image not found: ${fullImagePath}`, 'yellow');
        log('  The website will build, but the image will be broken.', 'yellow');
        log('  Add your image to: src/images/${imagePath}', 'cyan');
    }
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
    // Create destination directory
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Check if source exists
    if (!fs.existsSync(src)) {
        log(`Warning: Source directory not found: ${src}`, 'yellow');
        return;
    }

    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Generate sitemap.xml
 */
function generateSitemap(config) {
    const canonicalUrl = config.settings.seo.canonicalUrl || 'https://yourusername.github.io';
    const now = new Date().toISOString();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    const distPath = path.join(__dirname, '../dist');
    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap, 'utf-8');
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt(config) {
    const canonicalUrl = config.settings.seo.canonicalUrl || 'https://yourusername.github.io';

    const robots = `User-agent: *
Allow: /

Sitemap: ${canonicalUrl}/sitemap.xml`;

    const distPath = path.join(__dirname, '../dist');
    fs.writeFileSync(path.join(distPath, 'robots.txt'), robots, 'utf-8');
}

/**
 * Generate CNAME file for custom domain
 */
function generateCNAME(config) {
    const distPath = path.join(__dirname, '../dist');
    const cnamePath = path.join(distPath, 'CNAME');

    // Check if custom domain is configured
    if (config.settings && config.settings.customDomain) {
        const domain = config.settings.customDomain.trim();

        if (domain) {
            fs.writeFileSync(cnamePath, domain, 'utf-8');
            log(`  Custom domain configured: ${domain}`, 'cyan');
            return;
        }
    }

    // Remove CNAME if it exists but no custom domain is set
    if (fs.existsSync(cnamePath)) {
        fs.unlinkSync(cnamePath);
        log('  No custom domain configured', 'yellow');
    }
}

/**
 * Display build summary
 */
function displayBuildSummary(config, distPath) {
    log('Build Summary:', 'bright');
    log('─────────────────────────────────', 'cyan');
    log(`Name: ${config.personal.fullName}`);
    log(`Title: ${config.personal.title}`);
    log(`Sections enabled: ${Object.values(config.settings.sectionsEnabled).filter(v => v).length}`);
    log(`Experience items: ${config.experience ? config.experience.length : 0}`);
    log(`Projects: ${config.projects ? config.projects.length : 0}`);
    log(`Skills categories: ${config.skills && config.skills.categories ? config.skills.categories.length : 0}`);

    // Calculate total file size
    const stats = getDirectorySize(distPath);
    log(`Total size: ${formatBytes(stats.size)}`);
    log(`Files: ${stats.files}`);
    log('─────────────────────────────────\n', 'cyan');
}

/**
 * Get directory size and file count
 */
function getDirectorySize(dirPath) {
    let size = 0;
    let files = 0;

    if (!fs.existsSync(dirPath)) {
        return { size: 0, files: 0 };
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            const dirStats = getDirectorySize(fullPath);
            size += dirStats.size;
            files += dirStats.files;
        } else {
            const stat = fs.statSync(fullPath);
            size += stat.size;
            files++;
        }
    }

    return { size, files };
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run build if executed directly
if (require.main === module) {
    build();
}

module.exports = { build };
