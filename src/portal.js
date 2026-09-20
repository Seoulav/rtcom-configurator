(()=>{
  const root=document.querySelector('#rtcom-design');
  if(!root)return;
  const views=[...root.querySelectorAll('[data-route-view]')];
  const links=[...root.querySelectorAll('[data-route-link]')];
  const routes=new Set(views.map(view=>view.dataset.routeView));
  const titles={
    '/':'RTCOM AV Design Library',
    '/products':'제품 라이브러리 | RTCOM AV Design Library',
    '/tools/matrix-configurator':'매트릭스 구성기 | RTCOM AV Design Library'
  };
  const scriptUrl=new URL(document.currentScript.src,location.href);
  const marker='/src/portal.js';
  const basePath=scriptUrl.pathname.endsWith(marker)?scriptUrl.pathname.slice(0,-marker.length).replace(/\/$/,''):'';
  const normalize=path=>{
    const withoutBase=basePath&&path.startsWith(`${basePath}/`)?path.slice(basePath.length):path;
    const clean=withoutBase.replace(/\/index\.html$/,'/').replace(/\/+$/,'')||'/';
    return routes.has(clean)?clean:'/';
  };
  const urlFor=route=>`${basePath}${route==='/'?'/':route}`;
  links.forEach(link=>link.href=urlFor(link.dataset.routeLink));
  function render(route,{focus=false}={}){
    const next=routes.has(route)?route:'/';
    views.forEach(view=>view.hidden=view.dataset.routeView!==next);
    links.forEach(link=>{
      if(link.dataset.routeLink===next)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.title=titles[next];
    document.documentElement.dataset.route=next;
    if(next!=='/products')root.querySelector('.rt-product-dialog[open]')?.close();
    if(focus)requestAnimationFrame(()=>views.find(view=>view.dataset.routeView===next)?.querySelector('h1')?.focus());
  }
  function navigate(route,{replace=false,focus=true}={}){
    const next=routes.has(route)?route:'/';
    history[replace?'replaceState':'pushState']({route:next},'',urlFor(next));
    render(next,{focus});
  }
  root.addEventListener('click',event=>{
    const link=event.target.closest('[data-route-link]');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    navigate(link.dataset.routeLink);
  });
  addEventListener('popstate',()=>render(normalize(location.pathname),{focus:true}));
  let initial=normalize(location.pathname);
  if(initial==='/'&&location.hash==='#matrix-configurator')initial='/tools/matrix-configurator';
  const requested=location.pathname.replace(/\/+$/,'')||'/';
  const expected=urlFor(initial).replace(/\/+$/,'')||'/';
  if(initial!=='/'||requested===expected)render(initial);
  else navigate('/',{replace:true,focus:false});
  if(initial==='/tools/matrix-configurator'&&location.hash==='#matrix-configurator')navigate(initial,{replace:true,focus:false});
  globalThis.RtPortal={navigate,route:()=>normalize(location.pathname),basePath};
})();
