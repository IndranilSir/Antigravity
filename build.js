const fs = require('fs');
const path = require('path');

const config = {
    html: 'index.html',
    css: 'style.css',
    js: 'app.js',
    image: 'assets/ikonlogo.png', // Corrected path
    dist: 'dist/index.html'
};

async function build() {
    console.log('Starting build...');

    // 1. Read HTML
    let html = fs.readFileSync(config.html, 'utf8');

    // 2. Read CSS and Inline
    const css = fs.readFileSync(config.css, 'utf8');
    html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`);

    // 3. Read JS and Inline
    const js = fs.readFileSync(config.js, 'utf8');
    html = html.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);

    // 4. Read Image and Inline (Base64)
    if (fs.existsSync(config.image)) {
        const imageBuffer = fs.readFileSync(config.image);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = 'image/png'; // Assuming png based on extension
        const dataUri = `data:${mimeType};base64,${base64Image}`;

        // Replace the specific image tag source
        // Targeting the specific line or just a regex replace for the known src
        // Original: <img src="assets/ikonlogo.png" ...>
        html = html.replace('src="assets/ikonlogo.png"', `src="${dataUri}"`);
        console.log('Image inlined successfully.');
    } else {
        console.warn(`Warning: Image file ${config.image} not found.`);
    }

    // 5. Ensure dist dir
    const distDir = path.dirname(config.dist);
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    // 6. Write Output
    fs.writeFileSync(config.dist, html);
    console.log(`Build complete! File written to ${config.dist}`);
}

build().catch(console.error);
