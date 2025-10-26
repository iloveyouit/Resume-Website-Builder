#!/usr/bin/env node

/**
 * Resume Website Builder - Setup Wizard
 * Interactive wizard to help set up the configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

/**
 * Colorized console log
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Create readline interface
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(`${colors.cyan}${question}${colors.reset}`, (answer) => {
            resolve(answer.trim());
        });
    });
}

/**
 * Main wizard function
 */
async function runWizard() {
    log('\n════════════════════════════════════════', 'cyan');
    log('   Resume Website Builder - Setup', 'bright');
    log('════════════════════════════════════════\n', 'cyan');

    log('Welcome to the Resume Website Builder setup wizard!', 'green');
    log('This wizard will help you configure your resume website.\n', 'green');

    log('📋 Let\'s start with your basic information:\n', 'blue');

    // Collect user information
    const fullName = await prompt('What is your full name? ');
    const title = await prompt('What is your professional title? (e.g., "Senior Software Engineer") ');
    const email = await prompt('What is your email address? ');
    const phone = await prompt('What is your phone number? ');
    const location = await prompt('What is your location? (e.g., "San Francisco, CA") ');

    log('\n🔗 Social Media Links (press Enter to skip):\n', 'blue');

    const linkedin = await prompt('LinkedIn URL: ');
    const github = await prompt('GitHub URL: ');
    const twitter = await prompt('Twitter URL: ');
    const website = await prompt('Personal website URL: ');

    log('\n🎨 Customization:\n', 'blue');

    const primaryColor = await prompt('Primary color (hex code, default: #2563eb): ') || '#2563eb';
    const siteUrl = await prompt('Website URL (e.g., https://yourusername.github.io): ');

    log('\n📝 Summary:\n', 'blue');

    const professionalSummary = await prompt('Professional summary (1-2 sentences): ');

    // Create minimal config
    const config = {
        personal: {
            fullName: fullName || 'Your Name',
            title: title || 'Your Title',
            email: email || 'your.email@example.com',
            phone: phone || '(555) 123-4567',
            location: {
                primary: location || 'Your City, State',
                secondary: ''
            },
            profileImage: 'images/profile.svg',
            social: {
                linkedin: linkedin || '',
                github: github || '',
                twitter: twitter || '',
                website: website || ''
            }
        },
        summary: {
            professional: professionalSummary || 'Add your professional summary here.',
            about: ''
        },
        experience: [],
        education: [],
        skills: {
            categories: [],
            detailed: []
        },
        certifications: [],
        projects: [],
        articles: [],
        testimonials: [],
        settings: {
            theme: 'default',
            sectionsEnabled: {
                professionalSummary: true,
                about: false,
                skills: true,
                projects: true,
                articles: false,
                testimonials: false,
                certifications: false
            },
            colors: {
                primary: primaryColor,
                secondary: '#1e40af',
                accent: '#3b82f6'
            },
            seo: {
                title: `${fullName} - ${title}`,
                description: professionalSummary || 'Professional resume and portfolio',
                keywords: ['resume', 'portfolio', 'developer'],
                canonicalUrl: siteUrl || 'https://yourusername.github.io'
            }
        }
    };

    // Save configuration
    log('\n💾 Saving configuration...\n', 'blue');

    const configPath = path.join(__dirname, '../config/resume-data.json');
    const backupPath = path.join(__dirname, '../config/resume-data.backup.json');

    // Create backup if config exists
    if (fs.existsSync(configPath)) {
        fs.copyFileSync(configPath, backupPath);
        log(`  Backup created: ${backupPath}`, 'yellow');
    }

    // Write new config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    log(`  Configuration saved: ${configPath}`, 'green');

    log('\n════════════════════════════════════════', 'green');
    log('   ✓ Setup Complete!', 'bright');
    log('════════════════════════════════════════\n', 'green');

    log('Next steps:', 'cyan');
    log('  1. Edit config/resume-data.json to add your:', 'cyan');
    log('     • Work experience', 'cyan');
    log('     • Education', 'cyan');
    log('     • Skills', 'cyan');
    log('     • Projects', 'cyan');
    log('  2. Add your profile photo to src/images/', 'cyan');
    log('  3. Run "npm run build" to generate your website', 'cyan');
    log('  4. Open dist/index.html in your browser\n', 'cyan');

    log('For development with auto-rebuild:', 'magenta');
    log('  Run "npm run dev"\n', 'magenta');

    rl.close();
}

// Run wizard if executed directly
if (require.main === module) {
    runWizard().catch(error => {
        log('\n✗ Setup failed:', 'red');
        console.error(error);
        rl.close();
        process.exit(1);
    });
}

module.exports = { runWizard };
