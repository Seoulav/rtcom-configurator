const test=require('node:test');
const assert=require('node:assert/strict');
const catalog=require('../src/product-catalog.js');
const search=require('../src/product-search.js');
const validator=require('../src/catalog-validator.js');

test('normalized catalog preserves 31 products, unique ids and five categories',()=>{
  assert.equal(catalog.products.length,31);
  assert.equal(new Set(catalog.products.map(p=>p.productId)).size,31);
  assert.equal(new Set(catalog.products.map(p=>p.slug)).size,31);
  assert.deepEqual([...new Set(catalog.products.map(p=>p.categoryId))].sort(),['cable','distribution','extender','integrated','matrix']);
});

test('category registry exposes schemas and only populated categories',()=>{
  assert.deepEqual(Object.keys(catalog.categoryRegistry).sort(),['cable','distribution','extender','integrated','matrix']);
  for(const definition of Object.values(catalog.categoryRegistry)){
    assert.ok(['string','object'].includes(typeof definition.extensionSchema));
    assert.ok(Array.isArray(definition.filters));
  }
  assert.ok(search.availableFilters(catalog.products,'matrix').length>0);
  assert.ok(search.availableFilters(catalog.products,'distribution').some(f=>f.options.includes('1×4')));
});

test('catalog references images and source documents',()=>{
  const result=validator.validateCatalog(catalog,{assetExists:src=>src.startsWith('assets/')||src.startsWith('output/')});
  assert.equal(result.valid,true);
  assert.equal(result.summary.products,31);
  assert.equal(catalog.products.every(p=>p.images.length&&p.documents.includes('rtcom-catalog-2026')),true);
});

test('relations use product ids and verification status is explicit',()=>{
  for(const product of catalog.products)for(const relation of product.relations){
    assert.ok(catalog.productById[relation.targetProductId]);
    assert.ok(catalog.RELATION_TYPES.includes(relation.relationType));
  }
  assert.equal(catalog.productById['vdm-fiber101'].verification.status,'CONFLICTED');
  assert.equal(catalog.productById['vdm-cat103'].verification.status,'NEEDS_REVIEW');
  assert.equal(validator.isRecommendationEligible(catalog.productById['vdm-fiber101']),false);
});

test('synonyms and measurement variants produce equivalent search results',()=>{
  const results=q=>search.filterProducts(catalog.products,search.parseQuery(`?q=${encodeURIComponent(q)}`)).map(p=>p.productId);
  assert.deepEqual(results('1x4'),results('1×4'));
  assert.deepEqual(results('100m'),results('100 m'));
  assert.deepEqual(results('4K60'),results('4K 60Hz'));
  assert.ok(results('분배기').includes('hd-d104u'));
  assert.ok(results('fiber').includes('vdm-fiber101'));
});

test('single and multiple filters combine with search and preserve result counts',()=>{
  const state=search.sanitizeState({query:'1x4',categoryId:'distribution',filters:{topology:['1×4'],productType:['SPLITTER']}});
  const list=search.filterProducts(catalog.products,state);
  assert.equal(list.length,2);
  assert.equal(list.length,search.filterProducts(catalog.products,{...state,query:'4K60'}).length);
  const query=search.serializeQuery(state);
  assert.match(query,/category=distribution/);
  assert.match(query,/f=productType%3ASPLITTER/);
  assert.deepEqual(search.parseQuery(query),state);
});

test('URL state sanitizes unknown filters and restores category on navigation',()=>{
  const state=search.parseQuery('?q=100%20m&category=extender&f=medium%3ACAT&f=bad%3Avalue&f=medium%3ACAT');
  assert.deepEqual(state,{query:'100 m',categoryId:'extender',filters:{medium:['CAT']}});
  assert.deepEqual(search.parseQuery(search.serializeQuery(state)),state);
  assert.equal(search.parseQuery('?category=does-not-exist').categoryId,'all');
});
