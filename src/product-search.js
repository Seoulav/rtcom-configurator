((scope)=>{
  const catalog=scope.RtProductCatalog||(typeof require==='function'?require('./product-catalog.js'):null);
  const synonyms=scope.RtSearchSynonyms||(typeof require==='function'?require('./search-synonyms.js'):null);
  const normalizeText=value=>String(value??'').normalize('NFKC').toLowerCase()
    .replace(/[×✕]/g,'x')
    .replace(/(\d+)\s*x\s*(\d+)/g,'$1x$2')
    .replace(/4k\s*60(?:\s*hz)?/g,'4k60')
    .replace(/(\d+(?:\.\d+)?)\s*(km|m)\b/g,'$1$2')
    .replace(/[^\p{L}\p{N}.+/-]+/gu,' ')
    .replace(/\s+/g,' ')
    .trim();
  const flatten=value=>{
    if(Array.isArray(value))return value.flatMap(flatten);
    if(value&&typeof value==='object')return Object.values(value).flatMap(flatten);
    return value===undefined||value===null?[]:[String(value)];
  };
  const containsTerm=(text,term)=>{
    if(term.length<=3&&/^[a-z]+$/.test(term))return new RegExp(`(?:^|[^a-z0-9])${term}(?:$|[^a-z0-9])`,'i').test(text);
    return text.includes(term);
  };
  const searchIndex=product=>{
    const category=catalog.categoryRegistry[product.categoryId];
    const base=normalizeText(flatten([product.modelName,product.displayName,product.shortDescription,product.useCases,product.tags,product.aliases,product.ports,product.capabilities.map(item=>item.label),product.categorySpecs,category?.label]).join(' '));
    const expanded=[];
    for(const group of synonyms.groups){
      const normalized=group.map(normalizeText);
      if(normalized.some(term=>containsTerm(base,term)))expanded.push(...normalized);
    }
    return `${base} ${expanded.join(' ')}`.trim();
  };
  const matchesQuery=(product,query)=>{
    const normalized=normalizeText(query);
    if(!normalized)return true;
    return searchIndex(product).includes(normalized);
  };
  const optionValues=(products,field)=>[...new Set(products.flatMap(product=>{
    const value=product.categorySpecs[field];
    return Array.isArray(value)?value:value===undefined?[]:[value];
  }).filter(value=>value!==undefined&&value!==null&&value!==''))].sort((a,b)=>String(a).localeCompare(String(b),'ko'));
  const availableFilters=(products,categoryId)=>{
    const category=catalog.categoryRegistry[categoryId];
    if(!category)return [];
    const categoryProducts=products.filter(product=>product.categoryId===categoryId);
    return category.filters.map(filter=>({...filter,options:optionValues(categoryProducts,filter.field)})).filter(filter=>filter.options.length>0);
  };
  const sanitizeState=(input,products=catalog.products)=>{
    const categoryId=input.categoryId==='all'||catalog.categoryRegistry[input.categoryId]?input.categoryId:'all';
    const filters={};
    const definitions=availableFilters(products,categoryId);
    for(const definition of definitions){
      const allowed=new Set(definition.options.map(String));
      const values=[...new Set((input.filters?.[definition.filterId]||[]).map(String).filter(value=>allowed.has(value)))];
      if(values.length)filters[definition.filterId]=values;
    }
    return {query:String(input.query||''),categoryId,filters};
  };
  const parseQuery=search=>{
    const params=new URLSearchParams(search||'');
    const filters={};
    for(const value of params.getAll('f')){
      const divider=value.indexOf(':');
      if(divider<1)continue;
      const id=value.slice(0,divider),option=value.slice(divider+1);
      if(!filters[id])filters[id]=[];
      filters[id].push(option);
    }
    return sanitizeState({query:params.get('q')||'',categoryId:params.get('category')||'all',filters});
  };
  const serializeQuery=input=>{
    const state=sanitizeState(input),params=new URLSearchParams();
    if(state.query.trim())params.set('q',state.query.trim());
    if(state.categoryId!=='all')params.set('category',state.categoryId);
    for(const id of Object.keys(state.filters).sort())for(const value of [...state.filters[id]].sort())params.append('f',`${id}:${value}`);
    const value=params.toString();
    return value?`?${value}`:'';
  };
  const matchesFilters=(product,filters)=>Object.entries(filters).every(([filterId,selected])=>{
    const definition=catalog.categoryRegistry[product.categoryId]?.filters.find(item=>item.filterId===filterId);
    if(!definition)return false;
    const raw=product.categorySpecs[definition.field],values=(Array.isArray(raw)?raw:[raw]).map(String);
    return selected.some(value=>values.includes(String(value)));
  });
  const filterProducts=(products,input)=>{
    const state=sanitizeState(input,products);
    return products.filter(product=>(state.categoryId==='all'||product.categoryId===state.categoryId)&&matchesQuery(product,state.query)&&matchesFilters(product,state.filters));
  };
  const api={normalizeText,searchIndex,matchesQuery,availableFilters,sanitizeState,parseQuery,serializeQuery,matchesFilters,filterProducts};
  scope.RtProductSearch=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
