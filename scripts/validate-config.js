#!/usr/bin/env node

/**
 * Resume Website Builder - Configuration Validation Script
 * Validates the structure and data types in resume-data.json
 */

const fs = require('fs');
const path = require('path');

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
 * Validation errors and warnings
 */
const errors = [];
const warnings = [];

/**
 * Add error
 */
function addError(message) {
    errors.push(message);
}

/**
 * Add warning
 */
function addWarning(message) {
    warnings.push(message);
}

/**
 * Validate configuration structure and data types
 */
function validateConfig(config) {
    log('\n════════════════════════════════════════', 'cyan');
    log('   Configuration Validation', 'bright');
    log('════════════════════════════════════════\n', 'cyan');

    // Validate personal section
    validatePersonal(config.personal);

    // Validate summary section
    validateSummary(config.summary);

    // Validate experience section
    validateExperience(config.experience);

    // Validate education section
    validateEducation(config.education);

    // Validate skills section
    validateSkills(config.skills);

    // Validate projects section (optional)
    if (config.projects) {
        validateProjects(config.projects);
    }

    // Validate settings section
    validateSettings(config.settings);

    // Display results
    displayResults();
}

/**
 * Validate personal section
 */
function validatePersonal(personal) {
    log('📋 Validating personal section...', 'blue');

    if (!personal) {
        addError('Missing required section: personal');
        return;
    }

    // Required fields
    if (!personal.fullName || typeof personal.fullName !== 'string') {
        addError('personal.fullName is required and must be a string');
    }

    if (!personal.title || typeof personal.title !== 'string') {
        addError('personal.title is required and must be a string');
    }

    if (!personal.email || typeof personal.email !== 'string') {
        addError('personal.email is required and must be a string');
    } else if (!isValidEmail(personal.email)) {
        addWarning('personal.email does not appear to be a valid email address');
    }

    if (!personal.phone || typeof personal.phone !== 'string') {
        addWarning('personal.phone is missing or not a string');
    }

    // Validate location
    if (!personal.location || typeof personal.location !== 'object') {
        addError('personal.location is required and must be an object');
    } else {
        if (!personal.location.primary || typeof personal.location.primary !== 'string') {
            addError('personal.location.primary is required and must be a string');
        }
    }

    // Validate social links
    if (personal.social && typeof personal.social !== 'object') {
        addError('personal.social must be an object');
    } else if (personal.social) {
        const socialFields = ['linkedin', 'github', 'twitter', 'website'];
        socialFields.forEach(field => {
            if (personal.social[field] && !isValidUrl(personal.social[field])) {
                addWarning(`personal.social.${field} does not appear to be a valid URL`);
            }
        });
    }

    log('✓ Personal section validated', 'green');
}

/**
 * Validate summary section
 */
function validateSummary(summary) {
    log('📋 Validating summary section...', 'blue');

    if (!summary) {
        addWarning('Missing optional section: summary');
        return;
    }

    if (summary.professional && typeof summary.professional !== 'string') {
        addError('summary.professional must be a string');
    }

    if (summary.about && typeof summary.about !== 'string') {
        addError('summary.about must be a string');
    }

    log('✓ Summary section validated', 'green');
}

/**
 * Validate experience section
 */
function validateExperience(experience) {
    log('📋 Validating experience section...', 'blue');

    if (!experience) {
        addError('Missing required section: experience');
        return;
    }

    if (!Array.isArray(experience)) {
        addError('experience must be an array');
        return;
    }

    if (experience.length === 0) {
        addWarning('experience array is empty');
    }

    experience.forEach((job, index) => {
        if (!job.title || typeof job.title !== 'string') {
            addError(`experience[${index}].title is required and must be a string`);
        }

        if (!job.company || typeof job.company !== 'string') {
            addError(`experience[${index}].company is required and must be a string`);
        }

        if (!job.startDate || typeof job.startDate !== 'string') {
            addError(`experience[${index}].startDate is required and must be a string`);
        }

        if (job.achievements && !Array.isArray(job.achievements)) {
            addError(`experience[${index}].achievements must be an array`);
        }
    });

    log('✓ Experience section validated', 'green');
}

/**
 * Validate education section
 */
function validateEducation(education) {
    log('📋 Validating education section...', 'blue');

    if (!education) {
        addError('Missing required section: education');
        return;
    }

    if (!Array.isArray(education)) {
        addError('education must be an array');
        return;
    }

    if (education.length === 0) {
        addWarning('education array is empty');
    }

    education.forEach((edu, index) => {
        if (!edu.degree || typeof edu.degree !== 'string') {
            addError(`education[${index}].degree is required and must be a string`);
        }

        if (!edu.institution || typeof edu.institution !== 'string') {
            addError(`education[${index}].institution is required and must be a string`);
        }
    });

    log('✓ Education section validated', 'green');
}

/**
 * Validate skills section
 */
