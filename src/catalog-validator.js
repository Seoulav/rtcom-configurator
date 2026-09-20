((scope)=>{
  const catalog=scope.RtProductCatalog||(typeof require==='function'?require('./product-catalog.js'):null);
  const plain=value=>value&&typeof value==='object'&&!Array.isArray(value);
  const allowedDirections=new Set(['INPUT','OUTPUT','BIDIRECTIONAL']);
  const isRecommendationEligible=product=>product?.verification?.status==='VERIFIED';
  function validateCatalog(input=catalog,{assetExists=()=>true}={}){
    const errors=[],warnings=[],products=input.products||[],ids=new Set(),slugs=new Set();
    const error=(code,message,productId)=>errors.push({code,message,productId});
    const warning=(code,message,productId)=>warnings.push({code,message,productId});
    if(products.length!==31)error('PRODUCT_COUNT',`제품 수는 31개여야 합니다: ${products.length}`);
    for(const product of products){
      const id=product.productId;
      if(!id||typeof id!=='string')error('PRODUCT_ID_REQUIRED','productId가 필요합니다.',id);
      else if(ids.has(id))error('PRODUCT_ID_DUPLICATE',`중복 productId: ${id}`,id);else ids.add(id);
      if(!product.slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug))error('SLUG_INVALID',`유효하지 않은 slug: ${product.slug}`,id);
      else if(slugs.has(product.slug))error('SLUG_DUPLICATE',`중복 slug: ${product.slug}`,id);else slugs.add(product.slug);
      const category=input.categoryRegistry?.[product.categoryId];
      if(!category)error('CATEGORY_UNKNOWN',`등록되지 않은 categoryId: ${product.categoryId}`,id);
      if(!input.PRODUCT_STATUSES?.includes(product.status))error('PRODUCT_STATUS_INVALID',`허용되지 않은 제품 상태: ${product.status}`,id);
      if(!plain(product.categorySpecs))error('CATEGORY_SPECS_REQUIRED','categorySpecs 객체가 필요합니다.',id);
      else if(category){
        for(const [field,value] of Object.entries(product.categorySpecs)){
          const expected=category.allowedSpecFields[field];
          if(!expected)error('CATEGORY_SPEC_UNKNOWN',`${product.categoryId}에 허용되지 않은 필드: ${field}`,id);
          else if(expected==='string'&&typeof value!=='string')error('CATEGORY_SPEC_TYPE',`${field}는 문자열이어야 합니다.`,id);
          else if(expected==='string[]'&&(!Array.isArray(value)||value.some(item=>typeof item!=='string')))error('CATEGORY_SPEC_TYPE',`${field}는 문자열 배열이어야 합니다.`,id);
        }
      }
      if(!Array.isArray(product.images)||!product.images.length)error('IMAGE_REQUIRED','제품 이미지가 필요합니다.',id);
      for(const image of product.images||[])if(!assetExists(image.src))error('IMAGE_MISSING',`이미지 참조 누락: ${image.src}`,id);
      for(const documentId of product.documents||[])if(!input.documents?.[documentId])error('DOCUMENT_MISSING',`문서 참조 누락: ${documentId}`,id);
      for(const port of product.ports||[]){
        if(!allowedDirections.has(port.direction))error('PORT_DIRECTION_INVALID',`포트 방향 오류: ${port.direction}`,id);
        if(typeof port.count!=='number'||port.count<1)error('PORT_COUNT_INVALID',`포트 수 오류: ${port.count}`,id);
      }
      const verification=product.verification;
      if(!plain(verification)||!input.VERIFICATION_STATUSES?.includes(verification.status))error('VERIFICATION_INVALID','검증 상태가 올바르지 않습니다.',id);
      else{
        if(verification.status==='VERIFIED'&&!(verification.sourceRefs||[]).length)error('VERIFIED_WITHOUT_SOURCE','VERIFIED에는 근거가 필요합니다.',id);
        if(['UNKNOWN','NEEDS_REVIEW','CONFLICTED'].includes(verification.status)&&!(verification.openQuestions||[]).length)warning('OPEN_QUESTION_REQUIRED',`${verification.status}에 openQuestions가 없습니다.`,id);
      }
      for(const relation of product.relations||[]){
        if(!input.RELATION_TYPES?.includes(relation.relationType))error('RELATION_TYPE_INVALID',`관계 유형 오류: ${relation.relationType}`,id);
        if(relation.targetProductId===id)error('RELATION_SELF','자기 자신을 참조할 수 없습니다.',id);
        if(!products.some(candidate=>candidate.productId===relation.targetProductId))error('RELATION_TARGET_MISSING',`관계 대상 누락: ${relation.targetProductId}`,id);
        if(relation.relationType==='TX_PAIR'){
          const target=products.find(candidate=>candidate.productId===relation.targetProductId);
          if(!target?.relations?.some(candidate=>candidate.relationType==='RX_PAIR'&&candidate.targetProductId===id))error('TX_RX_NOT_RECIPROCAL',`TX_PAIR 역관계가 없습니다: ${relation.targetProductId}`,id);
        }
      }
      if(Object.values(product.categorySpecs||{}).some(value=>value===false||value===0))warning('FALSE_ZERO_REVIEW','false 또는 0은 UNKNOWN과 구분해 검토해야 합니다.',id);
    }
    return {valid:errors.length===0,errors,warnings,summary:{products:products.length,categories:Object.keys(input.categoryRegistry||{}).length}};
  }
  const api={validateCatalog,isRecommendationEligible};
  scope.RtCatalogValidator=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
