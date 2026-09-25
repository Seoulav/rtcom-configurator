const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.md':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf'};
// 0.6 포털 주소는 배포본(package-site.cjs)과 같게 구성기 첫 화면으로 보낸다.
const legacyRoutes=new Set(['/products','/products/','/tools/matrix-configurator','/tools/matrix-configurator/']);
const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  let pathname,file;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(root,'.'+pathname)}catch{res.writeHead(400);res.end();return}
  if(file===root)file=path.join(root,'index.html');
  if(legacyRoutes.has(pathname)){res.writeHead(302,{Location:'/'});res.end();return}
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404);res.end('Not found');return}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD'){res.end();return}
    fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  });
});
server.listen(4173,'127.0.0.1',()=>console.log('RTCOM: http://127.0.0.1:4173'));
