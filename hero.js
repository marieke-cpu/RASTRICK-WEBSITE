/* RASTRICK — hero shader + cursor-following 3D orb composite
   Uses WebGL 1. Renders a dark cinematic background with raymarched
   torus/orb that follows the cursor, volumetric fog, and subtle nebula.
*/
(function(){
  const canvas = document.getElementById('hero-gl');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) return;

  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const MARCH_STEPS = isTouchDevice ? '32' : '64';

  const vert = `
    attribute vec2 p;
    void main(){ gl_Position = vec4(p, 0.0, 1.0); }
  `;

  const frag = `
    precision highp float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform vec2  uMouse;       // 0..1, y flipped
    uniform vec2  uMouseSmooth;
    uniform float uScroll;      // 0..1 parallax
    uniform float uClickT;      // seconds since last click
    uniform float uClickS;      // strength

    // noise
    float hash21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
      return mix(mix(hash21(i),hash21(i+vec2(1,0)),u.x),
                 mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),u.x),u.y);
    }
    float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=0.5;} return v; }

    // sdf scene: one big orb + small orbiter
    float sdSphere(vec3 p, float r){ return length(p)-r; }
    float smin(float a, float b, float k){
      float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
      return mix(b, a, h) - k*h*(1.0-h);
    }

    vec2 map(vec3 p, vec3 mp){
      // main orb follows cursor
      float d1 = sdSphere(p - mp, 0.55);
      // orbiter
      float t = uTime*0.8;
      vec3 op = mp + vec3(cos(t)*0.9, sin(t*0.7)*0.4, sin(t)*0.9);
      float d2 = sdSphere(p - op, 0.18);
      // blob them
      float d = smin(d1, d2, 0.45);
      return vec2(d, 0.0);
    }

    vec3 calcNormal(vec3 p, vec3 mp){
      vec2 e = vec2(0.001, 0.0);
      float d = map(p, mp).x;
      return normalize(vec3(
        map(p+e.xyy, mp).x - d,
        map(p+e.yxy, mp).x - d,
        map(p+e.yyx, mp).x - d
      ));
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy - 0.5*uRes)/uRes.y;
      vec2 m = uMouseSmooth - 0.5;

      // ========== background: volumetric nebula ==========
      float t = uTime*0.04;
      vec2 w = uv*1.4 + vec2(t, -t*0.6);
      // mouse deflection
      vec2 d0 = uv - m*1.1;
      float r0 = length(d0)+0.001;
      w += normalize(d0) * exp(-r0*2.0) * 0.2;

      float n1 = fbm(w*1.2);
      float n2 = fbm(w*2.4 + n1);
      float n3 = fbm(w*5.0 + n2*1.5);

      vec3 bg = vec3(0.015, 0.018, 0.025);
      vec3 lime   = vec3(0.78, 1.0, 0.23);
      vec3 magenta = vec3(1.0, 0.24, 0.94);
      vec3 neb = mix(bg, lime*0.28, smoothstep(0.45, 0.85, n2) * 0.6);
      neb = mix(neb, magenta*0.22, smoothstep(0.65, 1.0, n3) * 0.55);

      // vignette
      float vig = 1.0 - smoothstep(0.4, 1.4, length(uv));
      neb *= 0.3 + 0.9*vig;

      // stars
      vec2 sp = gl_FragCoord.xy;
      float star = step(0.9985, hash21(floor(sp)));
      neb += star*vec3(0.9,0.95,1.0)*0.8;

      vec3 col = neb;

      // ========== raymarch orb ==========
      vec3 ro = vec3(0.0, 0.0, 2.4);
      vec3 rd = normalize(vec3(uv, -1.4));
      // mouse position in world
      vec3 mp = vec3(m*2.2, 0.0);
      mp += vec3(0.0, 0.0, 0.3*sin(uTime*0.6));

      // click pulse expands orb briefly
      float ct = uClickT;
      float pulse = 0.0;
      if (ct > 0.0 && ct < 1.2) pulse = exp(-ct*3.0)*uClickS;

      float tHit = 0.0;
      float hit = 0.0;
      for (int i=0; i<${MARCH_STEPS}; i++){
        vec3 pos = ro + rd*tHit;
        float d = map(pos, mp).x - pulse*0.25;
        if (d < 0.001) { hit = 1.0; break; }
        if (tHit > 6.0) break;
        tHit += d*0.9;
      }

      if (hit > 0.5){
        vec3 pos = ro + rd*tHit;
        vec3 nrm = calcNormal(pos, mp);
        vec3 ldir = normalize(vec3(0.4, 0.6, 0.8));
        float diff = max(0.0, dot(nrm, ldir));
        float fres = pow(1.0 - max(0.0, dot(nrm, -rd)), 3.0);

        // iridescent tint driven by normal (lime/magenta)
        vec3 ca = vec3(0.78, 1.0, 0.23);   // lime
        vec3 cb = vec3(1.0, 0.24, 0.94);   // magenta
        vec3 cc2 = mix(ca, cb, 0.5 + 0.5*nrm.y);
        vec3 orb = cc2 * (0.15 + diff*0.7);
        orb += fres * mix(cb, ca, 0.5)*1.2;

        // inner glow
        orb += vec3(0.78, 1.0, 0.23) * pulse * 1.2;

        col = mix(col, orb, 0.95);
      }

      // outer halo around orb even when missed
      vec2 orbScreen = mp.xy / 2.4;
      float rh = length(uv - orbScreen);
      float halo = exp(-rh*rh*7.0)*0.4;
      col += halo*mix(vec3(0.78, 1.0, 0.23), vec3(1.0, 0.24, 0.94), 0.5 + 0.5*sin(uTime*0.5));

      // scanlines / grade
      col *= 0.96 + 0.04*sin(gl_FragCoord.y*1.5);
      col = pow(col, vec3(0.95));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.error(gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, vert);
  const fs = compile(gl.FRAGMENT_SHADER, frag);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(prog)); return;
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

  const loc = {
    p:     gl.getAttribLocation(prog, 'p'),
    res:   gl.getUniformLocation(prog, 'uRes'),
    time:  gl.getUniformLocation(prog, 'uTime'),
    m:     gl.getUniformLocation(prog, 'uMouse'),
    ms:    gl.getUniformLocation(prog, 'uMouseSmooth'),
    sc:    gl.getUniformLocation(prog, 'uScroll'),
    ct:    gl.getUniformLocation(prog, 'uClickT'),
    cs:    gl.getUniformLocation(prog, 'uClickS'),
  };

  const state = {
    mx: 0.5, my: 0.5, smx: 0.5, smy: 0.5,
    clickT: 10, clickS: 0,
  };

  window.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    state.mx = (e.clientX - r.left) / r.width;
    state.my = 1 - (e.clientY - r.top) / r.height;
  });
  canvas.addEventListener('pointerdown', e => {
    state.clickT = 0;
    state.clickS = 1;
  });

  // Touch fallback so the orb follows finger on mobile
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      const r = canvas.getBoundingClientRect();
      state.mx = (e.touches[0].clientX - r.left) / r.width;
      state.my = 1 - (e.touches[0].clientY - r.top) / r.height;
    }
  }, { passive: true });
  canvas.addEventListener('touchstart', e => {
    state.clickT = 0;
    state.clickS = 1;
    if (e.touches.length > 0) {
      const r = canvas.getBoundingClientRect();
      state.mx = (e.touches[0].clientX - r.left) / r.width;
      state.my = 1 - (e.touches[0].clientY - r.top) / r.height;
    }
  }, { passive: true });

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, isTouchDevice ? 1 : 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.floor(w*dpr);
    canvas.height = Math.floor(h*dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  const t0 = performance.now();
  let last = t0;
  function frame(now){
    const dt = Math.min(0.05, (now - last)/1000);
    last = now;

    state.smx += (state.mx - state.smx)*0.08;
    state.smy += (state.my - state.smy)*0.08;
    state.clickT += dt;

    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc.p);
    gl.vertexAttribPointer(loc.p, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(loc.res, canvas.width, canvas.height);
    gl.uniform1f(loc.time, (now - t0)/1000);
    gl.uniform2f(loc.m, state.mx, state.my);
    gl.uniform2f(loc.ms, state.smx, state.smy);
    gl.uniform1f(loc.sc, window.scrollY / Math.max(1, window.innerHeight));
    gl.uniform1f(loc.ct, state.clickT);
    gl.uniform1f(loc.cs, state.clickS);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();