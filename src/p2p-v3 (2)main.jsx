import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════
// CONFIG — per-merchant settings
// ═══════════════════════════════════════════════
const CONFIG = {
  merchantName: "",           // empty = no brand shown
  accentColor: "#5B2D8E",     // PhonePe-inspired purple
  showUpiId: true,            // false for Forex merchants (prevents amount tampering)
  showApps: true,             // deep link buttons
  timerMinutes: 15,
};

// derive colors from accent
const accent = CONFIG.accentColor;
const accentLight = accent + "12";
const accentBorder = accent + "30";

// ═══════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════
const T = {
  en: {
    amount: "Amount to Pay",
    timeLeft: "Time remaining",
    exactAmt: "Pay exact amount",
    saveQR: "Save QR",
    upiIdLabel: "UPI ID",
    copyUPI: "Copy",
    copiedUPI: "Copied!",
    payVia: "Or open directly",
    utrLabel: "UTR / Reference Number",
    utrPlaceholder: "Enter 12-digit UTR",
    utrHint: "Where to find UTR?",
    utrTooltipTitle: "Finding your UTR",
    utrTooltipSteps: [
      "Open your UPI app (PhonePe, GPay, etc.)",
      "Go to Transaction History",
      "Tap on the payment you just made",
      "Look for 'UTR' or 'Reference ID' — 12 digits",
      "Copy and paste it here",
    ],
    detecting: "Checking for your payment automatically...",
    orManual: "Enter UTR for faster confirmation",
    submit: "Confirm Payment",
    submitting: "Verifying...",
    noteTitle: "Please note",
    notes: [
      "Pay the exact amount — partial payments won't be processed",
      "Each QR code is for one payment only",
      "Incorrect UTR will delay your deposit",
    ],
    expiredTitle: "Payment Session Expired",
    expiredDesc: "This payment link has timed out. Please request a new one.",
    expiredBtn: "Request New Payment",
    failedTitle: "Payment Declined",
    failedDesc: "Your bank could not process this transaction. Please try again or use a different payment method.",
    failedReason: "Reason",
    failedBankMsg: "Transaction declined by bank",
    failedRetry: "Try Again",
    successTitle: "Payment Successful!",
    successDesc: "Your transaction has been confirmed.",
    trackId: "Tracking ID",
    amountLabel: "Amount",
    verifying: "Verifying payment...",
    secure: "End-to-end encrypted",
    upiSafe: "UPI Secured",
  },
  hi: {
    amount: "भुगतान राशि",
    timeLeft: "शेष समय",
    exactAmt: "सही राशि भुगतान करें",
    saveQR: "QR सेव करें",
    upiIdLabel: "UPI ID",
    copyUPI: "कॉपी",
    copiedUPI: "कॉपी हो गया!",
    payVia: "या सीधे खोलें",
    utrLabel: "UTR / संदर्भ संख्या",
    utrPlaceholder: "12 अंकों का UTR दर्ज करें",
    utrHint: "UTR कहाँ मिलेगा?",
    utrTooltipTitle: "UTR कैसे खोजें",
    utrTooltipSteps: [
      "अपना UPI ऐप खोलें (PhonePe, GPay, आदि)",
      "लेन-देन इतिहास में जाएं",
      "आपने जो भुगतान किया उस पर टैप करें",
      "'UTR' या 'Reference ID' — 12 अंकों का नंबर",
      "इसे कॉपी करें और यहाँ पेस्ट करें",
    ],
    detecting: "आपके भुगतान की स्वचालित जाँच...",
    orManual: "तेज़ पुष्टि के लिए UTR दर्ज करें",
    submit: "भुगतान की पुष्टि करें",
    submitting: "सत्यापित हो रहा है...",
    noteTitle: "कृपया ध्यान दें",
    notes: [
      "सही राशि भुगतान करें — आंशिक भुगतान प्रोसेस नहीं होगा",
      "प्रत्येक QR कोड केवल एक भुगतान के लिए है",
      "गलत UTR से जमा में देरी होगी",
    ],
    expiredTitle: "भुगतान सत्र समाप्त",
    expiredDesc: "समय समाप्त। कृपया मर्चेंट से नया अनुरोध करें।",
    expiredBtn: "नया भुगतान",
    failedTitle: "भुगतान अस्वीकृत",
    failedDesc: "बैंक इस लेन-देन को प्रोसेस नहीं कर सका। कृपया पुनः प्रयास करें।",
    failedReason: "कारण",
    failedBankMsg: "बैंक द्वारा अस्वीकृत",
    failedRetry: "फिर से कोशिश करें",
    successTitle: "भुगतान सफल!",
    successDesc: "आपका लेन-देन पुष्टि हो गया।",
    trackId: "ट्रैकिंग ID",
    amountLabel: "राशि",
    verifying: "भुगतान सत्यापित हो रहा है...",
    secure: "एंड-टू-एंड एन्क्रिप्टेड",
    upiSafe: "UPI सुरक्षित",
  },
};