function validateSkills(skills) {
    log('📋 Validating skills section...', 'blue');

    if (!skills) {
        addError('Missing required section: skills');
        return;
    }

    if (skills.categories && !Array.isArray(skills.categories)) {
        addError('skills.categories must be an array');
    } else if (skills.categories) {
        skills.categories.forEach((category, index) => {
            if (!category.name || typeof category.name !== 'string') {
                addError(`skills.categories[${index}].name is required and must be a string`);
            }

            if (!category.items || !Array.isArray(category.items)) {
                addError(`skills.categories[${index}].items is required and must be an array`);
            }
        });
    }

    log('✓ Skills section validated', 'green');
}

/**
 * Validate projects section
 */
function validateProjects(projects) {
    log('📋 Validating projects section...', 'blue');

    if (!Array.isArray(projects)) {
        addError('projects must be an array');
        return;
    }

    projects.forEach((project, index) => {
        if (!project.title || typeof project.title !== 'string') {
            addError(`projects[${index}].title is required and must be a string`);
        }

        if (!project.description || typeof project.description !== 'string') {
            addError(`projects[${index}].description is required and must be a string`);
        }

        if (project.technologies && !Array.isArray(project.technologies)) {
            addError(`projects[${index}].technologies must be an array`);
        }

        if (project.url && !isValidUrl(project.url)) {
            addWarning(`projects[${index}].url does not appear to be a valid URL`);
        }
    });

    log('✓ Projects section validated', 'green');
}

/**
 * Validate settings section
 */
function validateSettings(settings) {
    log('📋 Validating settings section...', 'blue');

    if (!settings) {
        addError('Missing required section: settings');
        return;
    }

    // Validate colors
    if (settings.colors) {
        if (typeof settings.colors !== 'object') {
            addError('settings.colors must be an object');
        } else {
            const colorFields = ['primary', 'secondary', 'accent'];
            colorFields.forEach(field => {
                if (settings.colors[field] && !isValidColor(settings.colors[field])) {
                    addWarning(`settings.colors.${field} does not appear to be a valid color code`);
                }
            });
        }
    }

    // Validate SEO
    if (!settings.seo || typeof settings.seo !== 'object') {
        addError('settings.seo is required and must be an object');
    } else {
        if (!settings.seo.title || typeof settings.seo.title !== 'string') {
            addError('settings.seo.title is required and must be a string');
        }

        if (!settings.seo.description || typeof settings.seo.description !== 'string') {
            addError('settings.seo.description is required and must be a string');
        }

        if (settings.seo.canonicalUrl && !isValidUrl(settings.seo.canonicalUrl)) {
            addWarning('settings.seo.canonicalUrl does not appear to be a valid URL');
        }
    }

    log('✓ Settings section validated', 'green');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Validate color code (hex format)
 */
function isValidColor(color) {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return colorRegex.test(color);
}

/**
 * Display validation results
 */
function displayResults() {
    log('\n════════════════════════════════════════', 'cyan');
    log('   Validation Results', 'bright');
    log('════════════════════════════════════════\n', 'cyan');

    if (errors.length === 0 && warnings.length === 0) {
        log('✓ Configuration is valid!', 'green');
        log('  No errors or warnings found.\n', 'green');
        process.exit(0);
    }

    if (errors.length > 0) {
        log(`✗ Found ${errors.length} error(s):\n`, 'red');
        errors.forEach((error, index) => {
            log(`  ${index + 1}. ${error}`, 'red');
        });
        log('');
    }

    if (warnings.length > 0) {
        log(`⚠ Found ${warnings.length} warning(s):\n`, 'yellow');
        warnings.forEach((warning, index) => {
            log(`  ${index + 1}. ${warning}`, 'yellow');
        });
        log('');
    }

    log('════════════════════════════════════════\n', 'cyan');

    if (errors.length > 0) {
        log('Please fix the errors before building.\n', 'red');
        log('Tip: Validate your JSON at https://jsonlint.com', 'cyan');
        process.exit(1);
    } else {
        log('Configuration has warnings but is valid enough to build.\n', 'yellow');
        process.exit(0);
    }
}

/**
 * Main function
 */
function main() {
    try {
        const configPath = path.join(__dirname, '../config/resume-data.json');

        if (!fs.existsSync(configPath)) {
            log('\n✗ Configuration file not found:', 'red');
            log(`  ${configPath}\n`, 'red');
            process.exit(1);
        }

        const configData = fs.readFileSync(configPath, 'utf-8');
        let config;

        try {
            config = JSON.parse(configData);
        } catch (error) {
            log('\n✗ Invalid JSON in configuration file:', 'red');
            log(`  ${error.message}\n`, 'red');
            log('Tip: Validate your JSON at https://jsonlint.com', 'cyan');
            process.exit(1);
        }

        validateConfig(config);

    } catch (error) {
        log('\n✗ Unexpected error:', 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run validation if executed directly
if (require.main === module) {
    main();
}

module.exports = { validateConfig };
