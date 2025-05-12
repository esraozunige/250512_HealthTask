const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Function to create a basic placeholder image
function createPlaceholder(width, height, text, filename) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#4A6FFF';
    ctx.fillRect(0, 0, width, height);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(width/10)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width/2, height/2);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(assetsDir, filename), buffer);
    console.log(`Created ${filename}`);
}

// Generate all required assets
createPlaceholder(1024, 1024, 'App Icon', 'icon.png');
createPlaceholder(1242, 2436, 'Splash', 'splash.png');
createPlaceholder(1024, 1024, 'Adaptive Icon', 'adaptive-icon.png');
createPlaceholder(196, 196, 'Favicon', 'favicon.png');
createPlaceholder(200, 200, 'Doctor', 'doctor-avatar.png'); 