/* Daylight material studies. One WebGL context, shared by all visible specimens.
 * Photo composition only: no camera, location or environment estimation. */
'use strict';
(() => {
 const T=window.THREE, hosts=[...document.querySelectorAll('[data-day-object]')];
 if(!hosts.length)return;
 function unavailable(){hosts.forEach(h=>{h.classList.add('day-unavailable');h.setAttribute('aria-label','3D表示を利用できません。名称と地図で確認してください。');});}
 if(!T){unavailable();return;}
 let renderer;
 try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){unavailable();return;}
 renderer.setClearColor(0,0);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,60);camera.position.set(3.3,4.4,8.8);camera.lookAt(0,1.1,0);
 scene.add(new T.HemisphereLight(0xc9e7ff,0x6d7356,2.1));const sun=new T.DirectionalLight(0xfff0ce,3.6);sun.position.set(-4,8,5);scene.add(sun);
 // Soft sky, tree silhouettes and sunlight supply reflections, not a painted object.
 const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;const ec=envCanvas.getContext('2d');
 const eg=ec.createLinearGradient(0,0,0,512);eg.addColorStop(0,'#96b8cf');eg.addColorStop(.43,'#d9e0d7');eg.addColorStop(.53,'#667850');eg.addColorStop(1,'#3b443b');ec.fillStyle=eg;ec.fillRect(0,0,1024,512);
 let seed=17;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 for(let i=0;i<90;i++){ec.fillStyle=`rgba(39,63,32,${.1+rand()*.3})`;ec.beginPath();ec.ellipse(rand()*1024,220+rand()*100,10+rand()*55,20+rand()*60,0,0,Math.PI*2);ec.fill();}
 ec.fillStyle='#fffef0';ec.beginPath();ec.ellipse(235,110,37,30,0,0,Math.PI*2);ec.fill();
 const envTex=new T.CanvasTexture(envCanvas);envTex.mapping=T.EquirectangularReflectionMapping;envTex.colorSpace=T.SRGBColorSpace;
 const pmrem=new T.PMREMGenerator(renderer),envTarget=pmrem.fromEquirectangular(envTex);scene.environment=envTarget.texture;envTex.dispose();pmrem.dispose();
 const stoneCanvas=document.createElement('canvas');stoneCanvas.width=256;stoneCanvas.height=256;const sc=stoneCanvas.getContext('2d'),pixels=sc.createImageData(256,256);
 for(let i=0;i<pixels.data.length;i+=4){let v=110+rand()*65;pixels.data[i]=v*1.04;pixels.data[i+1]=v;pixels.data[i+2]=v*.87;pixels.data[i+3]=255;}sc.putImageData(pixels,0,0);
 const stoneTex=new T.CanvasTexture(stoneCanvas);stoneTex.wrapS=stoneTex.wrapT=T.RepeatWrapping;stoneTex.repeat.set(3,3);stoneTex.colorSpace=T.SRGBColorSpace;
 const stone=new T.MeshStandardMaterial({map:stoneTex,bumpMap:stoneTex,bumpScale:.08,color:0x8d9188,roughness:.88});
 const wetStone=new T.MeshStandardMaterial({map:stoneTex,bumpMap:stoneTex,bumpScale:.035,color:0x4e5d54,roughness:.3});
 const bronze=new T.MeshStandardMaterial({color:0x827047,metalness:.78,roughness:.28});
 const water=new T.MeshPhysicalMaterial({color:0x92c4bd,metalness:.15,roughness:.07,transparent:true,opacity:.43,clearcoat:1,clearcoatRoughness:.06,side:T.DoubleSide,depthWrite:false,envMapIntensity:1.8});
 const foam=new T.MeshStandardMaterial({color:0xf0f6ef,roughness:.3,transparent:true,opacity:.68,depthWrite:false});
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const sh=shadowCanvas.getContext('2d'),sg=sh.createRadialGradient(64,64,9,64,64,64);sg.addColorStop(0,'rgba(12,24,17,.6)');sg.addColorStop(.5,'rgba(12,24,17,.29)');sg.addColorStop(1,'rgba(12,24,17,0)');sh.fillStyle=sg;sh.fillRect(0,0,128,128);const shadowTex=new T.CanvasTexture(shadowCanvas);
 const models={};const animations=[];
 function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
 function group(name){const g=new T.Group();scene.add(g);g.visible=false;models[name]=g;const s=mesh(new T.PlaneGeometry(5,4),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:.85}),g,.18,.006,.12);s.rotation.x=-Math.PI/2;return g;}
 function basin(g,r=1.15){const base=mesh(new T.CylinderGeometry(r*1.01,r*1.05,.13,80),wetStone,g,0,.09,0);
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;const rock=mesh(new T.DodecahedronGeometry(.24,1),i%3?stone:wetStone,g,Math.cos(a)*r,.19+rand()*.035,Math.sin(a)*r);rock.scale.set(1.05+rand()*.3,.54+rand()*.18,.76+rand()*.25);rock.rotation.set(rand(),rand()*3,rand());}
  return base;
 }
 function spray(parent,count,height,radius,offset=0){const geo=new T.BufferGeometry(),p=new Float32Array(count*3),sizes=[];for(let i=0;i<count;i++)sizes.push({phase:rand(),angle:rand()*Math.PI*2,v:.6+rand()*.4,w:rand()});geo.setAttribute('position',new T.BufferAttribute(p,3));
  const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{opacity:{value:.72}},vertexShader:'varying float depth;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(18./-mv.z,1.,5.);depth=-mv.z;}',fragmentShader:'uniform float opacity;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);if(d>.5)discard;float rim=smoothstep(.12,.5,d);vec3 c=mix(vec3(.70,.87,.85),vec3(1.,1.,.94),rim);gl_FragColor=vec4(c,opacity*(1.-smoothstep(.37,.5,d)));}'});
  const points=new T.Points(geo,mat);parent.add(points);
  animations.push(t=>{for(let i=0;i<count;i++){const s=sizes[i],q=(s.phase+t*(.36+s.w*.12))%1;const r=radius*q*s.v;const y=height*4*q*(1-q)*s.v; p[i*3]=Math.cos(s.angle)*r;p[i*3+1]=.29+y+offset;p[i*3+2]=Math.sin(s.angle)*r;}geo.attributes.position.needsUpdate=true;});
 }
 function tube(points,r,material,g){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,r,8,false),material,g);}
 const fountain=group('water');basin(fountain);
 const surfaceGeo=new T.CircleGeometry(1.1,80,1);surfaceGeo.rotateX(-Math.PI/2);
 const surface=mesh(surfaceGeo,new T.MeshPhysicalMaterial({color:0x497b6b,roughness:.12,metalness:.32,transparent:true,opacity:.84,clearcoat:1,envMapIntensity:1.7,side:T.DoubleSide}),fountain,0,.235,0);
 const waves=[];for(let i=0;i<7;i++){const w=mesh(new T.TorusGeometry(.18+i*.13,.008,6,80),water,fountain,0,.25,0);w.rotation.x=Math.PI/2;waves.push(w);}
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2,pts=[];for(let j=0;j<=20;j++){const q=j/20,r=.66*q;pts.push([Math.cos(a)*r,.27+2.55*4*q*(1-q),Math.sin(a)*r]);}tube(pts,i%2?.012:.019,water,fountain);}
 tube([[0,.27,0],[.015,.9,0],[-.02,1.7,.015],[.035,2.45,-.015],[0,2.78,0]],.06,water,fountain);
 spray(fountain,1600,2.65,.94);spray(fountain,320,.22,1.03);
 for(let i=0;i<22;i++){const a=rand()*Math.PI*2,r=.75+rand()*.3;const bead=mesh(new T.SphereGeometry(.018+rand()*.018,6,5),foam,fountain,Math.cos(a)*r,.265,Math.sin(a)*r);bead.scale.y=.4;}
 animations.push(t=>{waves.forEach((w,i)=>{const q=(i/7+t*.15)%1;w.scale.setScalar(.5+q*1.1);w.position.y=.25+Math.sin(t*2+i)*.005;});surface.rotation.y=Math.sin(t*.2)*.015;});
 const ember=group('ember');basin(ember,.83);const coalMat=new T.MeshStandardMaterial({color:0x1a1714,roughness:1,emissive:0xd63a05,emissiveIntensity:.25});for(let i=0;i<32;i++){const a=rand()*7,r=rand()*.68,m=mesh(new T.DodecahedronGeometry(.14+rand()*.09,0),coalMat,ember,Math.cos(a)*r,.24+rand()*.12,Math.sin(a)*r);m.rotation.set(rand()*3,rand()*3,rand()*3);}
 const flameMat=new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec2 uvp;void main(){uvp=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvp;uniform float time;void main(){float y=uvp.y;float x=(uvp.x-.5)+sin(y*13.-time*3.)*.07*y;float w=(1.-y)*(.23+.07*sin(y*21.+time*4.));float a=smoothstep(w,w*.3,abs(x))*smoothstep(0.,.07,y)*(1.-y);vec3 c=mix(vec3(1.,.23,.01),vec3(1.,.86,.31),pow(1.-y,3.));gl_FragColor=vec4(c,a*.88);}'});
 for(let i=0;i<8;i++){const f=mesh(new T.PlaneGeometry(.6,1.3),flameMat,ember,(rand()-.5)*.7,.83,(rand()-.5)*.6);f.rotation.y=i*.8;f.scale.y=.65+rand()*.55;}animations.push(t=>flameMat.uniforms.time.value=t);
 const sound=group('sound');basin(sound,.68);mesh(new T.CylinderGeometry(.43,.52,.18,64),bronze,sound,0,.32,0);
 for(let i=0;i<4;i++){const ring=mesh(new T.TorusGeometry(.7+i*.07,.022,12,96),new T.MeshPhysicalMaterial({color:0xa7ac9d,metalness:.84,roughness:.17,clearcoat:1}),sound,0,.65+i*.46,0);ring.rotation.x=Math.PI/2+.12*i;animations.push(t=>{ring.position.y=.65+i*.46+Math.sin(t+i)*.028;});}
 const steam=group('steam');basin(steam,.82);mesh(new T.CylinderGeometry(.62,.44,.32,64),new T.MeshStandardMaterial({color:0x4e534d,metalness:.72,roughness:.3}),steam,0,.38,0);mesh(new T.CircleGeometry(.60,64),water,steam,0,.547,0).rotation.x=-Math.PI/2;
 const fogCanvas=document.createElement('canvas');fogCanvas.width=128;fogCanvas.height=128;const fc=fogCanvas.getContext('2d'),fg=fc.createRadialGradient(64,64,0,64,64,64);fg.addColorStop(0,'rgba(243,242,225,.28)');fg.addColorStop(.45,'rgba(243,242,225,.16)');fg.addColorStop(1,'rgba(243,242,225,0)');fc.fillStyle=fg;fc.fillRect(0,0,128,128);const fogTexture=new T.CanvasTexture(fogCanvas);
 for(let i=0;i<24;i++){const sprite=new T.Sprite(new T.SpriteMaterial({map:fogTexture,transparent:true,depthWrite:false}));steam.add(sprite);animations.push(t=>{const q=(i/24+t*.075)%1;sprite.position.set(Math.sin(q*5+i)*(.06+q*.28),.6+q*2.4,Math.cos(i)*.12);sprite.scale.setScalar(.55+q*.9);sprite.material.opacity=Math.sin(q*Math.PI)*.8;});}
 const portal=group('portal');for(const x of [-.83,.83])mesh(new T.BoxGeometry(.42,.16,.64),stone,portal,x,.11,0);
 const archPoints=[];for(let i=0;i<=70;i++){const a=Math.PI-i/70*Math.PI;archPoints.push([Math.cos(a)*.86,.22+Math.sin(a)*2.55,0]);}tube(archPoints,.072,bronze,portal);tube(archPoints.map(p=>[p[0]*.95,p[1],.032]),.019,new T.MeshPhysicalMaterial({color:0xcce1d6,roughness:.05,metalness:.4,clearcoat:1}),portal);
 const veil=mesh(new T.PlaneGeometry(1.52,2.15),new T.MeshPhysicalMaterial({color:0xd3e9dd,transparent:true,opacity:.065,roughness:.04,metalness:.15,side:T.DoubleSide,depthWrite:false}),portal,0,1.31,0);
 const memory=group('memory');basin(memory,.61);for(let i=0;i<7;i++){const orb=mesh(new T.SphereGeometry(.10+(i%3)*.025,24,20),new T.MeshPhysicalMaterial({color:0xc5b278,metalness:.5,roughness:.15,clearcoat:1}),memory,Math.sin(i*2.4)*.63,.65+i*.27,Math.cos(i)*.3);animations.push(t=>{orb.position.y=.65+i*.27+Math.sin(t*.65+i)*.07;orb.rotation.y=t*.1;});}
 const views=hosts.map(host=>{const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');host.append(canvas);return{host,canvas,ctx:canvas.getContext('2d'),visible:false};});
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{const v=views.find(v=>v.host===e.target);v.visible=e.isIntersecting;}),{rootMargin:'60px'});views.forEach(v=>io.observe(v.host));
 let previous=0,time=2.2;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function frame(now){requestAnimationFrame(frame);if(document.hidden||now-previous<40)return;const dt=Math.min((now-previous)/1000,.1);previous=now;
  const active=views.filter(v=>v.visible&&getComputedStyle(v.host).display!=='none');if(!active.length)return;
  if(!reduced.matches&&!document.querySelector('#experience.is-still'))time+=dt;animations.forEach(fn=>fn(time));
  for(const v of active){const field=v.host.closest('.experience');if(field&&(field.classList.contains('is-lost')||field.classList.contains('is-reality')))continue;
   const name=field?.dataset.material||v.host.dataset.dayObject;Object.values(models).forEach(g=>g.visible=false);const model=models[name]||fountain;model.visible=true;
   const scale=field?[.28,.52,1,.88][Number(field.dataset.stage)]:1;model.scale.setScalar(scale);model.rotation.y=field?-.2:0;
   const width=Math.max(1,Math.round(v.host.clientWidth*Math.min(devicePixelRatio,1.6))),height=Math.max(1,Math.round(v.host.clientHeight*Math.min(devicePixelRatio,1.6)));if(!width||!height)continue;
   if(v.canvas.width!==width||v.canvas.height!==height){v.canvas.width=width;v.canvas.height=height;}renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.render(scene,camera);v.ctx.clearRect(0,0,width,height);v.ctx.drawImage(renderer.domElement,0,0);v.host.dataset.rendered='true';
  }
 }
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();unavailable();});requestAnimationFrame(frame);
})();
