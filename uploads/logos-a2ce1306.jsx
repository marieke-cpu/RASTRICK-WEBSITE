// RASTRICK · Final pair: 05A Boot Screen + 07 Centered Window
// 4 plain R icon options under each — pick the favourite

const BLACK = '#000000';
const PAPER = '#F2F0EA';
const MAGENTA = '#FF1A8C';
const LIME = '#C6FF3D';
const DISPLAY = 'Anton, "Archivo Narrow", "Archivo Black", sans-serif';
const MONO = '"JetBrains Mono", monospace';

function Scanlines() {
  return <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(198,255,61,0.04) 2px, rgba(198,255,61,0.04) 3px)', pointerEvents: 'none' }} />;
}

// ─────────────────────────────────────────────────────────────
// 05A · BOOT SCREEN
// ─────────────────────────────────────────────────────────────
function BootScreen() {
  return (
    <div style={{ width: '100%', height: '100%', background: BLACK, position: 'relative', overflow: 'hidden', fontFamily: MONO, color: LIME }}>
      <Scanlines />
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: `radial-gradient(circle, ${MAGENTA}33, transparent 60%)` }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, background: `radial-gradient(circle, ${LIME}22, transparent 60%)` }} />

      <div style={{ position: 'absolute', inset: 40, border: `1.5px solid ${LIME}66`, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.18em', color: LIME + 'cc' }}>
          <span>RASTRICK_OS v.2026 // DIGITAL.AGENCY</span>
          <span>● REC</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
          <div style={{ fontSize: 14, color: LIME, letterSpacing: '0.2em' }}>&gt; INITIALIZING_BRAND.exe</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 156, lineHeight: 0.85, letterSpacing: '-0.03em', color: PAPER, textTransform: 'uppercase' }}>
            RASTRICK<span style={{ display: 'inline-block', width: 24, height: 130, background: MAGENTA, marginLeft: 10, verticalAlign: 'top', animation: 'rkblink 1s steps(2) infinite' }} />
          </div>

          <div style={{ width: '100%', marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.2em', color: LIME, marginBottom: 6 }}>
              <span>LOADING: IMPOSSIBLE_TO_IGNORE</span>
              <span>[ 100% ]</span>
            </div>
            <div style={{ width: '100%', height: 22, border: `1.5px solid ${LIME}`, padding: 2, display: 'flex', gap: 2 }}>
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} style={{ flex: 1, background: i < 28 ? LIME : (i < 30 ? MAGENTA : 'transparent') }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.18em', color: LIME + 'aa' }}>
          <span>WEB · BRANDS · MARKETING</span>
          <span style={{ color: MAGENTA }}>PRESS ANY KEY ▮</span>
        </div>
      </div>

      <style>{`@keyframes rkblink{50%{opacity:0}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 07 · CENTERED WINDOW
// ─────────────────────────────────────────────────────────────
function CenteredWindow() {
  return (
    <div style={{ width: '100%', height: '100%', background: BLACK, position: 'relative', overflow: 'hidden', fontFamily: MONO, color: PAPER }}>
      <Scanlines />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${LIME}11 1px, transparent 1px), linear-gradient(90deg, ${LIME}11 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 600, transform: 'translate(-50%, -50%)', background: `radial-gradient(circle, ${MAGENTA}22, transparent 60%)` }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '78%', background: BLACK, border: `2px solid ${PAPER}`, boxShadow: `8px 8px 0 ${MAGENTA}, 16px 16px 0 ${LIME}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${PAPER}`, padding: '8px 12px', background: PAPER, color: BLACK }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: MAGENTA, border: `1px solid ${BLACK}` }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: LIME, border: `1px solid ${BLACK}` }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: PAPER, border: `1px solid ${BLACK}` }} />
              </div>
              <span>RASTRICK.EXE — //digital_agency</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', display: 'flex', gap: 8 }}>
              <span style={{ border: `1px solid ${BLACK}`, padding: '0 6px' }}>_</span>
              <span style={{ border: `1px solid ${BLACK}`, padding: '0 6px' }}>□</span>
              <span style={{ border: `1px solid ${BLACK}`, background: MAGENTA, color: PAPER, padding: '0 6px' }}>×</span>
            </div>
          </div>

          <div style={{ padding: '40px 48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, color: LIME, letterSpacing: '0.3em' }}>━━━ NOW LOADING ━━━</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 132, lineHeight: 0.85, letterSpacing: '-0.03em', color: PAPER, textTransform: 'uppercase', textAlign: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', left: -3, top: 0, color: MAGENTA, mixBlendMode: 'screen', opacity: 0.85 }}>RASTRICK</span>
              <span style={{ position: 'absolute', left: 3, top: 0, color: LIME, mixBlendMode: 'screen', opacity: 0.85 }}>RASTRICK</span>
              <span style={{ position: 'relative' }}>RASTRICK</span>
            </div>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: LIME, letterSpacing: '0.18em' }}>STATUS</span>
              <div style={{ flex: 1, height: 8, background: BLACK, border: `1px solid ${LIME}`, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '92%', background: LIME }} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 11, color: PAPER, letterSpacing: '0.18em' }}>92%</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: PAPER, letterSpacing: '0.3em', marginTop: 6, textAlign: 'center' }}>
              <span style={{ color: MAGENTA }}>&gt;</span> IMPOSSIBLE_TO_IGNORE <span style={{ color: MAGENTA }}>&lt;</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${PAPER}`, padding: '6px 12px', fontFamily: MONO, fontSize: 10, color: PAPER, letterSpacing: '0.2em' }}>
            <span>WEB · BRANDS · DIGITAL</span>
            <span style={{ color: LIME }}>● READY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PLAIN R MARKS — 4 simple variations
// All white/cream R on black; same condensed display face.
// Differences: pure, with cursor, with dot, with underline.
// ─────────────────────────────────────────────────────────────

// R-01 · Pure
function R01() {
  return (
    <div style={{ fontFamily: DISPLAY, fontSize: 120, lineHeight: 1, color: PAPER, letterSpacing: '-0.04em' }}>R</div>
  );
}

// R-02 · With cursor (lime block)
function R02() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 120, lineHeight: 1, color: PAPER, letterSpacing: '-0.04em' }}>R</div>
      <div style={{ width: 18, height: 90, background: LIME }} />
    </div>
  );
}

