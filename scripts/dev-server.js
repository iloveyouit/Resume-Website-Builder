#!/usr/bin/env node

/**
 * Resume Website Builder - Development Server
 * Watches for file changes and rebuilds automatically
 */

const fs = require('fs');
const path = require('path');
const { build } = require('./build.js');

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
 * Directories and files to watch
 */
const watchPaths = [
    path.join(__dirname, '../src'),
    path.join(__dirname, '../config'),
    path.join(__dirname, '../templates')
];

/**
 * Debounce timer for rebuilds
 */
let rebuildTimer = null;
const DEBOUNCE_DELAY = 500; // milliseconds

/**
 * Track if build is in progress
 */
let buildInProgress = false;

/**
 * Trigger a rebuild with debouncing
 */
function triggerRebuild(filename) {
    // Clear existing timer
    if (rebuildTimer) {
        clearTimeout(rebuildTimer);
    }

    // Set new timer
    rebuildTimer = setTimeout(() => {
        if (!buildInProgress) {
            rebuild(filename);
        }
    }, DEBOUNCE_DELAY);
}

/**
 * Perform the rebuild
 */
async function rebuild(filename) {
    buildInProgress = true;

    const timestamp = new Date().toLocaleTimeString();
    log(`\n[${timestamp}] File changed: ${filename}`, 'cyan');
    log('🔄 Rebuilding...', 'yellow');

    try {
        await build();
        log(`✓ Rebuild complete at ${new Date().toLocaleTimeString()}`, 'green');
        log('👀 Watching for changes... (Press Ctrl+C to stop)\n', 'blue');
    } catch (error) {
        log('✗ Rebuild failed', 'red');
        log('👀 Watching for changes... (Press Ctrl+C to stop)\n', 'blue');
    }

    buildInProgress = false;
}

/**
 * Watch a directory recursively
 */
function watchDirectory(dirPath, callback) {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    // Watch the directory itself
    fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
            const fullPath = path.join(dirPath, filename);

            // Ignore certain files and directories
            if (shouldIgnore(filename)) {
                return;
            }

            callback(filename);
        }
    });
}

/**
 * Check if file should be ignored
 */
function shouldIgnore(filename) {
    const ignorePatterns = [
        /node_modules/,
        /\.git/,
        /dist/,
        /\.DS_Store/,
        /\.swp$/,
        /~$/,
        /^\.#/
    ];

    return ignorePatterns.some(pattern => pattern.test(filename));
}

/**
 * Start development server
 */
async function startDevServer() {
    log('\n════════════════════════════════════════', 'cyan');
    log('   Resume Website Builder - Dev Server', 'bright');
    log('════════════════════════════════════════\n', 'cyan');

    // Initial build
    log('🚀 Starting development server...', 'blue');
    log('📦 Running initial build...\n', 'blue');

    try {
        await build();
        log('\n✓ Initial build complete!', 'green');
    } catch (error) {
        log('\n✗ Initial build failed', 'red');
        log('Continuing to watch for changes...\n', 'yellow');
    }

    // Start watching
    log('\n════════════════════════════════════════', 'cyan');
    log('   👀 Watching for changes...', 'bright');
    log('════════════════════════════════════════\n', 'cyan');

    log('Watching directories:', 'blue');
    watchPaths.forEach(watchPath => {
        const relativePath = path.relative(process.cwd(), watchPath);
        log(`  • ${relativePath}`, 'cyan');
        watchDirectory(watchPath, triggerRebuild);
    });

    log('\n💡 Tips:', 'magenta');
    log('  • Edit files in src/, config/, or templates/', 'cyan');
    log('  • Changes will trigger automatic rebuild', 'cyan');
    log('  • Open dist/index.html in your browser to view', 'cyan');
    log('  • Press Ctrl+C to stop the dev server\n', 'cyan');

    log('Press Ctrl+C to stop watching...\n', 'yellow');

    // Keep the process running
    process.on('SIGINT', () => {
        log('\n\n👋 Stopping dev server...', 'yellow');
        log('Goodbye!\n', 'green');
        process.exit(0);
    });
}

// Start the dev server if executed directly
if (require.main === module) {
    startDevServer();
}

module.exports = { startDevServer };
