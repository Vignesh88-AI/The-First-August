const fs = require('fs');
const src = 'C:\\Users\\vigne\\.gemini\\antigravity-ide\\brain\\882debc5-ba3e-4ec5-b6a7-b713647a08f7\\cute_chick_flowers_1785509731948.png';
const dest = 'c:\\Users\\vigne\\Downloads\\1stAugust\\cute_chick_flowers.png';

try {
  fs.copyFileSync(src, dest);
  console.log('Image copied successfully!');
} catch (err) {
  console.error('Copy error:', err);
}
