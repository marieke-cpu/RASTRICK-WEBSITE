/* RASTRICK — 5 interactive shader wallpapers
   Uniforms: T (time), R (resolution), M (mouse 0-1), CP (click pos), CK (click strength 0-1)
   Click canvas → cycle shaders. Arrow keys ← → also cycle.
   Shader preference persists in localStorage.
*/
(function () {
  'use strict';

  const canvas = document.getElementById('hero-gl');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return;

  // ─── Vertex shader (shared) ────────────────────────────────────────
  const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

  // ─── 5 Fragment shaders ────────────────────────────────────────────
  const SHADERS = [

    // ── 0: GRID RUNNER ────────────────────────────────────────────────
    // Retro perspective grid. Mouse shifts vanishing point.
    // Click = bright burst + grid ripple.
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    void main(){
      vec2 uv=gl_FragCoord.xy/R;
      float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),bg=vec3(.031,.035,.043);
      float horizon=mp.y*.35;
      float yd=p.y-horizon;
      float d=abs(yd)+.015;
      float z=1./d;
      float gx=(p.x-mp.x*.5)*z*.38;
      float gz=sign(yd)*z+T*2.8;
      vec2 g=fract(vec2(gx,gz))-.5;
      float line=1.-smoothstep(0.,.055,min(abs(g.x),abs(g.y)));
      float fog=exp(-d*.9);
      float hue=sin(gx*.4+T*.18)*.5+.5;
      vec3 lc=mix(lime,mag,hue);
      vec3 col=mix(bg,lc,line*fog);
      float hg=exp(-yd*yd*18.)*.55;
      col+=mix(mag*.85,lime*.55,.45)*hg;
      // scanlines
      col*=.96+.04*sin(gl_FragCoord.y*2.);
      // click burst
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      col+=lime*CK*.9*exp(-length(p-cp)*3.);
      col+=mag*CK*.4*exp(-length(p-cp)*1.5);
      float vig=1.-dot(uv-.5,uv-.5)*1.6;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Grid Runner'],

    // ── 1: PLASMA STORM ───────────────────────────────────────────────
    // Swirling sine plasma. Mouse creates a vortex that pulls the plasma.
    // Click = cyan burst.
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    void main(){
      vec2 uv=gl_FragCoord.xy/R;
      float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec2 d=p-mp;float r=length(d)+.01;
      float ang=atan(d.y,d.x)+T*.45/r;
      vec2 sp=mp+vec2(cos(ang),sin(ang))*r;
      float v =sin(sp.x*2.8+T)+sin(sp.y*2.3-T*.85);
      v+=sin(length(sp)*4.2-T*1.9)*.55;
      v+=cos(sp.x*5.+sp.y*3.2+T*1.15)*.35;
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.48,.99,1.);
      vec3 bg=vec3(.018,.02,.028);
      float h1=sin(v*1.9)*.5+.5;
      float h2=cos(v*2.8+T*.18)*.5+.5;
      vec3 col=mix(bg,mix(mix(mag,lime,h1),cyan,h2*.38),.82);
      col*=.78+.44*abs(sin(v*3.14));
      vec2 cp=(CP*2.-1.)*vec2(ar,1.);
      col+=cyan*CK*.75*exp(-length(p-cp)*4.);
      col+=lime*CK*.3*exp(-length(p-cp)*1.8);
      float vig=1.-dot(uv-.5,uv-.5)*1.9;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Plasma Storm'],

    // ── 2: DIGITAL RAIN ───────────────────────────────────────────────
    // Vertical rain columns. Mouse X = global speed. Mouse Y = magenta scanline.
    // Click = shockwave that scatters the rain.
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float hf(float n){return fract(sin(n)*43758.545);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;
      float ar=R.x/R.y;
      float cols=80.;
      float col=floor(uv.x*cols);
      float ch=hf(col);
      float speed=.32+M.x*1.5+ch*.75;
      // head position: sy=0 top, sy=1 bottom
      float sy=1.-uv.y;
      float headSY=fract(T*speed*ch*1.4+ch*97.3);
      float above=mod(headSY-sy+1.,1.);
      float trlen=.1+ch*.12;
      float b=above<trlen?exp(-above/.022):0.;
      float xf=fract(uv.x*cols);
      b*=step(.17,1.-abs(xf-.5)*2.4);
      // scanline at mouse Y
      float scan=exp(-abs(uv.y-M.y)*38.)*.75;
      vec3 lime=vec3(.776,1.,.227),mag=vec3(1.,.239,.941),cyan=vec3(.48,.99,1.);
      float trailFrac=clamp(above/max(trlen,.001),0.,1.);
      vec3 c=mix(lime,cyan,trailFrac)*b+mag*scan;
      // click shockwave
      vec2 pp=(uv-.5)*2.;pp.x*=ar;
      vec2 cp=(CP-.5)*2.;cp.x*=ar;
      float shock=sin(length(pp-cp)*11.-T*16.)*exp(-length(pp-cp)*1.8)*CK;
      c+=lime*max(0.,shock)*.55;
      c=mix(vec3(.031,.035,.043),c,min(1.,b*3.+scan+max(0.,shock)*.25));
      float vig=1.-dot(uv-.5,uv-.5)*2.;
      c*=max(0.,vig);
      gl_FragColor=vec4(clamp(c,0.,1.),1.);
    }`, 'Digital Rain'],

    // ── 3: VOID CELLS ─────────────────────────────────────────────────
    // Animated Voronoi. Mouse repels cells. Click = ripple wave.
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    vec2 hv2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.545);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;
      float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec2 diff=p-mp;float md=length(diff)+.001;
      p+=normalize(diff)*.28/(md+.42);
      vec2 sc=p*3.6+T*.22;
      vec2 id=floor(sc),fr=fract(sc);
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

    // ── 4: NEBULA DRIFT ───────────────────────────────────────────────
    // FBM noise nebula. Mouse drags the field. Stars. Click = lime burst.
    [`precision mediump float;
    uniform float T;uniform vec2 R,M,CP;uniform float CK;
    float hn(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.545);}
    float nx(vec2 p){
      vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(hn(i),hn(i+vec2(1,0)),f.x),mix(hn(i+vec2(0,1)),hn(i+vec2(1,1)),f.x),f.y);
    }
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*nx(p);p=p*2.1+vec2(3.7,1.9);a*=.5;}return v;}
    void main(){
      vec2 uv=gl_FragCoord.xy/R;
      float ar=R.x/R.y;
      vec2 p=(uv*2.-1.)*vec2(ar,1.);
      vec2 mp=(M*2.-1.)*vec2(ar,1.);
      vec2 dp=p-mp*.38;
      float f1=fbm(dp*1.15+vec2(T*.09,-T*.06));
      float f2=fbm(dp*2.1+vec2(f1)+vec2(-T*.07,T*.1));
      float neb=fbm(dp*1.55+f2*.65+T*.05);
      vec3 mag=vec3(1.,.239,.941),lime=vec3(.776,1.,.227),cyan=vec3(.3,.7,1.);
      vec3 bg=vec3(.012,.015,.022);
      vec3 col=mix(bg,mag*.72,smoothstep(.28,.62,neb));
      col=mix(col,lime*.78,smoothstep(.54,.84,neb));
      col=mix(col,cyan*.9,smoothstep(.76,.94,neb));
      // stars
      float star=step(.9986,hn(floor(gl_FragCoord.xy)));
      col+=star*vec3(.88,.94,1.)*.65;
      // click burst
      vec2 cp=(CP-.5)*2.;cp.x*=ar;
      col+=lime*CK*.85*exp(-length(p-cp)*4.2);
      col+=mag*CK*.45*exp(-length(p-cp)*2.);
      float vig=1.-length(uv-.5)*1.22;
      col*=max(0.,vig);
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }`, 'Nebula Drift'],

  ];

  // ─── GL helpers ─────────────────────────────────────────────────────
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[hero.js shader]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);

  const programs = SHADERS.map(([frag], idx) => {
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[hero.js link]', idx, gl.getProgramInfoLog(prog));
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
  });

  // Fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  // ─── State ──────────────────────────────────────────────────────────
  let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
  let clickT = 0, cx = 0.5, cy = 0.5;
  let shader = Math.min(+(localStorage.getItem('rastrick_shader') || 0), SHADERS.length - 1);

  // ─── Resize ─────────────────────────────────────────────────────────
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(canvas.clientWidth  * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  // ─── Input ──────────────────────────────────────────────────────────
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
    // cycle shader on canvas click (dots use separate listener that stops propagation)
    shader = (shader + 1) % SHADERS.length;
    localStorage.setItem('rastrick_shader', shader);
    updateUI();
  });

  window.addEventListener('keydown', e => {
    if (document.activeElement && document.activeElement !== document.body) return;
    if (e.key === 'ArrowRight') { shader = (shader + 1) % SHADERS.length; localStorage.setItem('rastrick_shader', shader); updateUI(); }
    if (e.key === 'ArrowLeft')  { shader = (shader - 1 + SHADERS.length) % SHADERS.length; localStorage.setItem('rastrick_shader', shader); updateUI(); }
  });

  // ─── Shader selector UI dots ────────────────────────────────────────
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
      d.style.background   = on ? '#c6ff3a' : 'transparent';
      d.style.borderColor  = on ? '#c6ff3a' : 'rgba(255,255,255,.22)';
      d.style.transform    = on ? 'scale(1.7)' : 'scale(1)';
      d.style.boxShadow    = on ? '0 0 6px #c6ff3a' : 'none';
    });
  }
  updateUI();

  // ─── Render loop ────────────────────────────────────────────────────
  const t0 = performance.now();
  let last = t0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    smx += (mx - smx) * 0.055;
    smy += (my - smy) * 0.055;
    clickT = Math.max(0, clickT - dt * 1.1);

    const entry = programs[shader];
    if (!entry) { requestAnimationFrame(frame); return; }

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
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

})();
