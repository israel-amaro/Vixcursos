const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
async function run() {
    const images = [];
    async function walk(dir) {
        for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
            const file = path.join(dir, entry.name);
            if (entry.isDirectory()) await walk(file);
            else if (/\.png$/i.test(file)) images.push(file);
        }
    }
    await walk('public/imagem');
    for (const file of images) await sharp(file).resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(file.replace(/\.png$/i, '.webp'));
    const logo = 'public/imagem/logo.png';
    await sharp(logo).resize(32, 32, { fit: 'contain', background: '#ffffff' }).png().toFile('public/favicon-32.png');
    await sharp(logo).resize(180, 180, { fit: 'contain', background: '#ffffff' }).png().toFile('public/apple-touch-icon.png');
    await sharp(logo).resize(1200, 630, { fit: 'contain', background: '#ffffff' }).jpeg({ quality: 80 }).toFile('public/compartilhar.jpg');
    await sharp(logo).resize(192, 192, { fit: 'contain', background: '#ffffff' }).png().toFile('public/icon-192.png');
    await sharp(logo).resize(512, 512, { fit: 'contain', background: '#ffffff' }).png().toFile('public/icon-512.png');
    console.log(`${images.length} imagens convertidas.`);
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