// ═══════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════
const Ic = ({ d, size = 16, color = "currentColor", strokeW = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);
const Icons = {
  clock: <Ic d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
  check: <Ic d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} />,
  copy: <Ic d={<><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></>} size={14} />,
  info: <Ic d={<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>} size={14} />,
  chevDown: <Ic d="m6 9 6 6 6-6" size={14} />,
  shield: <Ic d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>} size={14} />,
  lock: <Ic d={<><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} size={13} />,
  download: <Ic d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} size={14} />,
  alert: <Ic d={<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>} size={14} />,
  loader: <Ic d={<><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>} size={16} />,
};

// ═══════════════════════════════════════════════
// QR CODE
// ═══════════════════════════════════════════════
const QR = ({ size = 185 }) => {
  const n = 31, c = size / n;
  const grid = useRef(Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, col) => {
      const inF = (r<7&&col<7)||(r<7&&col>=n-7)||(r>=n-7&&col<7);
      const inI = (r>=2&&r<=4&&col>=2&&col<=4)||(r>=2&&r<=4&&col>=n-5&&col<=n-3)||(r>=n-5&&r<=n-3&&col>=2&&col<=4);
      if(inF||inI) return true;
      if(r===7||col===7||r===n-8||col===n-8) return false;
      return Math.random()>.47;
    })
  )).current;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" rx="2"/>
      {grid.map((row,r)=>row.map((on,col)=>on?<rect key={`${r}${col}`} x={col*c} y={r*c} width={c} height={c} fill="#0c1425" rx={.4}/>:null))}
    </svg>
  );
};

