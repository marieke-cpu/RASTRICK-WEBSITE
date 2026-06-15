/* RASTRICK — page-specific hero shaders v1
   Each page gets one unique WebGL background via data-shader attr on #hero-gl.
   Responds to mouse/touch. Click sends a shockwave ripple.
   None of these shaders appear on the homepage.
*/
(function () {
  'use strict';

  const canvas = document.getElementById('hero-gl');
  if (!canvas) return;

  const pageKey = canvas.dataset.shader;
  if (!pageKey) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return;

  const isMobile = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const KHR = gl.getExtension('KHR_parallel_shader_compile');
  const idleQ = typeof requestIdleCallback !== 'undefined'
    ? fn => requestIdleCallback(fn)
    : fn => setTimeout(fn, 0);

  const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

  // ─── Page shaders ────────────────────────────────────────────────────
  const SHADERS = {

    // ABOUT — Ripple Field
    // Multiple wave sources create interference patterns — organic, personal, always moving
    about: `precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec2 s1=vec2(sin(T*.23)*.65,cos(T*.17)*.4);
      vec2 s2=vec2(cos(T*.19)*.5,sin(T*.21)*.45)+mp*.38;
      vec2 s3=vec2(sin(T*.31)*.38+mp.x*.22,cos(T*.27)*.34);
      vec2 s4=mp*.52;
      float r1=sin(length(p-s1)*7.-T*2.2);
      float r2=sin(length(p-s2)*8.5-T*2.8);
      float r3=sin(length(p-s3)*5.5-T*1.8);
      float r4=sin(length(p-s4)*10.-T*3.2);
      float wave=(r1+r2+r3+r4)*.25+.5;
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
      vec3 bg=vec3(.01,.013,.02);
      float hue=fract(wave*1.6+T*.05);
      vec3 wc=mix(mix(mag,lime,hue),cyan,sin(hue*3.14)*.4+.1);
      float bright=smoothstep(.28,.72,wave)*(.5+wave*.4);
      vec3 col=mix(bg,wc,bright);
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float shock=sin(length(p-cp)*12.-T*9.)*exp(-length(p-cp)*1.6)*CK;
      col+=lime*max(0.,shock)*.6+mag*max(0.,-shock)*.4;
      float vig=1.-dot(uv-.5,uv-.5)*1.55;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`,

    // WORK — Hex Pulse
    // Hexagonal grid with each cell pulsing its own color — modular, portfolio-like
    work: `precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float hf(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.545);}
    float hexD(vec2 p){p=abs(p);return max(p.x,p.x*.5+p.y*.866);}
    vec2 hexLocal(vec2 p){
      vec2 r=vec2(1.,1.732);vec2 h=r*.5;
      vec2 a=mod(p,r)-h;vec2 b=mod(p+h,r)-h;
      return dot(a,a)<dot(b,b)?a:b;}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      float sc=5.;
      vec2 gp=p*sc;
      vec2 local=hexLocal(gp);
      vec2 cid=gp-local;
      float ci=hf(cid);
      float hd=hexD(local);
      float edge=1.-smoothstep(.44,.5,hd);
      float inner=smoothstep(.0,.44,hd);
      float phase=ci*6.28+T*(.35+ci*.6);
      float pulse=(sin(phase)*.5+.5)*inner;
      float md=length(p-mp);
      pulse+=exp(-md*2.2)*sin(md*5.5-T*2.8)*.32;
      pulse=clamp(pulse,0.,1.);
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
      vec3 bg=vec3(.015,.018,.028);
      float hue=fract(ci+T*.035);
      vec3 hc=mix(mix(mag,lime,hue),cyan,sin(hue*3.14)*.38);
      vec3 col=mix(bg,hc*.85,pulse*.72);
      col+=lime*edge*.28*(pulse*.6+.4);
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float rip=sin(length(p-cp)*11.-T*9.)*exp(-length(p-cp)*1.7)*CK;
      col+=lime*max(0.,rip)*.55+mag*max(0.,-rip)*.4;
      float vig=1.-dot(uv-.5,uv-.5)*1.5;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`,

    // PACKAGES — Kaleidoscope
    // 6-fold mirror fold creating a slowly rotating mandala — geometric, premium
    packages: `precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.545);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      float rot=T*.07+mp.x*.25;
      float cr=cos(rot),sr=sin(rot);
      vec2 rp=vec2(cr*p.x-sr*p.y,sr*p.x+cr*p.y);
      float ang=atan(rp.y,rp.x);
      float r=length(rp);
      float sector=3.14159/3.;
      ang=mod(ang,sector*2.);
      if(ang>sector) ang=sector*2.-ang;
      vec2 fp=vec2(cos(ang),sin(ang))*r;
      float f1=n(fp*1.6+T*.07);
      float f2=n(fp*2.8-T*.05+f1*.4+vec2(2.3,1.7));
      float f3=n(fp*5.+T*.04+f2*.3);
      float v=f1*.5+f2*.32+f3*.18;
      float fade=exp(-r*.55)*(1.-exp(-r*4.));
      float bright=smoothstep(.25,.7,v)*fade*(.7+v*.25);
      float hue=fract(v*2.2+r*.15+T*.045);
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
      float h3=hue*3.;
      vec3 c=h3<1.?mix(cyan,lime,h3):h3<2.?mix(lime,mag,h3-1.):mix(mag,cyan,h3-2.);
      vec3 bg=vec3(.01,.012,.02);
      vec3 col=mix(bg,c,bright);
      col+=c*exp(-length(p-mp)*2.)*.12;
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float shock=sin(length(p-cp)*11.-T*9.)*exp(-length(p-cp)*1.6)*CK;
      col+=lime*max(0.,shock)*.6+mag*max(0.,-shock)*.4;
      float vig=1.-dot(uv-.5,uv-.5)*1.6;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`,

    // SERVICES — Sine Stack
    // Layered glowing sine wave lines — precise, signal-like, technical
    services: `precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float wline(vec2 p,float freq,float amp,float spd,float ph,float mx){
      float y=sin(p.x*freq+T*spd+ph+mx*1.8)*amp;
      return exp(-abs(p.y-y)*22.);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
      vec3 bg=vec3(.01,.013,.02);
      float w1=wline(p,1.8,.22,1.1,0.,mp.x);
      float w2=wline(p,2.5,.16,.85,2.1,mp.x*.75);
      float w3=wline(p,3.4,.12,1.35,4.2,mp.x*.55);
      float w4=wline(p,5.2,.09,.62,1.5,mp.x*.35);
      float w5=wline(p,1.1,.28,.52,3.7,mp.x);
      float w6=wline(p,4.0,.10,1.0,.8,mp.x*.6);
      vec3 col=bg;
      col+=lime*w1*.88;
      col+=mag*w2*.72;
      col+=cyan*w3*.68;
      col+=lime*.55*w4*.58;
      col+=mag*.65*w5*.48;
      col+=cyan*.7*w6*.5;
      float scan=exp(-abs(p.y-mp.y)*18.)*.28;
      col+=lime*scan;
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float rip=sin(length(p-cp)*11.-T*9.)*exp(-length(p-cp)*1.7)*CK;
      col+=lime*max(0.,rip)*.55+mag*max(0.,-rip)*.4;
      float vig=1.-dot(uv-.5,uv-.5)*1.6;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`,

    // CONTACT — Pulse Rings
    // Expanding sonar-style concentric rings — radiating outward, connective
    contact: `precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec2 orig=mp*.28;
      float d=length(p-orig);
      float rings=0.;
      for(int i=0;i<6;i++){
        float fi=float(i);
        float r=fract(T*.16+fi*.1667)*2.8;
        float fade=(1.-r/2.8)*(1.-r/2.8);
        rings+=exp(-abs(d-r)*14.)*fade;
      }
      float md=length(p-mp);
      float mRings=0.;
      for(int i=0;i<4;i++){
        float fi=float(i);
        float r=fract(T*.22+fi*.25)*2.0;
        float fade=1.-r/2.0;
        mRings+=exp(-abs(md-r)*18.)*fade;
      }
      rings+=mRings*.45;
      float crossH=exp(-abs(p.y-orig.y)*32.)*.18;
      float crossV=exp(-abs(p.x-orig.x)*32.)*.18;
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
      vec3 bg=vec3(.01,.013,.022);
      float hue=fract(d*.18-T*.04);
      vec3 rc=mix(lime,mag,hue);
      vec3 col=mix(bg,rc,clamp(rings*.72,0.,1.));
      col+=cyan*(crossH+crossV);
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float shock=sin(length(p-cp)*11.-T*9.)*exp(-length(p-cp)*1.5)*CK;
      col+=lime*max(0.,shock)*.6;
      float vig=1.-dot(uv-.5,uv-.5)*1.5;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`,

    // BIN REVIVALS — Urban Scatter
    // Noise-based high-contrast zones with scattered neon specks — gritty, energetic
    'bin-revivals': `precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.545);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      float z1=n(p*1.4+T*.04+mp*.18);
      float z2=n(p*2.2-T*.03+n(p*.8)*.4);
      float zone=z1*.6+z2*.4;
      float speck=step(.94,h(floor(gl_FragCoord.xy/2.)));
      float edge=abs(fract(zone*5.)-.5)*2.;
      float spray=exp(-edge*edge*2.8)*1.4;
      spray*=1.+n(p*9.+T*.12)*.45;
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
      vec3 bg=vec3(.014,.016,.024);
      float hue=fract(zone*2.2+T*.03+mp.x*.18);
      vec3 zc=mix(mix(lime,mag,hue),cyan,fract(hue*1.9));
      vec3 col=mix(bg,zc*.55,spray*.45);
      col+=lime*speck*.45*(1.-spray*.5);
      col+=lime*exp(-length(p-mp)*3.)*spray*.15;
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float rip=sin(length(p-cp)*12.-T*10.)*exp(-length(p-cp)*1.5)*CK;
      col+=lime*max(0.,rip)*.35+mag*max(0.,-rip)*.25;
      float vig=1.-dot(uv-.5,uv-.5)*1.6;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`,

    // POLY CONCRETING — Moiré
    // Two dot grids rotating at different speeds — shifting interference patterns, brand colours
    'poly-concreting': `precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      float sc=9.;
      float a1=T*.07+mp.x*.22;
      float c1=cos(a1),s1=sin(a1);
      vec2 rp1=vec2(c1*p.x-s1*p.y,s1*p.x+c1*p.y)*sc;
      float d1=smoothstep(.24,.16,length(fract(rp1)-.5));
      float a2=T*.048+mp.y*.16;
      float c2=cos(a2),s2=sin(a2);
      vec2 rp2=vec2(c2*p.x-s2*p.y,s2*p.x+c2*p.y)*sc;
      float d2=smoothstep(.24,.16,length(fract(rp2)-.5));
      float intersect=d1*d2;
      float solo=max(d1,d2)*(1.-min(d1,d2))*.35;
      float pat=clamp(intersect*1.4+solo,0.,1.);
      float hue=fract(pat*1.8+length(p)*.18+T*.04);
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
      float h3=hue*3.;
      vec3 c=h3<1.?mix(mag,lime,h3):h3<2.?mix(lime,cyan,h3-1.):mix(cyan,mag,h3-2.);
      vec3 bg=vec3(.01,.013,.02);
      vec3 col=mix(bg,c,pat*.85);
      col+=c*exp(-length(p-mp)*2.5)*.18;
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float shock=sin(length(p-cp)*11.-T*9.)*exp(-length(p-cp)*1.6)*CK;
      col+=lime*max(0.,shock)*.6+mag*max(0.,-shock)*.4;
      float vig=1.-dot(uv-.5,uv-.5)*1.55;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`,
  };

  const fragSrc = SHADERS[pageKey];
  if (!fragSrc) return;

  // ─── Compile ─────────────────────────────────────────────────────────
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, VERT);
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fragSrc);
  gl.compileShader(fs);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  let ready = false;
  let loc = null;

  function tryFinalize() {
    if (ready) return;
    if (KHR && !gl.getProgramParameter(prog, KHR.COMPLETION_STATUS_KHR)) return;
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    loc = {
      p:  gl.getAttribLocation(prog, 'p'),
      T:  gl.getUniformLocation(prog, 'T'),
      R:  gl.getUniformLocation(prog, 'R'),
      M:  gl.getUniformLocation(prog, 'M'),
      CP: gl.getUniformLocation(prog, 'CP'),
      CK: gl.getUniformLocation(prog, 'CK'),
    };
    ready = true;
  }

  if (!KHR) idleQ(tryFinalize);

  // ─── Fullscreen quad ─────────────────────────────────────────────────
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  // ─── State ───────────────────────────────────────────────────────────
  let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
  let clickT = 0, cx = 0.5, cy = 0.5;
  let canvasRect = canvas.getBoundingClientRect();

  function resize() {
    const dpr = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.2)
      : Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(canvas.clientWidth  * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    canvasRect = canvas.getBoundingClientRect();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('scroll', () => { canvasRect = canvas.getBoundingClientRect(); }, { passive: true });

  // ─── Input ───────────────────────────────────────────────────────────
  if (isMobile) {
    canvas.addEventListener('touchmove', e => {
      if (!e.touches.length) return;
      mx = (e.touches[0].clientX - canvasRect.left) / canvasRect.width;
      my = 1 - (e.touches[0].clientY - canvasRect.top) / canvasRect.height;
    }, { passive: true });
    canvas.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      cx = (e.touches[0].clientX - canvasRect.left) / canvasRect.width;
      cy = 1 - (e.touches[0].clientY - canvasRect.top) / canvasRect.height;
      clickT = 1.0;
    }, { passive: true });
  } else {
    window.addEventListener('pointermove', e => {
      const r = canvasRect;
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      mx = (e.clientX - r.left) / r.width;
      my = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });
    canvas.addEventListener('pointerdown', e => {
      cx = (e.clientX - canvasRect.left) / canvasRect.width;
      cy = 1 - (e.clientY - canvasRect.top) / canvasRect.height;
      clickT = 1.0;
    });
  }

  // ─── Render loop ─────────────────────────────────────────────────────
  const t0 = performance.now();
  let last = t0;
  let rafHandle = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    smx += (mx - smx) * (isMobile ? 0.04 : 0.055);
    smy += (my - smy) * (isMobile ? 0.04 : 0.055);
    clickT = Math.max(0, clickT - dt * 1.1);

    if (!ready) {
      if (KHR) tryFinalize();
      rafHandle = requestAnimationFrame(frame);
      return;
    }

    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc.p);
    gl.vertexAttribPointer(loc.p, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(loc.T,  (now - t0) / 1000);
    gl.uniform2f(loc.R,  canvas.width, canvas.height);
    gl.uniform2f(loc.M,  smx, smy);
    gl.uniform2f(loc.CP, cx, cy);
    gl.uniform1f(loc.CK, clickT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    rafHandle = requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = 0; }
    } else {
      if (!rafHandle) { last = performance.now(); rafHandle = requestAnimationFrame(frame); }
    }
  });

  rafHandle = requestAnimationFrame(frame);

})();
