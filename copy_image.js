// Utility script to copy generated chick image to project folder
// Run with: node copy_image.js
const fs = require('fs');
const src = 'C:\\Users\\vigne\\.gemini\\antigravity-ide\\brain\\d491b869-79cf-47cf-bb57-2714c4dd530b\\cute_chick_flowers_1785522387514.png';
const dest = 'c:\\Users\\vigne\\Downloads\\1stAugust\\cute_chick_flowers.png';

try {
  fs.copyFileSync(src, dest);
  console.log('Image copied successfully!');
} catch (err) {
  console.error('Copy error:', err);
}