const APPS = [
  { id:"phonepe", name:"PhonePe", bg:"#5F259F", letter:"₱", desc:"UPI" },
  { id:"gpay", name:"Google Pay", bg:"#1A73E8", letter:"G", desc:"UPI" },
  { id:"paytm", name:"Paytm", bg:"#00B9F5", letter:"P", desc:"UPI" },
];

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
export default function P2PPage() {
  const [lang, setLang] = useState("en");
  const [utr, setUtr] = useState("412598037621");
  const [utrErr, setUtrErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CONFIG.timerMinutes * 60);
  const t = T[lang];

  const AMT = "509.99";
  const UPI_ID = "merchant7994@ptyes";
  const ORDER = "20250526154402130";
  const SHORT = ORDER.slice(-8);

  useEffect(() => {
    const iv = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const pct = (timeLeft / (CONFIG.timerMinutes * 60)) * 100;
  const urgent = timeLeft < 120 && timeLeft > 0;
  const expired = timeLeft === 0;

  const doCopy = useCallback(() => {
    navigator.clipboard?.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const onUtrChange = (v) => {
    setUtr(v.replace(/\D/g, "").slice(0, 12));
    if (utrErr) setUtrErr("");
  };

  const onSubmit = () => {
    if (utr.length !== 12) {
      setUtrErr(lang === "en" ? "Please enter all 12 digits" : "कृपया सभी 12 अंक दर्ज करें");
      return;
    }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 2200);
  };

  // ─── EXPIRED ─────────────────────────────
  if (expired) return (
    <Shell lang={lang} setLang={setLang}>
      <div style={{ textAlign: "center", padding: "56px 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#ef4444" }}>{Icons.clock}</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0c1425", marginBottom: 6 }}>{t.expiredTitle}</h2>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>{t.expiredDesc}</p>
        <button style={$.btnPrimary}>{t.expiredBtn}</button>
      </div>
    </Shell>
  );

  // ─── FAILED (bank declined) ──────────────
  if (failed) return (
    <Shell lang={lang} setLang={setLang}>
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Ic d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} size={28} color="#ef4444" strokeW={2.5} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0c1425", marginBottom: 6 }}>{t.failedTitle}</h2>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>{t.failedDesc}</p>
        <div style={{ padding: "12px 14px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>{t.failedReason}</div>
          <div style={{ fontSize: 12, color: "#ef4444" }}>{t.failedBankMsg}</div>
        </div>
        <button onClick={() => { setFailed(false); setUtr(""); setUtrErr(""); }} style={{ ...$.btnPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {t.failedRetry}
        </button>
      </div>
      <Footer t={t} />
    </Shell>
  );

  // ─── SUCCESS ─────────────────────────────
  if (done) return (
    <Shell lang={lang} setLang={setLang}>
      <div style={{ textAlign: "center", padding: "44px 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #d1fae5, #a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "popIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
          <Ic d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} size={32} color="#059669" strokeW={2.5} />
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: "#0c1425", marginBottom: 4 }}>{t.successTitle}</h2>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>{t.successDesc}</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[[t.trackId, SHORT], [t.amountLabel, `₹${AMT}`]].map(([l,v],i) => (
            <div key={i} style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", color: "#0c1425" }}>{v}</div>
            </div>
          ))}
        </div>
        <button style={$.btnPrimary}>Done</button>
      </div>
      <Footer t={t} />
    </Shell>
  );

  // ─── SINGLE PAGE FLOW ────────────────────
  return (
    <Shell lang={lang} setLang={setLang}>

      {/* ── Amount ── */}
      <div style={$.amtBlock}>
        <div style={$.amtLabel}>{t.amount}</div>
        <div style={$.amtValue}>₹{AMT}</div>
        <div style={$.amtBadge}>{t.exactAmt}</div>
      </div>

      {/* ── Timer ── */}
      <div style={{ ...$.timerWrap, borderColor: urgent ? "#fecaca" : "#e2e8f0" }}>
        <div style={$.timerTrack}>
          <div style={{ ...$.timerFill, width: `${pct}%`, background: urgent ? "#ef4444" : accent }} />
        </div>
        <div style={$.timerRow}>
          <span style={{ ...$.timerLabel, color: urgent ? "#ef4444" : "#94a3b8" }}>{Icons.clock} {t.timeLeft}</span>
          <span style={{ ...$.timerDigits, color: urgent ? "#ef4444" : "#0c1425", ...(urgent ? {animation:"pulse 1s ease infinite"} : {}) }}>{mm}:{ss}</span>
        </div>
      </div>

      <div style={{ padding: "0 18px 18px" }}>

        {/* ── QR Code ── */}
        <div style={$.qrSection}>
          <div style={$.qrOuter}>
            <div style={$.qrC("top","left")}/><div style={$.qrC("top","right")}/>
            <div style={$.qrC("bottom","left")}/><div style={$.qrC("bottom","right")}/>
            <QR size={185} />
          </div>
          <button className="ghost" style={$.saveBtn}>{Icons.download} <span>{t.saveQR}</span></button>
        </div>

        {/* ── UPI ID (conditional) ── */}
        {CONFIG.showUpiId && (
          <div style={$.upiBox}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={$.upiLabel}>{t.upiIdLabel}</div>
                <div style={$.upiValue}>{UPI_ID}</div>
              </div>
              <button className="ghost" onClick={doCopy} style={$.copyBtn}>
                {copied ? <><span style={{color:"#10b981",display:"flex"}}>{Icons.check}</span><span style={{color:"#10b981"}}>{t.copiedUPI}</span></> : <>{Icons.copy} {t.copyUPI}</>}
              </button>
            </div>
          </div>
        )}

        {/* ── App Buttons (conditional) ── */}
        {CONFIG.showApps && (
          <div style={{ marginTop: 14, marginBottom: 16 }}>
            <div style={$.secLabel}>{t.payVia}</div>
            <div style={$.appsList}>
              {APPS.map(a => (
                <button key={a.id} className="appbtn" style={$.appRow}>
                  <div style={{ ...$.appDot, background: a.bg }}>{a.letter}</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={$.appName}>{a.name}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{a.desc}</div>
                  </div>
                  <div style={$.appArrow}>›</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div style={$.divider} />

        {/* ── Auto-detect banner ── */}
        <div style={$.detectBanner}>
          <div style={{ animation: "spin 2s linear infinite", display: "flex", flexShrink: 0 }}>{Icons.loader}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: accent }}>{t.detecting}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.orManual}</div>
          </div>
        </div>

        {/* ── UTR Input ── */}
        <div style={{ marginBottom: 14 }}>
          <label style={$.inputLabel}>{t.utrLabel}</label>
          <div style={{ position: "relative" }}>
            <input type="text" inputMode="numeric" value={utr}
              onChange={e => onUtrChange(e.target.value)}
              placeholder={t.utrPlaceholder}
              style={{ ...$.input, borderColor: utrErr ? "#ef4444" : utr.length === 12 ? "#10b981" : "#e2e8f0",
                boxShadow: utrErr ? "0 0 0 3px rgba(239,68,68,.08)" : utr.length === 12 ? "0 0 0 3px rgba(16,185,129,.08)" : "none" }}
            />
            {utr.length === 12 && <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#10b981" }}>{Icons.check}</div>}
          </div>
          <div style={$.inputFooter}>
            {utrErr ? <span style={{ fontSize: 11, color: "#ef4444" }}>{utrErr}</span> : <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--mono)" }}>{utr.length}/12</span>}
            <button onClick={() => setShowUtrHelp(!showUtrHelp)} style={$.utrHintBtn}>{Icons.info} {t.utrHint}</button>
          </div>
        </div>

        {/* ── UTR Help (expandable) ── */}
        {showUtrHelp && (
          <div style={{ ...$.utrHelp, animation: "fadeUp .2s ease" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 10 }}>{t.utrTooltipTitle}</div>
            {t.utrTooltipSteps.map((s, i) => (
              <div key={i} style={$.howRow}>
                <div style={$.howNum}>{i + 1}</div>
                <span style={{ fontSize: 12, lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
            {/* Visual mock receipt */}
            <div style={$.mockWrap}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>
                {lang === "en" ? "Example from PhonePe:" : "PhonePe से उदाहरण:"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: "#64748b" }}><span>Payment Details</span><span>₹{AMT}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "3px 0", color: "#94a3b8" }}><span>Transaction ID</span><span style={{ fontFamily: "var(--mono)", fontSize: 10 }}>T250526141722...</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "4px 6px", margin: "2px -6px", background: "#ddd0f0", borderRadius: 6 }}>
                <span style={{ color: accent, fontWeight: 700 }}>UTR</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: accent }}>023098029266</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Warnings ── */}
        <div style={$.warnBox}>
          <div style={$.warnHeader}>{Icons.alert} <span>{t.noteTitle}</span></div>
          {t.notes.map((n, i) => (
            <div key={i} style={$.warnRow}><span style={{ color: "#d97706", flexShrink: 0 }}>•</span><span>{n}</span></div>
          ))}
        </div>

        {/* ── Submit ── */}
        <button onClick={onSubmit} disabled={submitting} style={{
          ...$.btnPrimary, marginTop: 16, opacity: submitting ? .7 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {submitting
            ? <><span style={{animation:"spin 1s linear infinite",display:"flex"}}>{Icons.loader}</span> {t.submitting}</>
            : <>{Icons.shield} {t.submit}</>
          }
        </button>
      </div>

      <Footer t={t} />
    </Shell>
  );
}

// ═══════════════════════════════════════════════
// SHELL — no brand, just lang switcher
// ═══════════════════════════════════════════════
function Shell({ children, lang, setLang }) {
  return (
    <div style={$.wrapper}>
      <style>{CSS}</style>
      <div style={$.card}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={$.topBar}>
            {CONFIG.merchantName ? <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{CONFIG.merchantName}</span> : <div />}
            <div style={$.langPill}>
              {["en","hi"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ ...$.langBtn, ...(lang === l ? $.langActive : {}) }}>
                  {l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Footer({ t }) {
  return (
    <div style={$.footer}>
      <div style={$.footerInner}>
        {Icons.lock} <span>{t.secure}</span>
        <span style={{ color: "#cbd5e1" }}>·</span>
        {Icons.shield} <span>{t.upiSafe}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
:root { --font: 'Outfit', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font); -webkit-font-smoothing: antialiased; }
@keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes popIn { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
@keyframes spin { to{transform:rotate(360deg)} }
.ghost:hover { background: #f1f5f9 !important; }
.ghost:active { transform: scale(.97); }
.appbtn { transition: all .18s cubic-bezier(.34,1.56,.64,1); }
.appbtn:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.07) !important; }
.appbtn:active { transform: scale(.95); }
input::placeholder { color: #cbd5e1; }
input:focus { border-color: ${accent} !important; box-shadow: 0 0 0 3px ${accent}14 !important; outline: none; }
`;

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const $ = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(170deg, #f6f2ff 0%, #f8f6fc 40%, #fff 100%)",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "16px 10px", fontFamily: "var(--font, 'Outfit', system-ui, sans-serif)",
  },
  card: {
    width: "100%", maxWidth: 400, background: "#fff", borderRadius: 18,
    boxShadow: `0 1px 3px rgba(0,0,0,.03), 0 6px 24px ${accent}0d`, overflow: "hidden",
  },
  topBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 18px 0",
  },
  langPill: { display: "flex", background: "#f1f5f9", borderRadius: 7, padding: 2 },
  langBtn: {
    border: "none", background: "transparent", padding: "3px 11px",
    borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer",
    color: "#94a3b8", fontFamily: "var(--font)", transition: ".15s ease",
  },
  langActive: { background: "#fff", color: accent, boxShadow: "0 1px 3px rgba(0,0,0,.06)" },

  // Amount
  amtBlock: { textAlign: "center", padding: "18px 18px 12px" },
  amtLabel: { fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: ".1em" },
  amtValue: { fontSize: 34, fontWeight: 800, color: "#0c1425", letterSpacing: "-.03em", margin: "4px 0 8px" },
  amtBadge: {
    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600,
    color: accent, background: "#f6f2ff", padding: "3px 10px", borderRadius: 20, border: "1px solid #ddd0f0",
  },

  // Timer
  timerWrap: { margin: "0 18px 16px", padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#faf8ff" },
  timerTrack: { height: 3, borderRadius: 2, background: "#e2e8f0", overflow: "hidden" },
  timerFill: { height: "100%", borderRadius: 2, transition: "width 1s linear" },
  timerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  timerLabel: { fontSize: 10, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 },
  timerDigits: { fontSize: 14, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: ".06em" },

  // QR
  qrSection: { display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 14px" },
  qrOuter: { position: "relative", padding: 16, background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0" },
  qrC: (v, h) => ({
    position: "absolute", width: 18, height: 18, [v]: -1, [h]: -1,
    [`border${v[0].toUpperCase()+v.slice(1)}`]: `3px solid ${accent}`,
    [`border${h[0].toUpperCase()+h.slice(1)}`]: `3px solid ${accent}`,
    borderRadius: `${v==="top"&&h==="left"?"6px":"0"} ${v==="top"&&h==="right"?"6px":"0"} ${v==="bottom"&&h==="right"?"6px":"0"} ${v==="bottom"&&h==="left"?"6px":"0"}`,
  }),
  saveBtn: {
    display: "flex", alignItems: "center", gap: 6, background: "transparent",
    border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px",
    fontSize: 12, fontWeight: 500, color: "#64748b", cursor: "pointer", marginTop: 10, fontFamily: "var(--font)",
  },

  // UPI ID
  upiBox: { padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9", marginTop: 10 },
  upiLabel: { fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 },
  upiValue: { fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", color: "#0c1425" },
  copyBtn: {
    display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8,
    background: "#f6f2ff", border: "1px solid #ddd0f0", fontSize: 11, fontWeight: 700,
    color: accent, cursor: "pointer", fontFamily: "var(--font)",
  },

  // Apps
  secLabel: { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 },
  appsList: { display: "flex", flexDirection: "column", gap: 6 },
  appRow: {
    display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px",
    borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9",
    cursor: "pointer", fontFamily: "var(--font)", transition: ".15s ease",
  },
  appDot: { width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800 },
  appName: { fontSize: 13, fontWeight: 600, color: "#334155" },
  appArrow: { fontSize: 18, fontWeight: 300, color: "#94a3b8", lineHeight: 1 },

  // Divider
  divider: { height: 1, background: "#f1f5f9", margin: "4px 0 14px" },

  // Detect
  detectBanner: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    background: "#f6f2ff", borderRadius: 10, marginBottom: 14, border: "1px solid #ddd0f0",
  },

  // UTR
  inputLabel: { fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 40px 12px 14px", borderRadius: 10,
    border: "2px solid #e2e8f0", fontSize: 15, fontWeight: 600,
    fontFamily: "var(--mono)", color: "#0c1425", outline: "none",
    transition: ".2s ease", letterSpacing: ".08em", background: "#faf8ff",
  },
  inputFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  utrHintBtn: {
    background: "none", border: "none", cursor: "pointer", display: "flex",
    alignItems: "center", gap: 4, fontSize: 11, color: accent, fontWeight: 600, fontFamily: "var(--font)",
  },
  utrHelp: {
    padding: "12px 14px", background: "#f6f2ff", borderRadius: 10,
    border: "1px solid #ddd0f0", marginBottom: 14, display: "flex", flexDirection: "column", gap: 8,
  },
  howRow: { display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#475569", lineHeight: 1.5 },
  howNum: {
    minWidth: 18, height: 18, borderRadius: "50%", background: "#ddd0f0", color: accent,
    fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  mockWrap: { marginTop: 8, padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" },

  // Warnings
  warnBox: { padding: "10px 12px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fef3c7" },
  warnHeader: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "#d97706", fontSize: 12, fontWeight: 700 },
  warnRow: { display: "flex", gap: 6, fontSize: 11, color: "#92400e", lineHeight: 1.5, marginBottom: 3 },

  // CTA
  btnPrimary: {
    width: "100%", padding: "13px 18px", borderRadius: 10, border: "none",
    background: `linear-gradient(135deg, ${accent}, #3D1560)`,
    color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "var(--font)", boxShadow: `0 2px 8px ${accent}33`, transition: ".15s ease",
  },

  // Footer
  footer: { textAlign: "center", padding: "12px 18px 16px", borderTop: "1px solid #f1f5f9" },
  footerInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, fontWeight: 500, color: "#94a3b8" },
};
