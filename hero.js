/* RASTRICK — hero shader system
   Desktop: 8 interactive shaders (cycle on click / arrow keys)
   Mobile:  Aurora Fields shader (touch-reactive, always-on)
*/
(function () {
  'use strict';

  const canvas = document.getElementById('hero-gl');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return;

  const isMobile = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // ─── Shared vertex shader ────────────────────────────────────────────
  const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

  // ─── Aurora Fields (mobile) ──────────────────────────────────────────
  // 3 flowing curtain bands. Touch X = horizontal wave phase.
  // Touch Y = vertical band position. Tap = lime burst.
  const AURORA_FRAG = `precision mediump float;
  uniform float T;uniform vec2 R,M,CP;uniform float CK;
  float hn(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.545);}
  void main(){
    vec2 uv=gl_FragCoord.xy/R;
    float ar=R.x/R.y;
    float mx=M.x,my=M.y;
    // Band 1 — main curtain
    float y1=.60+sin(uv.x*ar*2.0+T*.30+(mx-.5)*2.8)*.13
               +cos(uv.x*ar*.75-T*.20+(my-.5)*2.0)*.08;
    float a1=exp(-abs(uv.y-y1)*9.)*.85;
    // Band 2 — secondary shimmer
    float y2=.50+sin(uv.x*ar*3.4+T*.50+(mx-.5)*2.0)*.09
               +cos(uv.x*ar*1.6-T*.28+(my-.5)*1.2)*.06;
    float a2=exp(-abs(uv.y-y2)*13.)*.55;
    // Band 3 — faint upper glow
    float y3=.72+sin(uv.x*ar*1.2+T*.18+(mx-.5)*1.4)*.07;
    float a3=exp(-abs(uv.y-y3)*5.)*.35;
    float aurora=min(1.,a1+a2+a3);
    // Color — shifts with position, time, and touch
    float hue=fract(uv.x*ar*.22+T*.07+(mx-.5)*.45);
    vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
    vec3 aColor=mix(mix(cyan,lime,hue),mag,sin(hue*3.14+T*.25)*.38+.28);
    vec3 bg=vec3(.01,.012,.02);
    vec3 col=mix(bg,aColor,aurora);
    // Stars — visible where aurora is faint
    float star=step(.9984,hn(floor(gl_FragCoord.xy)));
    col+=star*vec3(.8,.92,1.)*.55*max(0.,1.-aurora*2.5);
    // Ground fade to dark
    col=mix(col,bg,smoothstep(.32,.0,uv.y)*.85);
    // Touch tap glow
    vec2 pp=(uv*2.-1.)*vec2(ar,1.);
    vec2 cp=(CP*2.-1.)*vec2(ar,1.);
    col+=lime*CK*.65*exp(-length(pp-cp)*3.2);
    // Vignette
    float vig=1.-dot(uv-.5,uv-.5)*1.3;
    col*=max(0.,vig);
    gl_FragColor=vec4(clamp(col,0.,1.),1.);
  }`;

  // ─── 8 Desktop shaders ───────────────────────────────────────────────
  const SHADERS = [
    // 0: LIQUID METAL — iridescent flowing noise, mouse creates wave distortion, click ripple
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float nxl(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5);
      float b=fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5);
      float c=fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5);
      float e=fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5);
      return mix(mix(a,b,f.x),mix(c,e,f.x),f.y);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      float md=length(p-mp)+.01;
      vec2 dp=p+normalize(p-mp+vec2(.001,0.))*sin(md*7.-T*2.8)*exp(-md*1.4)*.16;
      float n1=nxl(dp*2.1+T*.11);
      float n2=nxl(dp*4.4-T*.08+n1*.45);
      float n3=nxl(dp*9.+T*.06+n2*.3);
      float m=n1*.5+n2*.32+n3*.18;
      float h=m*6.28+T*.18;
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.),silver=vec3(.65,.72,.78);
      vec3 ca=mix(silver,lime,sin(h)*.5+.5);
      vec3 cb=mix(mag,cyan,cos(h*.75+1.2)*.5+.5);
      vec3 col=mix(vec3(.018,.022,.032),mix(ca,cb,m)*(.5+.6*m),smoothstep(.15,.7,m));
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float rip=sin(length(p-cp)*11.-T*7.)*exp(-length(p-cp)*1.8)*CK;
      col+=lime*max(0.,rip)*.5+mag*max(0.,-rip)*.4;
      float vig=1.-dot(uv-.5,uv-.5)*1.4;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Liquid Metal'],

    // 1: GRID RUNNER — retro perspective grid, mouse shifts vanishing point
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),bg=vec3(.031,.035,.043);
      float horizon=mp.y*.35;float yd=p.y-horizon;
      float d=abs(yd)+.015;float z=1./d;
      float gx=(p.x-mp.x*.5)*z*.38;float gz=sign(yd)*z+T*2.8;
      vec2 g=fract(vec2(gx,gz))-.5;
      float line=1.-smoothstep(0.,.055,min(abs(g.x),abs(g.y)));
      float fog=exp(-d*.9);
      float hue=sin(gx*.4+T*.18)*.5+.5;
      vec3 lc=mix(lime,mag,hue);
      vec3 col=mix(bg,lc,line*fog);
      float hg=exp(-yd*yd*18.)*.55;
      col+=mix(mag*.85,lime*.55,.45)*hg;
      col*=.96+.04*sin(gl_FragCoord.y*2.);
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      col+=lime*CK*.9*exp(-length(p-cp)*3.);
      col+=mag*CK*.4*exp(-length(p-cp)*1.5);
      float vig=1.-dot(uv-.5,uv-.5)*1.6;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Grid Runner'],

    // 1: PLASMA STORM — sine plasma, mouse vortex
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec2 d=p-mp;float r=length(d)+.01;
      float ang=atan(d.y,d.x)+T*.45/r;
      vec2 sp=mp+vec2(cos(ang),sin(ang))*r;
      float v=sin(sp.x*2.8+T)+sin(sp.y*2.3-T*.85);
      v+=sin(length(sp)*4.2-T*1.9)*.55;
      v+=cos(sp.x*5.+sp.y*3.2+T*1.15)*.35;
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.48,.99,1.);
      vec3 bg=vec3(.018,.02,.028);
      float h1=sin(v*1.9)*.5+.5;float h2=cos(v*2.8+T*.18)*.5+.5;
      vec3 col=mix(bg,mix(mix(mag,lime,h1),cyan,h2*.38),.82);
      col*=.78+.44*abs(sin(v*3.14));
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      col+=cyan*CK*.75*exp(-length(p-cp)*4.);
      col+=lime*CK*.3*exp(-length(p-cp)*1.8);
      float vig=1.-dot(uv-.5,uv-.5)*1.9;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Plasma Storm'],

    // 2: DIGITAL RAIN — falling columns, mouse scanline
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float hf(float n){return fract(sin(n)*43758.545);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      float cols=80.;float col=floor(uv.x*cols);float ch=hf(col);
      float speed=.32+M.x*1.5+ch*.75;
      float sy=1.-uv.y;float headSY=fract(T*speed*ch*1.4+ch*97.3);
      float above=mod(headSY-sy+1.,1.);
      float trlen=.1+ch*.12;
      float b=above<trlen?exp(-above/.022):0.;
      float xf=fract(uv.x*cols);
      b*=step(.17,1.-abs(xf-.5)*2.4);
      float scan=exp(-abs(uv.y-M.y)*38.)*.75;
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.48,.99,1.);
      float trailFrac=clamp(above/max(trlen,.001),0.,1.);
      vec3 c=mix(lime,cyan,trailFrac)*b+mag*scan;
      vec2 pp=(uv-.5)*2.;pp.x*=ar;vec2 cp=(CP-.5)*2.;cp.x*=ar;
      float shock=sin(length(pp-cp)*11.-T*16.)*exp(-length(pp-cp)*1.8)*CK;
      c+=lime*max(0.,shock)*.55;
      c=mix(vec3(.031,.035,.043),c,min(1.,b*3.+scan+max(0.,shock)*.25));
      float vig=1.-dot(uv-.5,uv-.5)*2.;
      c*=max(0.,vig);
      gl_FragColor=vec4(clamp(c,0.,1.),1.);
    }`, 'Digital Rain'],

    // 3: VOID CELLS — voronoi, mouse repels cells
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    vec2 hv2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.545);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec2 diff=p-mp;float md=length(diff)+.001;
      p+=normalize(diff)*.28/(md+.42);
      vec2 sc=p*3.6+T*.22;vec2 id=floor(sc),fr=fract(sc);
      float mn=9.;vec2 mg=vec2(0.);
      for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
        vec2 nb=vec2(float(i),float(j));
        vec2 rv=hv2(id+nb);
        vec2 o=.5+.45*sin(T*.65+6.28*rv);
        float dist=length(nb+o-fr);
        if(dist<mn){mn=dist;mg=nb;}
      }
      float edge=1.-smoothstep(0.,.09,mn);
      float glow=smoothstep(.28,.46,mn)*(1.-smoothstep(.46,.72,mn));
      vec2 cp=(CP-.5)*2.;cp.x*=ar;
      float rip=sin(length(p-cp)*8.5-T*11.)*exp(-length(p-cp)*1.4)*CK;
      float bright=edge+max(0.,rip)*.45+glow*.18;
      vec2 ch=hv2(id+mg);
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.48,.99,1.);
      vec3 cc=ch.x<.33?lime:ch.x<.66?mag:cyan;
      vec3 col=mix(vec3(.031,.035,.043),cc,bright);
      float vig=1.-dot(uv-.5,uv-.5)*1.55;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Void Cells'],

    // 4: NEBULA DRIFT — FBM nebula, mouse drags field, stars
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float hn(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.545);}
    float nx(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(hn(i),hn(i+vec2(1,0)),f.x),mix(hn(i+vec2(0,1)),hn(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*nx(p);p=p*2.1+vec2(3.7,1.9);a*=.5;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec2 dp=p-mp*.38;
      float f1=fbm(dp*1.15+vec2(T*.09,-T*.06));
      float f2=fbm(dp*2.1+vec2(f1)+vec2(-T*.07,T*.1));
      float neb=fbm(dp*1.55+f2*.65+T*.05);
      vec3 mag=vec3(1.,.239,.941),lime=vec3(.776,1.,.227),cyan=vec3(.3,.7,1.);
      vec3 bg=vec3(.012,.015,.022);
      vec3 col=mix(bg,mag*.72,smoothstep(.28,.62,neb));
      col=mix(col,lime*.78,smoothstep(.54,.84,neb));
      col=mix(col,cyan*.9,smoothstep(.76,.94,neb));
      float star=step(.9986,hn(floor(gl_FragCoord.xy)));
      col+=star*vec3(.88,.94,1.)*.65;
      vec2 cp=(CP-.5)*2.;cp.x*=ar;
      col+=lime*CK*.85*exp(-length(p-cp)*4.2);
      col+=mag*CK*.45*exp(-length(p-cp)*2.);
      float vig=1.-length(uv-.5)*1.22;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Nebula Drift'],

    // 8: TOPOLOGY MAP — elevation contour lines, mouse raises terrain, click seismic wave
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float nxt(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5);
      float b=fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5);
      float c=fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5);
      float e=fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5);
      return mix(mix(a,b,f.x),mix(c,e,f.x),f.y);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      float elev=(nxt(p*1.4+T*.035)+nxt(p*2.9-T*.025+.3)*.5+nxt(p*5.8+T*.018)*.25)/1.75;
      elev+=exp(-length(p-mp)*2.)*(.45+mp.y*.25)*.38;
      float ct=fract(elev*7.);
      float line=1.-smoothstep(0.,.042,min(ct,1.-ct));
      vec3 deep=vec3(.02,.03,.06),mid=vec3(.1,.45,.18),bright=vec3(.776,1.,.227),peak=vec3(1.,.239,.941);
      float e=clamp(elev,0.,1.);
      vec3 col=mix(deep,mix(mid,mix(bright,peak,smoothstep(.65,.9,e)),smoothstep(.35,.65,e)),smoothstep(.0,.35,e));
      col=mix(col,vec3(.9,.97,1.),line*(.4+e*.4));
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      float quake=sin(length(p-cp)*11.-T*9.)*exp(-length(p-cp)*1.3)*CK;
      col+=bright*max(0.,quake)*.55;
      float vig=1.-dot(uv-.5,uv-.5)*1.45;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Topology Map'],

    // 9: AURORA GRID — aurora curtains over fine grid, mouse moves bands, click flash
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    void main(){
      vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      float gs=22.;
      vec2 gp=fract(uv*vec2(gs*ar,gs))-.5;
      float grid=smoothstep(.06,.02,min(abs(gp.x),abs(gp.y)))*.12;
      float y1=.5+mp.y*.35+sin(uv.x*ar*2.2+T*.26+(mp.x-.5)*2.4)*.16+cos(uv.x*ar*.85-T*.17)*.09;
      float y2=.42+mp.y*.25+sin(uv.x*ar*3.8+T*.41+(mp.x-.5)*1.8)*.10;
      float a1=exp(-abs(uv.y-y1)*8.)*.88;
      float a2=exp(-abs(uv.y-y2)*13.)*.5;
      float aurora=min(1.,a1+a2);
      float hue=fract(uv.x*.2+T*.06+(mp.x-.5)*.42);
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.28,.88,1.);
      vec3 ac=mix(lime,mix(cyan,mag,sin(hue*3.14+T*.22)*.5+.5),hue);
      vec3 bg=vec3(.01,.013,.02);
      vec3 col=mix(bg,ac,aurora);
      col+=vec3(.25,.35,.5)*grid*(1.-aurora*.7);
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      col+=lime*CK*.65*exp(-length(p-cp)*3.)+mag*CK*.3*exp(-length(p-cp)*1.5);
      float vig=1.-dot(uv-.5,uv-.5)*1.5;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Aurora Grid'],
  ];

  // ─── GL helpers ──────────────────────────────────────────────────────
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[hero.js]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function makeProgram(fragSrc) {
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[hero.js link]', gl.getProgramInfoLog(prog));
      return null;
    }
    return {
      prog,
      loc: {
        p:  gl.getAttribLocation(prog,  'p'),
        T:  gl.getUniformLocation(prog, 'T'),
        R:  gl.getUniformLocation(prog, 'R'),
        M:  gl.getUniformLocation(prog, 'M'),
        CP: gl.getUniformLocation(prog, 'CP'),
        CK: gl.getUniformLocation(prog, 'CK'),
      },
    };
  }

  // Compile programs
  let programs, activeProgram;
  if (isMobile) {
    activeProgram = makeProgram(AURORA_FRAG);
  } else {
    programs = SHADERS.map(([frag]) => makeProgram(frag));
  }

  // Fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  // ─── State ───────────────────────────────────────────────────────────
  let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
  let clickT = 0, cx = 0.5, cy = 0.5;
  let shader = Math.min(+(localStorage.getItem('rastrick_shader') || 0), SHADERS.length - 1);

  // ─── Resize ──────────────────────────────────────────────────────────
  function resize() {
    const dpr = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.5)
      : Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(canvas.clientWidth  * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  // ─── Input ───────────────────────────────────────────────────────────
  if (isMobile) {
    // Touch tracking — passive so page can still scroll
    canvas.addEventListener('touchmove', e => {
      if (!e.touches.length) return;
      const r = canvas.getBoundingClientRect();
      mx = (e.touches[0].clientX - r.left) / r.width;
      my = 1 - (e.touches[0].clientY - r.top) / r.height;
    }, { passive: true });

    canvas.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      const r = canvas.getBoundingClientRect();
      cx = (e.touches[0].clientX - r.left) / r.width;
      cy = 1 - (e.touches[0].clientY - r.top) / r.height;
      clickT = 1.0;
    }, { passive: true });
  } else {
    // Desktop — mouse tracking
    window.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      mx = (e.clientX - r.left) / r.width;
      my = 1 - (e.clientY - r.top) / r.height;
    });

    canvas.addEventListener('pointerdown', e => {
      const r = canvas.getBoundingClientRect();
      cx = (e.clientX - r.left) / r.width;
      cy = 1 - (e.clientY - r.top) / r.height;
      clickT = 1.0;
      shader = (shader + 1) % SHADERS.length;
      localStorage.setItem('rastrick_shader', shader);
      updateUI();
    });

    window.addEventListener('keydown', e => {
      if (document.activeElement && document.activeElement !== document.body) return;
      if (e.key === 'ArrowRight') { shader = (shader + 1) % SHADERS.length; localStorage.setItem('rastrick_shader', shader); updateUI(); }
      if (e.key === 'ArrowLeft')  { shader = (shader - 1 + SHADERS.length) % SHADERS.length; localStorage.setItem('rastrick_shader', shader); updateUI(); }
    });

    // ─── Desktop shader selector dots ──────────────────────────────────
    const ui = document.createElement('div');
    ui.setAttribute('aria-hidden', 'true');
    Object.assign(ui.style, {
      position: 'absolute',
      bottom: 'clamp(28px,4vh,52px)',
      right: 'clamp(20px,4vw,56px)',
      display: 'flex',
      gap: '10px',
      zIndex: '4',
      alignItems: 'center',
    });

    const dots = SHADERS.map(([, name], i) => {
      const btn = document.createElement('button');
      btn.title = name;
      Object.assign(btn.style, {
        width: '7px', height: '7px', borderRadius: '50%',
        border: '1px solid rgba(255,255,255,.22)',
        background: 'transparent', padding: '0',
        cursor: 'pointer', flexShrink: '0',
        transition: 'all .22s',
      });
      btn.addEventListener('pointerdown', e => {
        e.stopPropagation();
        shader = i;
        clickT = 0.8;
        localStorage.setItem('rastrick_shader', shader);
        updateUI();
      });
      ui.appendChild(btn);
      return btn;
    });
    canvas.parentElement.appendChild(ui);

    function updateUI() {
      dots.forEach((d, i) => {
        const on = i === shader;
        d.style.background  = on ? '#c6ff3a' : 'transparent';
        d.style.borderColor = on ? '#c6ff3a' : 'rgba(255,255,255,.22)';
        d.style.transform   = on ? 'scale(1.7)' : 'scale(1)';
        d.style.boxShadow   = on ? '0 0 6px #c6ff3a' : 'none';
      });
    }
    updateUI();
  }

  // ─── Render ──────────────────────────────────────────────────────────
  const t0 = performance.now();
  let last = t0;

  function drawFrame(entry, now) {
    if (!entry) return;
    const { prog, loc } = entry;
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
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    smx += (mx - smx) * (isMobile ? 0.04 : 0.055);
    smy += (my - smy) * (isMobile ? 0.04 : 0.055);
    clickT = Math.max(0, clickT - dt * 1.1);

    if (isMobile) {
      drawFrame(activeProgram, now);
    } else {
      drawFrame(programs && programs[shader], now);
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

})();