// R-03 · With magenta dot (period)
function R03() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 120, lineHeight: 1, color: PAPER, letterSpacing: '-0.04em' }}>R</div>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: MAGENTA, marginBottom: 6 }} />
    </div>
  );
}

// R-04 · With underline ticker
function R04() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 120, lineHeight: 1, color: PAPER, letterSpacing: '-0.04em' }}>R</div>
      <div style={{ display: 'flex', gap: 3 }}>
        <div style={{ width: 14, height: 5, background: LIME }} />
        <div style={{ width: 14, height: 5, background: LIME }} />
        <div style={{ width: 14, height: 5, background: LIME }} />
        <div style={{ width: 14, height: 5, background: MAGENTA }} />
      </div>
    </div>
  );
}

const R_OPTIONS = [
  { id: 'R-01', label: 'R-01 · Pure', Comp: R01 },
  { id: 'R-02', label: 'R-02 · Cursor', Comp: R02 },
  { id: 'R-03', label: 'R-03 · Dot', Comp: R03 },
  { id: 'R-04', label: 'R-04 · Ticker', Comp: R04 },
];

function MarkRow() {
  return (
    <div style={{ display: 'flex', background: BLACK, borderTop: `1px solid ${LIME}33` }}>
      {R_OPTIONS.map((it, i) => (
        <div key={it.id} style={{ flex: 1, padding: '36px 16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, borderRight: i < R_OPTIONS.length - 1 ? `1px solid ${LIME}22` : 'none' }}>
          <div style={{ width: 160, height: 160, background: BLACK, border: `1px solid ${LIME}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <it.Comp />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: LIME }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function LogoSlot({ children }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: BLACK }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
      <MarkRow />
    </div>
  );
}

function App() {
  const W = 960;
  const H = 760;

  return (
    <DesignCanvas>
      <DCSection id="final" title="RASTRICK · Final pair" subtitle="05A Boot Screen + 07 Centered Window. Same 4 plain ‘R’ icon options under each — pick one.">

        <DCArtboard id="05A-boot" label="05A · Boot Screen" width={W} height={H}>
          <LogoSlot>
            <BootScreen />
          </LogoSlot>
        </DCArtboard>

        <DCArtboard id="07-window" label="07 · Centered Window" width={W} height={H}>
          <LogoSlot>
            <CenteredWindow />
          </LogoSlot>
        </DCArtboard>

      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
