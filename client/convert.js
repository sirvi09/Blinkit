import sharp from 'sharp';
import fs from 'fs';

const inputPath = './src/assets/Wide_Assortment.png';
const outputPath = './src/assets/Wide_Assortment.webp';

sharp(inputPath)
  .webp({ quality: 80 })
  .toFile(outputPath)
  .then(() => {
    console.log('Successfully converted image to WebP');
    fs.unlinkSync(inputPath);
  })
  .catch(err => console.error('Error converting image:', err));
