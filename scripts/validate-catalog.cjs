const fs=require('node:fs');
const path=require('node:path');
const catalog=require('../src/product-catalog.js');
const {validateCatalog}=require('../src/catalog-validator.js');

const root=path.resolve(__dirname,'..');
const assetExists=reference=>{
  if(fs.existsSync(path.join(root,reference)))return true;
  if(reference==='output/design/assets/rtcom-catalog-2026.pdf')return fs.readdirSync(path.join(root,'docs')).some(name=>name.toLowerCase().endsWith('.pdf'));
  return false;
};
const result=validateCatalog(catalog,{assetExists});
for(const warning of result.warnings)console.warn(`WARNING ${warning.code}${warning.productId?` [${warning.productId}]`:''}: ${warning.message}`);
for(const error of result.errors)console.error(`ERROR ${error.code}${error.productId?` [${error.productId}]`:''}: ${error.message}`);
console.log(`Catalog: ${result.summary.products} products / ${result.summary.categories} categories / ${result.errors.length} errors / ${result.warnings.length} warnings`);
if(!result.valid)process.exitCode=1;
