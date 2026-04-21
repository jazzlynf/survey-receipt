import { useState, useRef, useEffect } from "react";

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  bg: "#07080f", card: "#0e1120", border: "#1a2040",
  text: "#eef0f8", muted: "#8896b0", soft: "#c0cce8",
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const PERIODS = ["Mo", "Qtr", "Yr"];
const MULT = { Mo: 1, Qtr: 3, Yr: 12 };

const CATEGORIES = [
  {
    name: "Groceries", icon: "🛒", color: "#34d399", pct: 22,
    baseMo: 380,
    insight: "You buy matcha at 3 stores — making it home costs 8× less than Starbucks.",
    subs: [
      { name: "Protein", icon: "💪", pct: 32, color: "#34d399",
        items: [
          { name: "Organic Chicken", merchants: [{n:"Whole Foods",pct:55,ps:"$2.37"},{n:"Target",pct:30,ps:"$1.67"},{n:"Walmart",pct:15,ps:"$1.20"}], health:"good", insight:"Walmart has the best price/serving for chicken." },
          { name: "Greek Yogurt",    merchants: [{n:"Whole Foods",pct:60,ps:"$0.62"},{n:"Target",pct:40,ps:"$0.55"}], health:"good", insight:"Target Greek Yogurt saves you $0.07/serving." },
          { name: "Protein Bars",   merchants: [{n:"Target",pct:55,ps:"$1.67"},{n:"Whole Foods",pct:45,ps:"$2.50"}], health:"good", insight:"Stick with Target — same bar, $0.83 cheaper." },
        ]},
      { name: "Produce", icon: "🥦", pct: 25, color: "#6ee7b7",
        items: [
          { name: "Baby Spinach",   merchants: [{n:"Whole Foods",pct:70,ps:"$0.40"},{n:"Walmart",pct:30,ps:"$0.28"}], health:"good", insight:"Walmart spinach is 30% cheaper with same quality." },
          { name: "Avocados",       merchants: [{n:"Whole Foods",pct:50,ps:"$1.50"},{n:"Target",pct:30,ps:"$1.20"},{n:"Walmart",pct:20,ps:"$0.88"}], health:"good", insight:"You overpay at Whole Foods — Walmart avocados are fine." },
        ]},
      { name: "Snacks",  icon: "🍿", pct: 23, color: "#fbbf24",
        items: [
          { name: "Matcha Powder",  merchants: [{n:"Whole Foods",pct:35,ps:"$0.80"},{n:"Target",pct:30,ps:"$1.20"},{n:"Starbucks",pct:35,ps:"$6.50"}], health:"good", insight:"⚠️ 35% of your matcha spend is at Starbucks at 8× the home cost." },
          { name: "Doritos",        merchants: [{n:"Target",pct:60,ps:"$0.83"},{n:"Walmart",pct:40,ps:"$0.70"}], health:"bad", insight:"68% of your snacks are ultra-processed this month." },
          { name: "Kind Bars",      merchants: [{n:"Whole Foods",pct:55,ps:"$1.25"},{n:"Target",pct:45,ps:"$1.10"}], health:"neutral", insight:"Target Kind Bars are slightly cheaper — easy swap." },
        ]},
      { name: "Beverages", icon: "🥤", pct: 12, color: "#a7f3d0",
        items: [
          { name: "Sparkling Water", merchants: [{n:"Target",pct:60,ps:"$0.42"},{n:"Whole Foods",pct:40,ps:"$0.58"}], health:"good", insight:"Target is your best deal on sparkling water." },
          { name: "Oat Milk",        merchants: [{n:"Whole Foods",pct:65,ps:"$0.28"},{n:"Target",pct:35,ps:"$0.22"}], health:"good", insight:"Target oat milk saves $0.06/serving — small but it adds up." },
        ]},
      { name: "Frozen",  icon: "🧊", pct: 8, color: "#d1fae5",
        items: [
          { name: "Amy's Burritos", merchants: [{n:"Whole Foods",pct:60,ps:"$2.50"},{n:"Target",pct:40,ps:"$2.20"}], health:"neutral", insight:"Target is cheaper but both fine." },
        ]},
    ],
  },
  {
    name: "Restaurants", icon: "🍽️", color: "#fb923c", pct: 18,
    baseMo: 310,
    insight: "Cooking your 6 most-ordered Chipotle meals at home costs $40 vs $156/mo.",
    subs: [
      { name: "Fast Food", icon: "🍔", pct: 38, color: "#fb923c",
        items: [
          { name: "Big Mac Meal",      merchants: [{n:"McDonald's",pct:100,ps:"$11.49/meal"}], health:"bad", insight:"4 late-night McDonald's visits this month — 3 after 10pm." },
          { name: "Chicken Sandwich",  merchants: [{n:"Chick-fil-A",pct:100,ps:"$8.99/meal"}], health:"neutral", insight:"Chick-fil-A is your healthiest fast food option." },
        ]},
      { name: "Casual Dining", icon: "🌯", pct: 35, color: "#fdba74",
        items: [
          { name: "Burrito Bowl",   merchants: [{n:"Chipotle",pct:100,ps:"$12.50/meal"}], health:"neutral", insight:"You've ordered this 6× — most repeated meal. One-tap reorder ready." },
          { name: "Pad Thai",       merchants: [{n:"Local Thai",pct:100,ps:"$15.00/meal"}], health:"neutral", insight:"Weekly habit — $60/mo on this one dish." },
        ]},
      { name: "Coffee", icon: "☕", pct: 18, color: "#fed7aa",
        items: [
          { name: "Matcha Oat Latte", merchants: [{n:"Starbucks",pct:70,ps:"$6.50"},{n:"Local Café",pct:30,ps:"$5.00"}], health:"neutral", insight:"Your coffee spend is up 34% over 3 months." },
          { name: "Iced Americano",   merchants: [{n:"Starbucks",pct:100,ps:"$5.25"}], health:"neutral", insight:"8 Americanos this month = $42 just on this drink." },
        ]},
      { name: "Delivery", icon: "📦", pct: 9, color: "#ffedd5",
        items: [
          { name: "DoorDash Fees", merchants: [{n:"DoorDash",pct:100,ps:"$4-8/order"}], health:"bad", insight:"You paid $38 in delivery fees this month — eating in saves that instantly." },
        ]},
    ],
  },
  {
    name: "Entertainment", icon: "🎬", color: "#a78bfa", pct: 10,
    baseMo: 172,
    insight: "You're paying for 4 streaming services — 2 overlap in content by 60%.",
    subs: [
      { name: "Streaming", icon: "📺", pct: 45, color: "#a78bfa",
        items: [
          { name: "Netflix",  merchants: [{n:"Netflix",pct:100,ps:"$15.49/mo"}], health:"neutral", insight:"Most-watched streaming service. Worth keeping." },
          { name: "Hulu",     merchants: [{n:"Hulu",pct:100,ps:"$17.99/mo"}], health:"neutral", insight:"60% content overlap with Netflix — consider pausing." },
          { name: "Disney+",  merchants: [{n:"Disney+",pct:100,ps:"$13.99/mo"}], health:"neutral", insight:"Low usage this month — 2 sessions total." },
          { name: "Spotify",  merchants: [{n:"Spotify",pct:100,ps:"$10.99/mo"}], health:"good", insight:"Daily use — best value subscription you have." },
        ]},
      { name: "Events", icon: "🎟️", pct: 30, color: "#c4b5fd",
        items: [
          { name: "Concert Tickets",  merchants: [{n:"Ticketmaster",pct:70,ps:"$85/ticket"},{n:"StubHub",pct:30,ps:"$110/ticket"}], health:"good", insight:"Ticketmaster is consistently cheaper for your events." },
          { name: "Movie Tickets",    merchants: [{n:"AMC",pct:100,ps:"$18/ticket"}], health:"good", insight:"AMC A-List would break even at 3 movies/mo — you average 2.5." },
        ]},
      { name: "Gaming", icon: "🎮", pct: 15, color: "#ddd6fe",
        items: [
          { name: "Xbox Game Pass", merchants: [{n:"Microsoft",pct:100,ps:"$14.99/mo"}], health:"neutral", insight:"High usage — 3.5hrs/day average. Solid value." },
        ]},
      { name: "Books & Apps", icon: "📚", pct: 10, color: "#ede9fe",
        items: [
          { name: "Audible",       merchants: [{n:"Amazon",pct:100,ps:"$14.95/mo"}], health:"good", insight:"1 book/mo — you're using exactly what you pay for." },
          { name: "App Purchases", merchants: [{n:"Apple",pct:60,ps:"varies"},{n:"Google",pct:40,ps:"varies"}], health:"neutral", insight:"$23 in miscellaneous app purchases this month." },
        ]},
    ],
  },
  {
    name: "Travel", icon: "✈️", color: "#38bdf8", pct: 12,
    baseMo: 207,
    insight: "You spent $840 on 2 trips this quarter. Booking 3 weeks early saves avg 23%.",
    subs: [
      { name: "Flights", icon: "✈️", pct: 48, color: "#38bdf8",
        items: [
          { name: "NYC → Miami",  merchants: [{n:"Delta",pct:60,ps:"$189"},{n:"JetBlue",pct:40,ps:"$149"}], health:"neutral", insight:"JetBlue was $40 cheaper for this route — set a price alert." },
          { name: "NYC → LA",    merchants: [{n:"United",pct:100,ps:"$312"}], health:"neutral", insight:"Booking this 3 weeks earlier saves avg $71 on this route." },
        ]},
      { name: "Hotels", icon: "🏨", pct: 30, color: "#7dd3fc",
        items: [
          { name: "Marriott Miami",  merchants: [{n:"Marriott Direct",pct:50,ps:"$189/night"},{n:"Booking.com",pct:50,ps:"$162/night"}], health:"neutral", insight:"Booking.com saved $27/night on this exact hotel last trip." },
        ]},
      { name: "Rideshare", icon: "🚕", pct: 14, color: "#bae6fd",
        items: [
          { name: "Airport Rides",  merchants: [{n:"Uber",pct:55,ps:"$38 avg"},{n:"Lyft",pct:45,ps:"$34 avg"}], health:"neutral", insight:"Lyft is consistently $4 cheaper for airport trips." },
        ]},
      { name: "Activities", icon: "🎡", pct: 8, color: "#e0f2fe",
        items: [
          { name: "Tours & Experiences", merchants: [{n:"Airbnb Exp.",pct:60,ps:"varies"},{n:"Viator",pct:40,ps:"varies"}], health:"good", insight:"You average $65/trip on activities — healthy travel spend." },
        ]},
    ],
  },
  {
    name: "Fitness", icon: "🏋️", color: "#f472b6", pct: 8,
    baseMo: 138,
    insight: "Your supplement spend is $89/mo — 3 overlap in ingredients. You could cut to 2.",
    subs: [
      { name: "Gym & Classes", icon: "🏋️", pct: 42, color: "#f472b6",
        items: [
          { name: "Equinox",       merchants: [{n:"Equinox",pct:100,ps:"$58/mo"}], health:"good", insight:"You go 3.2×/week — well above the break-even of 1.5×." },
          { name: "SoulCycle",     merchants: [{n:"SoulCycle",pct:100,ps:"$36/class"}], health:"good", insight:"2 classes/mo = $72. Consider a class pack for 20% savings." },
        ]},
      { name: "Supplements", icon: "💊", pct: 35, color: "#f9a8d4",
        items: [
          { name: "Whey Protein",  merchants: [{n:"Amazon",pct:55,ps:"$1.20/serving"},{n:"GNC",pct:45,ps:"$1.65/serving"}], health:"good", insight:"Amazon is 27% cheaper for the same protein powder." },
          { name: "Creatine",      merchants: [{n:"Amazon",pct:100,ps:"$0.18/serving"}], health:"good", insight:"Best value supplement you buy — keep it." },
          { name: "Pre-workout",   merchants: [{n:"GNC",pct:60,ps:"$1.80/serving"},{n:"Amazon",pct:40,ps:"$1.40/serving"}], health:"neutral", insight:"Overlaps 60% with your protein — consider dropping one." },
        ]},
      { name: "Equipment", icon: "🎽", pct: 15, color: "#fbcfe8",
        items: [
          { name: "Athletic Wear", merchants: [{n:"Nike",pct:50,ps:"varies"},{n:"Lululemon",pct:30,ps:"varies"},{n:"Target",pct:20,ps:"varies"}], health:"neutral", insight:"Target athletic wear is 60% cheaper with similar reviews." },
        ]},
      { name: "Apps & Plans", icon: "📱", pct: 8, color: "#fce7f3",
        items: [
          { name: "MyFitnessPal",  merchants: [{n:"Under Armour",pct:100,ps:"$9.99/mo"}], health:"good", insight:"Daily check-ins — you're getting full value from this." },
        ]},
    ],
  },
  {
    name: "Apparel", icon: "👗", color: "#fbbf24", pct: 9,
    baseMo: 155,
    insight: "You bought similar items at Nike & Lululemon — Target has the same rated gear for 60% less.",
    subs: [
      { name: "Clothing", icon: "👕", pct: 52, color: "#fbbf24",
        items: [
          { name: "T-Shirts",     merchants: [{n:"Target",pct:40,ps:"$12"},{n:"H&M",pct:35,ps:"$18"},{n:"Uniqlo",pct:25,ps:"$15"}], health:"neutral", insight:"Target and Uniqlo have the best quality/price ratio in your purchase history." },
          { name: "Jeans",        merchants: [{n:"Levi's",pct:60,ps:"$59"},{n:"Target",pct:40,ps:"$29"}], health:"neutral", insight:"You rated both the same on return likelihood. Target saves $30/pair." },
        ]},
      { name: "Shoes", icon: "👟", pct: 30, color: "#fde68a",
        items: [
          { name: "Running Shoes", merchants: [{n:"Nike",pct:55,ps:"$130"},{n:"New Balance",pct:45,ps:"$95"}], health:"good", insight:"New Balance has similar ratings and saves $35/pair." },
        ]},
      { name: "Accessories", icon: "👜", pct: 18, color: "#fef3c7",
        items: [
          { name: "Bags & Wallets", merchants: [{n:"Amazon",pct:50,ps:"varies"},{n:"Coach",pct:50,ps:"varies"}], health:"neutral", insight:"Mixed spend — Amazon for basics, Coach for investment pieces." },
        ]},
    ],
  },
  {
    name: "Transport", icon: "🚗", color: "#60a5fa", pct: 9,
    baseMo: 155,
    insight: "Lyft is $4 cheaper than Uber for airport trips — you took Uber 6 times this month.",
    subs: [
      { name: "Rideshare", icon: "🚕", pct: 45, color: "#60a5fa",
        items: [
          { name: "Uber Trips",  merchants: [{n:"Uber",pct:60,ps:"$18 avg"},{n:"Lyft",pct:40,ps:"$14 avg"}], health:"neutral", insight:"Switching to Lyft for your regular trips saves $24/mo." },
        ]},
      { name: "Gas", icon: "⛽", pct: 30, color: "#93c5fd",
        items: [
          { name: "Shell",  merchants: [{n:"Shell",pct:55,ps:"$3.89/gal"},{n:"BP",pct:45,ps:"$3.75/gal"}], health:"neutral", insight:"BP near your apartment is $0.14/gal cheaper than your usual Shell." },
        ]},
      { name: "Parking", icon: "🅿️", pct: 15, color: "#bfdbfe",
        items: [
          { name: "Monthly Garage", merchants: [{n:"SpotHero",pct:100,ps:"$185/mo"}], health:"neutral", insight:"SpotHero has a $165/mo option 2 blocks away." },
        ]},
      { name: "Transit", icon: "🚇", pct: 10, color: "#dbeafe",
        items: [
          { name: "MetroCard",  merchants: [{n:"MTA",pct:100,ps:"$2.90/ride"}], health:"good", insight:"34 subway rides this month — great for your budget vs rideshare." },
        ]},
    ],
  },
  {
    name: "Utilities", icon: "⚡", color: "#e879f9", pct: 7,
    baseMo: 120,
    insight: "Your electric bill is 18% above average for your apartment size in NYC.",
    subs: [
      { name: "Electric", icon: "💡", pct: 42, color: "#e879f9",
        items: [
          { name: "Con Edison",  merchants: [{n:"Con Edison",pct:100,ps:"$94/mo"}], health:"neutral", insight:"18% above avg for your area. Check if AC is running overnight." },
        ]},
      { name: "Internet", icon: "📡", pct: 30, color: "#f0abfc",
        items: [
          { name: "Spectrum",  merchants: [{n:"Spectrum",pct:100,ps:"$49.99/mo"}], health:"good", insight:"Promotional rate ends in 2 months — negotiate before it jumps to $79." },
        ]},
      { name: "Phone", icon: "📱", pct: 18, color: "#f5d0fe",
        items: [
          { name: "T-Mobile",  merchants: [{n:"T-Mobile",pct:100,ps:"$65/mo"}], health:"neutral", insight:"Mint Mobile offers same coverage for $30/mo — worth comparing." },
        ]},
      { name: "Subscriptions", icon: "🔁", pct: 10, color: "#fae8ff",
        items: [
          { name: "iCloud / Google One", merchants: [{n:"Apple",pct:60,ps:"$2.99/mo"},{n:"Google",pct:40,ps:"$1.99/mo"}], health:"neutral", insight:"You're paying for both — 1 is enough for your storage needs." },
        ]},
    ],
  },
];

// ─── PIE CHART ───────────────────────────────────────────────────────────────
function PieChart({ data, onSlice, active, period, onPeriod }) {
  const SIZE = 260, CX = 130, CY = 130, R = 108, IR = 62;
  let cum = -Math.PI / 2;
  const total = data.reduce((s, d) => s + d.pct, 0);

  const slices = data.map(d => {
    const angle = (d.pct / total) * 2 * Math.PI;
    const s = cum; cum += angle;
    const e = cum;
    const large = angle > Math.PI ? 1 : 0;
    const cos = (a, rr) => CX + rr * Math.cos(a);
    const sin = (a, rr) => CY + rr * Math.sin(a);
    const path = `M${cos(s,IR)} ${sin(s,IR)} L${cos(s,R)} ${sin(s,R)} A${R} ${R} 0 ${large} 1 ${cos(e,R)} ${sin(e,R)} L${cos(e,IR)} ${sin(e,IR)} A${IR} ${IR} 0 ${large} 0 ${cos(s,IR)} ${sin(s,IR)}Z`;
    const mid = s + angle / 2;
    const lx = CX + (R + 14) * Math.cos(mid);
    const ly = CY + (R + 14) * Math.sin(mid);
    return { ...d, path, mid, angle, lx, ly };
  });

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, margin: "0 auto" }}>
      <svg width={SIZE} height={SIZE} style={{ overflow: "visible" }}>
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {slices.map(s => {
          const isSel = active === s.name;
          return (
            <g key={s.name} onClick={() => onSlice(s.name)} style={{ cursor: "pointer" }}>
              <path d={s.path} fill={s.color}
                opacity={active && !isSel ? 0.28 : 1}
                stroke={isSel ? "#fff" : "rgba(0,0,0,0.2)"}
                strokeWidth={isSel ? 2 : 0.5}
                filter={isSel ? "url(#glow)" : ""}
                style={{ transition: "all 0.25s" }} />
              {s.angle > 0.38 && (
                <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                  fontSize="9.5" fontWeight="800" fill="rgba(255,255,255,0.9)"
                  style={{ pointerEvents: "none" }}>
                  {s.icon}
                </text>
              )}
            </g>
          );
        })}
        {/* inner circle */}
        <circle cx={CX} cy={CY} r={IR - 2} fill={C.bg} />
      </svg>

      {/* Period toggle inside pie */}
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", textAlign: "center", userSelect: "none" }}>
        <div style={{ display: "flex", gap: "3px", justifyContent: "center", marginBottom: "5px" }}>
          {PERIODS.map(p => (
            <button key={p} onClick={e => { e.stopPropagation(); onPeriod(p); }}
              style={{ background: period === p ? "#fff" : "transparent",
                border: period === p ? "none" : "1px solid #2a3060",
                color: period === p ? C.bg : C.muted,
                fontSize: "9px", fontWeight: "800", padding: "2px 6px",
                borderRadius: "6px", cursor: "pointer", fontFamily: "'Space Mono', monospace",
                transition: "all 0.15s" }}>
              {p}
            </button>
          ))}
        </div>
        {active ? (
          <>
            <div style={{ fontSize: "10px", color: C.muted, marginBottom: "1px" }}>{active}</div>
            <div style={{ fontSize: "19px", fontWeight: "800", color: "#fff",
              fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
              ${Math.round((CATEGORIES.find(c=>c.name===active)?.baseMo||0) * MULT[period]).toLocaleString()}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "10px", color: C.muted, marginBottom: "1px" }}>total spend</div>
            <div style={{ fontSize: "19px", fontWeight: "800", color: "#fff",
              fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
              ${Math.round(CATEGORIES.reduce((a,c)=>a+c.baseMo,0) * MULT[period]).toLocaleString()}
            </div>
          </>
        )}
        {active && (
          <button onClick={e => { e.stopPropagation(); onSlice(null); }}
            style={{ marginTop: "4px", background: "transparent", border: "none",
              color: C.muted, fontSize: "9px", cursor: "pointer" }}>✕ clear</button>
        )}
      </div>
    </div>
  );
}

// ─── SO WHAT BAR ────────────────────────────────────────────────────────────
function SoWhatBar({ text, color }) {
  return (
    <div style={{ background: color + "14", border: `1px solid ${color}35`,
      borderRadius: "12px", padding: "11px 14px", marginBottom: "16px",
      display: "flex", gap: "8px", alignItems: "flex-start" }}>
      <span style={{ fontSize: "14px", flexShrink: 0 }}>💡</span>
      <p style={{ fontSize: "12px", color: "#c8d0e8", lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

// ─── LEGEND ─────────────────────────────────────────────────────────────────
function Legend({ cats, active, onSelect, period }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {cats.map(c => {
        const spend = Math.round(c.baseMo * MULT[period]);
        const isSel = active === c.name;
        return (
          <button key={c.name} onClick={() => onSelect(c.name)}
            style={{ display: "flex", alignItems: "center", gap: "9px",
              padding: "7px 10px", borderRadius: "10px", cursor: "pointer", textAlign: "left",
              background: isSel ? c.color + "18" : "transparent",
              border: isSel ? `1px solid ${c.color}40` : "1px solid transparent",
              transition: "all 0.2s" }}>
            <div style={{ width: 10, height: 10, borderRadius: "3px", background: c.color, flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: isSel ? "#eef0f8" : C.soft, flex: 1 }}>
              {c.icon} {c.name}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: isSel ? c.color : C.muted,
              fontFamily: "'Space Mono', monospace" }}>${spend.toLocaleString()}</span>
            <span style={{ fontSize: "10px", color: C.muted }}>{c.pct}%</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── SUBCATEGORY VIEW ───────────────────────────────────────────────────────
function SubView({ cat, period, onSub, activeSub }) {
  const spend = Math.round(cat.baseMo * MULT[period]);
  return (
    <div style={{ animation: "fadeUp 0.28s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <span style={{ fontSize: "22px" }}>{cat.icon}</span>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: cat.color,
            fontFamily: "'Syne', sans-serif" }}>{cat.name}</h3>
          <p style={{ fontSize: "11px", color: C.muted }}>
            ${spend.toLocaleString()} · tap a sub-category for item breakdown
          </p>
        </div>
      </div>
      <SoWhatBar text={cat.insight} color={cat.color} />
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {cat.subs.map(s => {
          const subSpend = Math.round(spend * s.pct / 100);
          const isSel = activeSub === s.name;
          return (
            <button key={s.name} onClick={() => onSub(isSel ? null : s.name)}
              style={{ display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "12px", cursor: "pointer", textAlign: "left",
                background: isSel ? s.color + "18" : "rgba(255,255,255,0.02)",
                border: isSel ? `1px solid ${s.color}44` : `1px solid ${C.border}`,
                transition: "all 0.2s" }}>
              <span style={{ fontSize: "18px" }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: isSel ? "#eef0f8" : C.soft }}>{s.name}</div>
                <div style={{ background: C.border, borderRadius: "3px", height: "4px", marginTop: "5px", width: "100%" }}>
                  <div style={{ height: "4px", borderRadius: "3px", background: s.color,
                    width: `${s.pct}%`, transition: "width 0.6s ease" }} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: isSel ? s.color : C.muted,
                  fontFamily: "'Space Mono', monospace" }}>${subSpend.toLocaleString()}</div>
                <div style={{ fontSize: "10px", color: C.muted }}>{s.pct}%</div>
              </div>
              <span style={{ color: isSel ? s.color : C.muted, fontSize: "12px" }}>{isSel ? "▾" : "›"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── ITEM VIEW ───────────────────────────────────────────────────────────────
function ItemView({ sub, catColor, period, onBack }) {
  const subSpend = 120 * MULT[period]; // approximate
  return (
    <div style={{ animation: "fadeUp 0.28s ease" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none",
        color: C.muted, fontSize: "12px", cursor: "pointer", marginBottom: "12px",
        display: "flex", alignItems: "center", gap: "5px" }}>
        ← back to subcategories
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <span style={{ fontSize: "20px" }}>{sub.icon}</span>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: sub.color,
          fontFamily: "'Syne', sans-serif" }}>{sub.name}</h3>
      </div>

      {sub.items.map((item, idx) => (
        <div key={idx} style={{ background: "rgba(255,255,255,0.02)",
          border: `1px solid ${C.border}`, borderRadius: "14px",
          padding: "14px", marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#eef0f8" }}>{item.name}</div>
              <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "10px", fontWeight: "700",
                  background: item.health === "good" ? "#34d39922" : item.health === "bad" ? "#ef444422" : "#fbbf2422",
                  color: item.health === "good" ? "#34d399" : item.health === "bad" ? "#ef4444" : "#fbbf24" }}>
                  {item.health === "good" ? "✓ healthy" : item.health === "bad" ? "⚠ junk" : "~ neutral"}
                </span>
              </div>
            </div>
          </div>

          {/* Merchant bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
            {item.merchants.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 80, fontSize: "10px", color: C.soft, flexShrink: 0 }}>{m.n}</div>
                <div style={{ flex: 1, background: C.border, borderRadius: "3px", height: "6px" }}>
                  <div style={{ height: "6px", borderRadius: "3px", background: sub.color,
                    width: `${m.pct}%`, opacity: 1 - i * 0.2, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ width: 36, textAlign: "right", fontSize: "10px",
                  color: C.muted, fontFamily: "'Space Mono', monospace" }}>{m.pct}%</div>
                <div style={{ width: 54, textAlign: "right", fontSize: "10px",
                  color: i === 0 ? "#34d399" : C.muted, fontFamily: "'Space Mono', monospace" }}>
                  {m.ps}
                  {i === 0 && <span style={{ fontSize: "8px", color: "#34d399" }}> ★</span>}
                </div>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div style={{ background: sub.color + "10", border: `1px solid ${sub.color}25`,
            borderRadius: "10px", padding: "9px 11px", display: "flex", gap: "7px" }}>
            <span style={{ fontSize: "12px", flexShrink: 0 }}>🤖</span>
            <p style={{ fontSize: "11px", color: "#8892b0", lineHeight: 1.6, margin: 0 }}>{item.insight}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VAULT DATA ──────────────────────────────────────────────────────────────
const BASE_RECEIPTS = [
  {
    merchant: "Whole Foods", icon: "🌿", color: "#34d399", baseMo: 312,
    months: {
      "Apr '25": [
        { id:"wf-apr1", dateLabel:"Thu Apr 17, 2025", total:87.43, source:"email", items:[{name:"Organic Chicken Breast",qty:2,price:18.98},{name:"Baby Spinach (5oz)",qty:1,price:3.99},{name:"Matcha Powder 365",qty:1,price:8.99},{name:"Greek Yogurt (4pk)",qty:1,price:9.96},{name:"Oat Milk (2)",qty:2,price:8.98},{name:"Kind Bars 12pk",qty:1,price:14.99},{name:"Avocados (3)",qty:1,price:5.97}], warranty:null, returnBy:null },
        { id:"wf-apr2", dateLabel:"Sat Apr 12, 2025", total:64.21, source:"qr",   items:[{name:"Organic Chicken Breast",qty:1,price:9.49},{name:"Sparkling Water 12pk",qty:1,price:6.99},{name:"Lay's Chips",qty:2,price:8.58},{name:"Amy's Burrito (2)",qty:2,price:9.98},{name:"Baby Spinach",qty:1,price:3.99}], warranty:null, returnBy:"Apr 28", returnItem:"Kind Bars (damaged box)" },
        { id:"wf-apr3", dateLabel:"Mon Apr 7, 2025",  total:71.18, source:"email", items:[{name:"Greek Yogurt (4pk)",qty:2,price:19.92},{name:"Protein Bars 12pk",qty:1,price:14.99},{name:"Oat Milk",qty:1,price:4.49},{name:"Matcha Powder 365",qty:1,price:8.99}], warranty:{item:"Vitamix Blender",expires:"Aug 14 2026",days:117}, returnBy:null },
      ],
      "Mar '25": [
        { id:"wf-mar1", dateLabel:"Wed Mar 19, 2025", total:92.10, source:"email", items:[{name:"Organic Chicken Breast",qty:2,price:18.98},{name:"Oat Milk (2)",qty:2,price:8.98},{name:"Matcha Powder 365",qty:1,price:8.99},{name:"Greek Yogurt (4pk)",qty:2,price:19.92}], warranty:null, returnBy:null },
        { id:"wf-mar2", dateLabel:"Sat Mar 8, 2025",  total:58.44, source:"qr",   items:[{name:"Baby Spinach",qty:2,price:7.98},{name:"Avocados (3)",qty:1,price:5.97},{name:"Sparkling Water",qty:1,price:6.99},{name:"Kind Bars 12pk",qty:1,price:14.99}], warranty:null, returnBy:null },
      ],
      "Feb '25": [
        { id:"wf-feb1", dateLabel:"Fri Feb 21, 2025", total:76.33, source:"email", items:[{name:"Organic Chicken Breast",qty:3,price:28.47},{name:"Greek Yogurt (4pk)",qty:1,price:9.96},{name:"Matcha Powder 365",qty:1,price:8.99},{name:"Oat Milk",qty:2,price:8.98}], warranty:null, returnBy:null },
      ],
      "Jan '25": [
        { id:"wf-jan1", dateLabel:"Thu Jan 16, 2025", total:83.20, source:"email", items:[{name:"Organic Chicken Breast",qty:2,price:18.98},{name:"Protein Bars 12pk",qty:1,price:14.99},{name:"Matcha Powder 365",qty:2,price:17.98},{name:"Greek Yogurt (4pk)",qty:1,price:9.96}], warranty:null, returnBy:null },
      ],
    }
  },
  {
    merchant: "Target", icon: "🎯", color: "#f472b6", baseMo: 248,
    months: {
      "Apr '25": [
        { id:"tg-apr1", dateLabel:"Mon Apr 14, 2025", total:52.17, source:"qr",   items:[{name:"Protein Bars Good&Gather",qty:1,price:9.99},{name:"Doritos Nacho",qty:2,price:9.98},{name:"Sparkling Water 12pk",qty:1,price:5.99},{name:"Matcha Latte Mix",qty:1,price:12.99},{name:"Oreos",qty:1,price:4.49}], warranty:{item:"Beats Headphones",expires:"Jun 1 2026",days:43}, returnBy:null },
        { id:"tg-apr2", dateLabel:"Sat Apr 5, 2025",  total:89.44, source:"email", items:[{name:"Chicken Thighs (3lb)",qty:1,price:6.49},{name:"Doritos (2pk)",qty:2,price:9.98},{name:"Instant Pot (6qt)",qty:1,price:59.99},{name:"Sparkling Water",qty:1,price:5.99}], warranty:{item:"Instant Pot",expires:"Jan 20 2027",days:276}, returnBy:null },
      ],
      "Mar '25": [
        { id:"tg-mar1", dateLabel:"Sun Mar 23, 2025", total:47.82, source:"qr",   items:[{name:"Protein Bars Good&Gather",qty:2,price:19.98},{name:"Sparkling Water 12pk",qty:1,price:5.99},{name:"Oreos",qty:2,price:8.98}], warranty:null, returnBy:null },
      ],
      "Feb '25": [
        { id:"tg-feb1", dateLabel:"Sat Feb 15, 2025", total:61.20, source:"email", items:[{name:"Chicken Thighs (3lb)",qty:2,price:12.98},{name:"Doritos Nacho",qty:2,price:9.98},{name:"Matcha Latte Mix",qty:2,price:25.98}], warranty:null, returnBy:null },
      ],
      "Jan '25": [
        { id:"tg-jan1", dateLabel:"Wed Jan 8, 2025",  total:44.90, source:"email", items:[{name:"Protein Bars Good&Gather",qty:1,price:9.99},{name:"Sparkling Water 12pk",qty:2,price:11.98},{name:"Doritos Nacho",qty:1,price:4.99}], warranty:null, returnBy:null },
      ],
    }
  },
  {
    merchant: "Starbucks", icon: "☕", color: "#fbbf24", baseMo: 127,
    months: {
      "Apr '25": [
        { id:"sb-apr1", dateLabel:"Fri Apr 18, 2025", total:13.50, source:"email", items:[{name:"Matcha Oat Latte Venti",qty:1,price:7.25},{name:"Iced Americano Grande",qty:1,price:5.25}], warranty:null, returnBy:null },
        { id:"sb-apr2", dateLabel:"Tue Apr 15, 2025", total:18.70, source:"email", items:[{name:"Matcha Oat Latte Venti",qty:1,price:7.25},{name:"Protein Box",qty:1,price:9.45},{name:"Pumpkin Loaf",qty:1,price:4.25}], warranty:null, returnBy:null },
      ],
      "Mar '25": [
        { id:"sb-mar1", dateLabel:"Mon Mar 17, 2025", total:14.50, source:"email", items:[{name:"Matcha Oat Latte Venti",qty:1,price:7.25},{name:"Iced Americano",qty:1,price:5.25}], warranty:null, returnBy:null },
      ],
      "Feb '25": [
        { id:"sb-feb1", dateLabel:"Thu Feb 6, 2025",  total:21.95, source:"email", items:[{name:"Matcha Oat Latte Venti",qty:2,price:14.50},{name:"Protein Box",qty:1,price:9.45}], warranty:null, returnBy:null },
      ],
      "Jan '25": [
        { id:"sb-jan1", dateLabel:"Fri Jan 24, 2025", total:12.75, source:"email", items:[{name:"Iced Americano Grande",qty:1,price:5.25},{name:"Matcha Oat Latte",qty:1,price:7.25}], warranty:null, returnBy:null },
      ],
    }
  },
  {
    merchant: "Chipotle", icon: "🌯", color: "#fb923c", baseMo: 156,
    months: {
      "Apr '25": [
        { id:"ch-apr1", dateLabel:"Wed Apr 16, 2025", total:16.85, source:"email", items:[{name:"Chicken Burrito Bowl",qty:1,price:12.50},{name:"Chips & Guac",qty:1,price:4.35}], warranty:null, returnBy:null },
        { id:"ch-apr2", dateLabel:"Wed Apr 9, 2025",  total:25.75, source:"email", items:[{name:"Chicken Burrito Bowl",qty:2,price:25.00},{name:"Chips & Guac",qty:1,price:4.35}], warranty:null, returnBy:null },
      ],
      "Mar '25": [
        { id:"ch-mar1", dateLabel:"Fri Mar 28, 2025", total:16.85, source:"email", items:[{name:"Chicken Burrito Bowl",qty:1,price:12.50},{name:"Chips & Guac",qty:1,price:4.35}], warranty:null, returnBy:null },
        { id:"ch-mar2", dateLabel:"Mon Mar 10, 2025", total:12.50, source:"email", items:[{name:"Barbacoa Burrito Bowl",qty:1,price:12.50}], warranty:null, returnBy:null },
      ],
      "Feb '25": [
        { id:"ch-feb1", dateLabel:"Sat Feb 22, 2025", total:29.35, source:"email", items:[{name:"Chicken Burrito Bowl",qty:2,price:25.00},{name:"Chips & Guac",qty:1,price:4.35}], warranty:null, returnBy:null },
      ],
      "Jan '25": [
        { id:"ch-jan1", dateLabel:"Thu Jan 30, 2025", total:16.85, source:"email", items:[{name:"Chicken Burrito Bowl",qty:1,price:12.50},{name:"Chips & Guac",qty:1,price:4.35}], warranty:null, returnBy:null },
      ],
    }
  },
  {
    merchant: "McDonald's", icon: "🍔", color: "#ef4444", baseMo: 89,
    months: {
      "Apr '25": [
        { id:"mc-apr1", dateLabel:"Thu Apr 17, 2025 · 11:42pm", total:11.49, source:"email", items:[{name:"Big Mac Meal Large",qty:1,price:11.49}], warranty:null, returnBy:null },
        { id:"mc-apr2", dateLabel:"Sun Apr 13, 2025 · 10:58pm", total:15.78, source:"email", items:[{name:"Big Mac Meal",qty:1,price:11.49},{name:"McFlurry Oreo",qty:1,price:4.29}], warranty:null, returnBy:null },
      ],
      "Mar '25": [
        { id:"mc-mar1", dateLabel:"Sat Mar 22, 2025 · 11:15pm", total:11.49, source:"email", items:[{name:"Big Mac Meal",qty:1,price:11.49}], warranty:null, returnBy:null },
      ],
      "Feb '25": [
        { id:"mc-feb1", dateLabel:"Fri Feb 14, 2025 · 10:30pm", total:22.98, source:"email", items:[{name:"Big Mac Meal",qty:2,price:22.98}], warranty:null, returnBy:null },
      ],
      "Jan '25": [
        { id:"mc-jan1", dateLabel:"Mon Jan 20, 2025 · 11:55pm", total:11.49, source:"email", items:[{name:"Big Mac Meal",qty:1,price:11.49}], warranty:null, returnBy:null },
      ],
    }
  },
];

// Quarter / Year label helpers
const MONTH_TO_QTR = { "Jan '25":"Q1 '25","Feb '25":"Q1 '25","Mar '25":"Q1 '25","Apr '25":"Q2 '25","May '25":"Q2 '25","Jun '25":"Q2 '25" };
const MONTH_TO_YR  = { "Jan '25":"2025","Feb '25":"2025","Mar '25":"2025","Apr '25":"2025" };

function buildVaultData(viewPeriod) {
  return BASE_RECEIPTS.map(m => {
    if (viewPeriod === "Mo") {
      // Group by month label
      const groups = {};
      Object.entries(m.months).forEach(([mo, recs]) => { groups[mo] = recs; });
      return { ...m, groups, totalLabel: "per month" };
    }
    if (viewPeriod === "Qtr") {
      const groups = {};
      Object.entries(m.months).forEach(([mo, recs]) => {
        const qtr = MONTH_TO_QTR[mo] || mo;
        if (!groups[qtr]) groups[qtr] = [];
        groups[qtr].push(...recs);
      });
      return { ...m, groups, totalLabel: "per quarter" };
    }
    if (viewPeriod === "Yr") {
      const groups = {};
      Object.entries(m.months).forEach(([mo, recs]) => {
        const yr = MONTH_TO_YR[mo] || "2025";
        if (!groups[yr]) groups[yr] = [];
        groups[yr].push(...recs);
      });
      return { ...m, groups, totalLabel: "per year" };
    }
    return m;
  });
}

// ─── RECEIPT DETAIL MODAL ────────────────────────────────────────────────────
function ReceiptModal({ receipt, merchant, color, onClose }) {
  const sourceLabel = receipt.source === "email" ? "Email Receipt" : "QR Code Scan";
  const sourceIcon = receipt.source === "email" ? "📧" : "📱";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000,
      display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#0c1524", border: `1px solid ${color}30`,
          borderRadius: "24px 24px 0 0", padding: "0 0 32px", width: "100%", maxWidth: 500,
          animation: "slideUp 0.3s ease", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>

        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: "2px", background: "#1a2040" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#eef0f8",
                fontFamily: "'Syne', sans-serif" }}>{merchant}</div>
              <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>{receipt.dateLabel}</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)",
              border: "none", color: C.muted, width: 30, height: 30, borderRadius: "50%",
              cursor: "pointer", fontSize: "13px" }}>✕</button>
          </div>

          {/* Source badge */}
          <div style={{ display: "flex", gap: "6px", marginTop: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "10px",
              background: color + "18", color, fontWeight: "700",
              fontFamily: "'Space Mono', monospace" }}>
              {sourceIcon} {sourceLabel}
            </span>
            {receipt.returnBy && (
              <span style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "10px",
                background: "#ef444420", color: "#ef4444", fontWeight: "700",
                fontFamily: "'Space Mono', monospace" }}>
                ↩ Return by {receipt.returnBy}
              </span>
            )}
            {receipt.warranty && (
              <span style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "10px",
                background: "#34d39920", color: "#34d399", fontWeight: "700",
                fontFamily: "'Space Mono', monospace" }}>
                🛡 Warranty
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px" }}>

          {/* Receipt image mock */}
          <div style={{ background: "#f8f4ee", borderRadius: "12px", padding: "16px",
            marginBottom: "16px", fontFamily: "monospace" }}>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#1a1a1a" }}>{merchant.toUpperCase()}</div>
              <div style={{ fontSize: "10px", color: "#666" }}>{receipt.dateLabel}</div>
              <div style={{ fontSize: "9px", color: "#888", marginTop: "2px" }}>
                {receipt.source === "qr" ? "DIGITAL RECEIPT · QR VERIFIED" : "EMAIL RECEIPT · AUTO-CAPTURED"}
              </div>
            </div>
            <div style={{ borderTop: "1px dashed #ccc", paddingTop: "8px" }}>
              {receipt.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between",
                  fontSize: "11px", color: "#333", padding: "2px 0" }}>
                  <span>{item.qty > 1 ? `${item.qty}x ` : ""}{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px dashed #ccc", marginTop: "8px", paddingTop: "6px",
                display: "flex", justifyContent: "space-between", fontSize: "12px",
                fontWeight: "800", color: "#1a1a1a" }}>
                <span>TOTAL</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Warranty info */}
          {receipt.warranty && (
            <div style={{ background: "#34d39912", border: "1px solid #34d39930",
              borderRadius: "12px", padding: "12px 14px", marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", color: "#34d399", fontWeight: "800", marginBottom: "4px",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>🛡️ Warranty Tracked</div>
              <div style={{ fontSize: "13px", color: "#eef0f8" }}>{receipt.warranty.item}</div>
              <div style={{ fontSize: "11px", color: C.muted }}>Expires {receipt.warranty.expires} · {receipt.warranty.days} days remaining</div>
            </div>
          )}

          {/* Return info */}
          {receipt.returnBy && (
            <div style={{ background: "#ef444412", border: "1px solid #ef444430",
              borderRadius: "12px", padding: "12px 14px", marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", color: "#ef4444", fontWeight: "800", marginBottom: "4px",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>↩️ Return Window Open</div>
              <div style={{ fontSize: "13px", color: "#fca5a5" }}>{receipt.returnItem}</div>
              <div style={{ fontSize: "11px", color: C.muted }}>Deadline: {receipt.returnBy}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: "0 20px", display: "flex", gap: "8px" }}>
          <button style={{ flex: 1, background: color + "18", border: `1px solid ${color}40`,
            color, padding: "12px", borderRadius: "12px", cursor: "pointer",
            fontSize: "12px", fontWeight: "700" }}>
            📤 Share Receipt
          </button>
          <button style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
            color: C.soft, padding: "12px", borderRadius: "12px", cursor: "pointer",
            fontSize: "12px", fontWeight: "700" }}>
            🔍 View All from {merchant.split(" ")[0]}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VAULT TAB ────────────────────────────────────────────────────────────────
function VaultView() {
  const [vaultPeriod, setVaultPeriod] = useState("Mo");
  const [vaultView, setVaultView] = useState("all");
  const [expandedGroup, setExpandedGroup] = useState("Apr '25");
  const [expandedMerchant, setExpandedMerchant] = useState("Whole Foods");
  const [expandedMerchantGroup, setExpandedMerchantGroup] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const data = buildVaultData(vaultPeriod);
  const totalReceipts = data.reduce((a,m) => a + Object.values(m.groups).flat().length, 0);
  const totalSpend = data.reduce((a,m) => a + Object.values(m.groups).flat().reduce((b,r) => b+r.total, 0), 0);

  // Alerts
  const allReturns = data.flatMap(m => Object.values(m.groups).flat().filter(r=>r.returnBy).map(r=>({...r,merchant:m.merchant,color:m.color})));
  const allWarranties = data.flatMap(m => Object.values(m.groups).flat().filter(r=>r.warranty).map(r=>({...r,merchant:m.merchant,mcolor:m.color}))).filter((w,i,arr)=>arr.findIndex(x=>x.warranty?.item===w.warranty?.item)===i);

  // ALL VIEW — flat chronological grouped by period label
  const allGrouped = (() => {
    const groups = {};
    data.forEach(m => {
      Object.entries(m.groups).forEach(([label, recs]) => {
        if (!groups[label]) groups[label] = [];
        recs.forEach(r => groups[label].push({...r, merchantName:m.merchant, merchantIcon:m.icon, merchantColor:m.color, merchantObj:m}));
      });
    });
    // Sort receipts within group newest first (by dateLabel)
    Object.keys(groups).forEach(k => groups[k].sort((a,b) => b.dateLabel.localeCompare(a.dateLabel)));
    return groups;
  })();

  const openReceipt = (r, mObj) => { setSelectedReceipt(r); setSelectedMerchant(mObj); };

  const AlertsBlock = () => (
    <>
      {allReturns.length > 0 && (
        <div style={{ background:"#ef444412", border:"1px solid #ef444335", borderRadius:"12px", padding:"12px 14px", marginBottom:"12px" }}>
          <p style={{ fontSize:"10px", color:"#ef4444", fontWeight:"800", marginBottom:"6px", letterSpacing:"0.1em", textTransform:"uppercase" }}>⚠️ Return Windows Closing</p>
          {allReturns.map((r,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0" }}>
              <span style={{ fontSize:"12px", color:"#fca5a5" }}>{r.returnItem} · {r.merchant}</span>
              <span style={{ fontSize:"11px", fontWeight:"800", color:"#ef4444", fontFamily:"'Space Mono',monospace" }}>by {r.returnBy}</span>
            </div>
          ))}
        </div>
      )}
      {allWarranties.length > 0 && (
        <div style={{ marginBottom:"14px" }}>
          <p style={{ fontSize:"10px", color:C.muted, fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>🛡️ Active Warranties</p>
          {allWarranties.map((w,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:"10px", marginBottom:"5px" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"12px", fontWeight:"600", color:"#eef0f8" }}>{w.warranty.item}</div>
                <div style={{ fontSize:"10px", color:C.muted }}>{w.merchant} · expires {w.warranty.expires}</div>
              </div>
              <span style={{ fontSize:"10px", fontWeight:"800", padding:"2px 8px", borderRadius:"8px", background:(w.warranty.days<60?"#fbbf24":"#34d399")+"20", color:w.warranty.days<60?"#fbbf24":"#34d399", fontFamily:"'Space Mono',monospace" }}>{w.warranty.days}d</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div style={{ animation:"fadeUp 0.28s ease" }}>
      {/* Period selector */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"10px" }}>
        {[["Mo","Monthly"],["Qtr","Quarterly"],["Yr","Yearly"]].map(([p,label]) => (
          <button key={p} onClick={() => { setVaultPeriod(p); setExpandedGroup(null); setExpandedMerchantGroup(null); }}
            style={{ flex:1, background:vaultPeriod===p?"#34d39918":"transparent", border:vaultPeriod===p?"1px solid #34d39950":`1px solid ${C.border}`, color:vaultPeriod===p?"#34d399":C.muted, padding:"8px", borderRadius:"10px", cursor:"pointer", fontSize:"12px", fontWeight:"700", fontFamily:"'Space Mono',monospace", transition:"all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"14px" }}>
        {[["all","📋 All Receipts"],["merchant","🏪 By Merchant"]].map(([v,label]) => (
          <button key={v} onClick={() => setVaultView(v)}
            style={{ flex:1, background:vaultView===v?"rgba(255,255,255,0.07)":"transparent", border:vaultView===v?"1px solid #334155":`1px solid ${C.border}`, color:vaultView===v?"#eef0f8":C.muted, padding:"7px", borderRadius:"10px", cursor:"pointer", fontSize:"12px", fontWeight:"700", transition:"all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Summary bar */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"14px" }}>
        {[{val:totalReceipts,label:"receipts",color:"#34d399"},{val:`$${Math.round(totalSpend).toLocaleString()}`,label:"total",color:"#eef0f8"},{val:data.length,label:"merchants",color:"#f472b6"}].map((s,i) => (
          <div key={i} style={{ flex:1, background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:"12px", padding:"10px", textAlign:"center" }}>
            <div style={{ fontSize:"17px", fontWeight:"800", color:s.color, fontFamily:"'Space Mono',monospace" }}>{s.val}</div>
            <div style={{ fontSize:"10px", color:C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      <AlertsBlock />

      {/* ── ALL RECEIPTS VIEW ── */}
      {vaultView === "all" && (
        <div>
          <p style={{ fontSize:"10px", color:C.muted, fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>🧾 All Receipts — Chronological</p>
          {Object.entries(allGrouped).map(([groupLabel, recs]) => {
            const isExp = expandedGroup === groupLabel;
            const groupTotal = recs.reduce((a,r) => a+r.total, 0);
            return (
              <div key={groupLabel} style={{ marginBottom:"8px" }}>
                {/* Period header */}
                <button onClick={() => setExpandedGroup(isExp ? null : groupLabel)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", background:isExp?"rgba(52,211,153,0.08)":"rgba(255,255,255,0.02)", border:isExp?"1px solid rgba(52,211,153,0.3)":`1px solid ${C.border}`, borderRadius:isExp?"14px 14px 0 0":"14px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
                  <div style={{ width:8, height:8, borderRadius:"2px", background:"#34d399", flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:"13px", fontWeight:"800", color:isExp?"#34d399":"#eef0f8", fontFamily:"'Space Mono',monospace" }}>{groupLabel}</span>
                    <span style={{ fontSize:"11px", color:C.muted, marginLeft:"8px" }}>{recs.length} receipt{recs.length!==1?"s":""}</span>
                  </div>
                  <span style={{ fontSize:"13px", fontWeight:"700", color:isExp?"#34d399":C.muted, fontFamily:"'Space Mono',monospace" }}>${groupTotal.toFixed(2)}</span>
                  <span style={{ color:isExp?"#34d399":C.muted, fontSize:"13px", display:"inline-block", transform:isExp?"rotate(90deg)":"rotate(0)", transition:"transform 0.2s" }}>›</span>
                </button>

                {/* Receipts inside period */}
                {isExp && (
                  <div style={{ background:"rgba(0,0,0,0.15)", border:"1px solid rgba(52,211,153,0.2)", borderTop:"none", borderRadius:"0 0 14px 14px", overflow:"hidden" }}>
                    {recs.map((r, ri) => (
                      <button key={r.id} onClick={() => openReceipt(r, r.merchantObj)}
                        style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", background:"transparent", border:"none", borderBottom:ri<recs.length-1?`1px solid rgba(30,58,95,0.5)`:"none", cursor:"pointer", textAlign:"left" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        {/* Merchant color dot + icon */}
                        <div style={{ width:36, height:36, borderRadius:"10px", background:r.merchantColor+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
                          {r.merchantIcon}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:"13px", fontWeight:"700", color:"#eef0f8" }}>{r.merchantName}</div>
                          <div style={{ fontSize:"11px", color:C.muted, marginTop:"1px" }}>
                            {r.dateLabel.replace(/ '25/,"")} · {r.items.length} items
                            {r.source==="qr" && <span style={{ color:"#34d399" }}> · 📱 QR</span>}
                            {r.returnBy && <span style={{ color:"#ef4444" }}> · ↩ return by {r.returnBy}</span>}
                            {r.warranty && <span style={{ color:"#34d399" }}> · 🛡 warranty</span>}
                          </div>
                        </div>
                        <span style={{ fontSize:"13px", fontWeight:"800", color:r.merchantColor, fontFamily:"'Space Mono',monospace" }}>${r.total.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── BY MERCHANT VIEW ── */}
      {vaultView === "merchant" && (
        <div>
          <p style={{ fontSize:"10px", color:C.muted, fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>🧾 Receipts by Merchant</p>
          {data.map(m => {
            const isExpM = expandedMerchant === m.merchant;
            const allRecs = Object.values(m.groups).flat();
            const merchantTotal = allRecs.reduce((a,r) => a+r.total, 0);
            return (
              <div key={m.merchant} style={{ marginBottom:"8px" }}>
                <button onClick={() => setExpandedMerchant(isExpM ? null : m.merchant)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", background:isExpM?m.color+"12":"rgba(255,255,255,0.02)", border:isExpM?`1px solid ${m.color}35`:`1px solid ${C.border}`, borderRadius:isExpM?"14px 14px 0 0":"14px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
                  <span style={{ fontSize:"18px" }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"13px", fontWeight:"700", color:isExpM?m.color:"#eef0f8" }}>{m.merchant}</div>
                    <div style={{ fontSize:"11px", color:C.muted }}>{allRecs.length} receipts · ${Math.round(merchantTotal).toLocaleString()}</div>
                  </div>
                  <span style={{ color:isExpM?m.color:C.muted, fontSize:"13px", display:"inline-block", transform:isExpM?"rotate(90deg)":"rotate(0)", transition:"transform 0.2s" }}>›</span>
                </button>

                {isExpM && (
                  <div style={{ background:"rgba(255,255,255,0.01)", border:`1px solid ${m.color}25`, borderTop:"none", borderRadius:"0 0 14px 14px", overflow:"hidden" }}>
                    {Object.entries(m.groups).map(([groupLabel, recs], gi, arr) => {
                      const gKey = `${m.merchant}-${groupLabel}`;
                      const isExpG = expandedMerchantGroup === gKey;
                      const gTotal = recs.reduce((a,r) => a+r.total, 0);
                      return (
                        <div key={groupLabel}>
                          <button onClick={() => setExpandedMerchantGroup(isExpG ? null : gKey)}
                            style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"9px 14px 9px 18px", background:isExpG?m.color+"0a":"transparent", border:"none", borderBottom:!isExpG&&gi<arr.length-1?`1px solid ${C.border}`:"none", cursor:"pointer", textAlign:"left" }}>
                            <div style={{ width:7, height:7, borderRadius:"2px", background:m.color, opacity:0.5, flexShrink:0 }} />
                            <div style={{ flex:1 }}>
                              <span style={{ fontSize:"12px", fontWeight:"700", color:isExpG?m.color:"#94a3b8", fontFamily:"'Space Mono',monospace" }}>{groupLabel}</span>
                              <span style={{ fontSize:"10px", color:C.muted, marginLeft:"6px" }}>{recs.length} receipt{recs.length!==1?"s":""}</span>
                            </div>
                            <span style={{ fontSize:"11px", fontWeight:"700", color:isExpG?m.color:C.muted, fontFamily:"'Space Mono',monospace" }}>${gTotal.toFixed(2)}</span>
                            <span style={{ color:isExpG?m.color:C.muted, fontSize:"11px", display:"inline-block", transform:isExpG?"rotate(90deg)":"rotate(0)", transition:"transform 0.2s" }}>›</span>
                          </button>
                          {isExpG && (
                            <div style={{ background:"rgba(0,0,0,0.15)", borderBottom:`1px solid ${C.border}` }}>
                              {recs.map((r, ri) => (
                                <button key={r.id} onClick={() => openReceipt(r, m)}
                                  style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"10px 14px 10px 28px", background:"transparent", border:"none", borderBottom:ri<recs.length-1?`1px solid rgba(30,58,95,0.4)`:"none", cursor:"pointer", textAlign:"left" }}
                                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                  <div style={{ width:30, height:30, borderRadius:"8px", background:m.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}>
                                    {r.source==="email"?"📧":"📱"}
                                  </div>
                                  <div style={{ flex:1 }}>
                                    <div style={{ fontSize:"12px", fontWeight:"600", color:"#e2e8f0" }}>{r.dateLabel}</div>
                                    <div style={{ fontSize:"10px", color:C.muted, marginTop:"1px" }}>
                                      {r.items.length} items
                                      {r.returnBy&&<span style={{ color:"#ef4444" }}> · ↩ return by {r.returnBy}</span>}
                                      {r.warranty&&<span style={{ color:"#34d399" }}> · 🛡 warranty</span>}
                                    </div>
                                  </div>
                                  <span style={{ fontSize:"12px", fontWeight:"800", color:m.color, fontFamily:"'Space Mono',monospace" }}>${r.total.toFixed(2)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedReceipt && selectedMerchant && (
        <ReceiptModal receipt={selectedReceipt} merchant={selectedMerchant.merchant} color={selectedMerchant.color} onClose={() => { setSelectedReceipt(null); setSelectedMerchant(null); }} />
      )}
    </div>
  );
}

// ─── THEMES TAB ──────────────────────────────────────────────────────────────
function ScoreRing({ score, color, size = 72 }) {
  const r = size / 2 - 7; const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}
        fontSize="13" fontWeight="800" fill="#eef0f8" fontFamily="'Syne',sans-serif">{score}</text>
    </svg>
  );
}

function ThemesView() {
  const [sel, setSel] = useState("Health");
  const themes = {
    Health: { icon: "🥗", color: "#34d399", score: 62, label: "Needs Work", lc: "#fbbf24",
      insights: [
        { t: "Protein strong — 8 sources across 3 merchants", g: true },
        { t: "68% of snacks are ultra-processed this month", g: false },
        { t: "Vegetable spend up 22% vs last month 🎉", g: true },
        { t: "4 late-night McDonald's visits — 3 after 10pm", g: false },
        { t: "Starbucks matcha has 42g sugar per drink", g: false },
      ], action: "Swap Starbucks matcha for home-made: save $43/mo + cut 336g sugar" },
    Budget: { icon: "💰", color: "#fbbf24", score: 54, label: "Overspending", lc: "#ef4444",
      insights: [
        { t: "Restaurant spend $372 — same meals home cost ~$95", g: false },
        { t: "Name brand loyalty costs ~$67/mo vs store brand", g: false },
        { t: "Target sparkling water saves $1.20/pack vs Whole Foods", g: true },
        { t: "4 streaming services — 2 overlap 60% in content", g: false },
        { t: "Organic chicken at Walmart: best $/protein you have", g: true },
      ], action: "Cut 2 restaurant meals/week → home cooking saves $220/mo" },
    Habits: { icon: "🔄", color: "#a78bfa", score: 71, label: "Consistent", lc: "#34d399",
      insights: [
        { t: "You shop Whole Foods every 4.2 days — very consistent", g: true },
        { t: "Chipotle chicken bowl ordered 6× — most repeated meal", g: true },
        { t: "Coffee spend up 34% over 3 months", g: false },
        { t: "Late-night fast food pattern forming — 3 of 4 visits after 10pm", g: false },
        { t: "Grocery list 78% consistent — ready to auto-generate", g: true },
      ], action: "Auto-generate your weekly Whole Foods list — 78% of it never changes" },
  };
  const theme = themes[sel];

  return (
    <div style={{ animation: "fadeUp 0.28s ease" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {Object.entries(themes).map(([n, t]) => (
          <button key={n} onClick={() => setSel(n)}
            style={{ flex: 1, background: sel === n ? t.color + "18" : "transparent",
              border: sel === n ? `1px solid ${t.color}50` : `1px solid ${C.border}`,
              color: sel === n ? t.color : C.muted, padding: "8px 4px",
              borderRadius: "12px", cursor: "pointer", fontSize: "11px", fontWeight: "700",
              fontFamily: "'Syne', sans-serif", transition: "all 0.2s" }}>
            {t.icon}<br />{n}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px",
        padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "14px",
        border: `1px solid ${C.border}` }}>
        <ScoreRing score={theme.score} color={theme.color} />
        <div>
          <div style={{ fontSize: "12px", color: C.muted }}>Your {sel} Score</div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: theme.lc,
            fontFamily: "'Syne', sans-serif" }}>{theme.label}</div>
          <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>
            Based on {CATEGORIES.reduce((a,c)=>a+c.subs.reduce((b,s)=>b+s.items.length,0),0)} purchases · 5 merchants
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        {theme.insights.map((ins, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", padding: "9px 0",
            borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: "13px", flexShrink: 0 }}>{ins.g ? "✅" : "⚠️"}</span>
            <span style={{ fontSize: "12px", color: ins.g ? C.soft : "#fca5a5", lineHeight: 1.5 }}>{ins.t}</span>
          </div>
        ))}
      </div>

      <div style={{ background: theme.color + "10", border: `1px solid ${theme.color}30`,
        borderRadius: "12px", padding: "14px" }}>
        <div style={{ fontSize: "10px", color: theme.color, fontWeight: "800", marginBottom: "5px",
          letterSpacing: "0.1em", textTransform: "uppercase" }}>💡 Top Action</div>
        <p style={{ fontSize: "12px", color: C.soft, lineHeight: 1.7, margin: 0 }}>{theme.action}</p>
      </div>
    </div>
  );
}

// ─── SURVEY DATA (9 questions) ───────────────────────────────────────────────
const SURVEY_QUESTIONS = {
  spend: [
    { id:"s2", context:"The app connects to your email to automatically pull in receipts from every merchant — Amazon, Target, Starbucks, anywhere that sends you a receipt.", question:"How likely are you to connect your email to automatically capture your receipts?", type:"single", options:["Very likely — totally worth it for the insights","Probably yes — if setup is quick and easy","Unsure — I'd want to know more about privacy first","Unlikely — I don't want to share email access"] },
    { id:"s3", context:"The breakdown goes from category → subcategory → item across every merchant and card.", question:"Which level of detail would you actually use day-to-day?", type:"single", options:["Top level (Groceries $380/mo)","Subcategory (Protein, Snacks, Produce)","Item level (Matcha across all stores)","All of it — give me everything"] },
  ],
  themes: [
    { id:"t1", context:"Because the app knows what you actually buy, it scores your Health, Budget, and Habits automatically.", question:"Which score would motivate you to actually change your behavior?", type:"single", options:["🥗 Health — what am I really eating?","💰 Budget — where am I wasting money?","🔄 Habits — patterns I haven't noticed","All three equally"] },
    { id:"t3", context:"Example insight: 'You pay 8× more for matcha at Starbucks vs making it at home. Switch and save $43/mo.'", question:"How useful are specific suggestions like this based on your real purchases?", type:"single", options:["Very useful — I'd act on them","I'd read them but depends on the tip","Not useful — I make my own calls"] },
  ],
  vault: [
    { id:"v1", context:"Every receipt is saved automatically — no forwarding emails, no scanning paper. It just appears.", question:"Have you ever lost a receipt when you actually needed it?", type:"single", options:["Yes — it cost me money or real hassle","Yes — but it wasn't a big deal","Rarely","Never — I'm very organized"] },
    { id:"v3", context:"The app also tracks warranty expiration dates and return deadlines automatically.", question:"Which Vault feature matters most to you?", type:"single", options:["Return deadline alerts","Warranty expiration reminders","Full searchable receipt history","All receipts in one organized place"] },
  ],
  final: [
    { id:"f1", context:"You've now seen the full app — spending breakdown, themes, and vault.", question:"What's the #1 thing that would make you download it?", type:"single", options:["Everything captured automatically — zero effort","Seeing item-level spending across all merchants","Health & budget scores from real purchases","One-tap reorder for groceries & restaurants","Never losing a warranty or return window"] },
    { id:"f_connect", context:"Think about all the different stores you shop at — Target, Amazon, Whole Foods, Starbucks, etc.", question:"How useful would it be if the app connected to your existing store accounts to automatically pull in your full purchase history?", type:"single", options:["Extremely useful — I'd set it up immediately","Very useful — worth the setup","Somewhat — depends how easy it is","Not useful — I don't want apps accessing my accounts"] },
    { id:"f_promo", context:"Because the app knows exactly what you buy, merchants send you relevant offers — '$5 off your next Chipotle bowl,' '20% off the matcha you buy monthly.' Based on your habits, not random targeting.", question:"How valuable is that compared to the generic promotions you get today?", type:"single", options:["Much more valuable — I'd actually use these","Somewhat better than what I get now","About the same","I don't use promotions at all"] },
    { id:"f2", context:"Free includes automatic receipt capture, spending breakdown, and basic insights. Premium adds item-level intelligence, AI tips, reorder, and warranty tracking.", question:"How much would you pay per month for the full premium experience?", type:"single", options:["$0 — free is enough for me","$1–5/month","$5–10/month","$10–15/month","$15–20/month"] },
    { id:"f3", context:"Almost done!", question:"One thing you'd want this app to do that you didn't see today?", type:"text", options:[] },
  ],
};

function SurveyCard({ q, onAnswer, answered }) {
  const [selected, setSelected] = useState(answered || null);
  const [text, setText] = useState(answered || "");
  const [submitted, setSubmitted] = useState(!!answered);

  const handleSubmit = (val) => { setSelected(val); setSubmitted(true); onAnswer(q.id, val); };

  return (
    <div style={{ background:"linear-gradient(135deg,#0e1528 0%,#0a1020 100%)", border:"1px solid #1e3060",
      borderRadius:"18px", padding:"18px", marginBottom:"12px", animation:"fadeUp 0.3s ease" }}>
      <div style={{ fontSize:"10px", color:"#34d399", fontWeight:"700", textTransform:"uppercase",
        letterSpacing:"0.1em", marginBottom:"6px", fontFamily:"'Space Mono',monospace" }}>💬 Survey</div>
      <p style={{ fontSize:"11px", color:C.muted, marginBottom:"8px", lineHeight:1.5 }}>{q.context}</p>
      <p style={{ fontSize:"14px", fontWeight:"700", color:"#eef0f8", marginBottom:"14px",
        lineHeight:1.5, fontFamily:"'Syne',sans-serif" }}>{q.question}</p>
      {q.type !== "text" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
          {q.options.map((opt,i) => {
            const isSel = selected === opt;
            return (
              <button key={i} onClick={() => !submitted && handleSubmit(opt)}
                style={{ padding:"10px 14px", borderRadius:"12px", textAlign:"left",
                  cursor:submitted?"default":"pointer", fontSize:"13px", fontWeight:isSel?"700":"500",
                  background:isSel?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.02)",
                  border:isSel?"1px solid rgba(52,211,153,0.5)":"1px solid #1a2040",
                  color:isSel?"#34d399":C.soft, transition:"all 0.2s",
                  display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:16, height:16, borderRadius:"50%", flexShrink:0,
                  border:isSel?"none":"2px solid #2a3060", background:isSel?"#34d399":"transparent",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isSel && <span style={{ fontSize:"9px", color:"#080f1a", fontWeight:"900" }}>✓</span>}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      )}
      {q.type === "text" && (
        <div>
          <textarea value={text} onChange={e=>setText(e.target.value)} disabled={submitted}
            placeholder="Type your answer here..."
            style={{ width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid #1a2040",
              borderRadius:"12px", padding:"12px", color:"#eef0f8", fontSize:"13px",
              resize:"none", height:80, fontFamily:"'Karla',sans-serif", outline:"none" }} />
          {!submitted && text.trim() && (
            <button onClick={() => handleSubmit(text)}
              style={{ marginTop:"8px", background:"#34d399", border:"none", color:"#080f1a",
                padding:"10px 20px", borderRadius:"10px", cursor:"pointer", fontWeight:"800",
                fontSize:"13px", fontFamily:"'Syne',sans-serif" }}>Submit →</button>
          )}
        </div>
      )}
      {submitted && <div style={{ marginTop:"10px", fontSize:"11px", color:"#34d399" }}>✓ Response recorded</div>}
    </div>
  );
}

function FinalScreen({ answers, onSubmitEmail }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const allQs = [...SURVEY_QUESTIONS.spend,...SURVEY_QUESTIONS.themes,...SURVEY_QUESTIONS.vault,...SURVEY_QUESTIONS.final];

  if (done) return (
    <div style={{ textAlign:"center", padding:"40px 20px", animation:"fadeUp 0.4s ease" }}>
      <div style={{ fontSize:"56px", marginBottom:"16px" }}>🎉</div>
      <h2 style={{ fontSize:"22px", fontWeight:"800", color:"#34d399", fontFamily:"'Syne',sans-serif", marginBottom:"10px" }}>You're on the list!</h2>
      <p style={{ fontSize:"14px", color:C.soft, lineHeight:1.7 }}>Thank you for helping shape this product.<br/>We'll reach out when we launch early access.</p>
    </div>
  );

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ textAlign:"center", marginBottom:"20px" }}>
        <div style={{ fontSize:"40px", marginBottom:"10px" }}>🙏</div>
        <h2 style={{ fontSize:"20px", fontWeight:"800", fontFamily:"'Syne',sans-serif", color:"#eef0f8", marginBottom:"8px" }}>That's everything!</h2>
        <p style={{ fontSize:"13px", color:C.soft, lineHeight:1.7 }}>You answered {Object.keys(answers).length} questions.<br/>Drop your email for early access when we launch.</p>
      </div>
      <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`,
        borderRadius:"14px", padding:"14px", marginBottom:"20px" }}>
        <p style={{ fontSize:"10px", color:C.muted, fontWeight:"700", textTransform:"uppercase",
          letterSpacing:"0.1em", marginBottom:"10px" }}>Your responses</p>
        {Object.entries(answers).map(([id,val]) => {
          const q = allQs.find(q=>q.id===id); if(!q) return null;
          return (
            <div key={id} style={{ padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:"10px", color:C.muted, marginBottom:"2px" }}>{q.question}</div>
              <div style={{ fontSize:"12px", color:"#34d399", fontWeight:"600" }}>{val}</div>
            </div>
          );
        })}
      </div>
      <div style={{ background:"linear-gradient(135deg,#0e2818 0%,#0a1020 100%)",
        border:"1px solid rgba(52,211,153,0.3)", borderRadius:"16px", padding:"18px" }}>
        <p style={{ fontSize:"13px", fontWeight:"700", color:"#eef0f8", marginBottom:"4px" }}>Get early access 🚀</p>
        <p style={{ fontSize:"11px", color:C.muted, marginBottom:"14px" }}>Be first to try it when we launch. No spam, ever.</p>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
          style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid #1e3060",
            borderRadius:"10px", padding:"12px 14px", color:"#eef0f8", fontSize:"14px",
            marginBottom:"10px", fontFamily:"'Karla',sans-serif", outline:"none" }} />
        <button onClick={() => { if(email.includes("@")){ onSubmitEmail(email,answers); setDone(true); }}}
          style={{ width:"100%", background:email.includes("@")?"#34d399":"#1a2040", border:"none",
            color:email.includes("@")?"#080f1a":C.muted, padding:"13px", borderRadius:"12px",
            fontSize:"14px", fontWeight:"800", cursor:email.includes("@")?"pointer":"not-allowed",
            fontFamily:"'Syne',sans-serif", transition:"all 0.2s" }}>
          Join the waitlist →
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"spend", icon:"📊", label:"Spending" },
  { id:"themes", icon:"🧠", label:"Themes" },
  { id:"vault", icon:"📦", label:"Vault" },
  { id:"survey", icon:"✅", label:"Survey" },
];

export default function App() {
  const [tab, setTab] = useState("intro");
  const [period, setPeriod] = useState("Mo");
  const [activecat, setActivecat] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [visitedTabs, setVisitedTabs] = useState(new Set());
  const [answers, setAnswers] = useState({});

  const selCat = CATEGORIES.find(c => c.name === activecat);
  const selSub = selCat?.subs.find(s => s.name === activeSub);
  const totalMo = CATEGORIES.reduce((a, c) => a + c.baseMo, 0);
  const allQs = [...SURVEY_QUESTIONS.spend,...SURVEY_QUESTIONS.themes,...SURVEY_QUESTIONS.vault,...SURVEY_QUESTIONS.final];
  const answeredCount = Object.keys(answers).length;
  const totalQs = allQs.length;

  const handleTabChange = (t) => {
    setTab(t);
    setVisitedTabs(prev => new Set([...prev, t]));
  };

  const handleSlice = (name) => {
    if (name === activecat) { setActivecat(null); setActiveSub(null); }
    else { setActivecat(name); setActiveSub(null); }
  };

  const handleAnswer = (id, val) => setAnswers(prev => ({...prev, [id]: val}));

  const totalMoVal = totalMo;

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&family=Karla:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${C.bg};}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#1a2040;border-radius:2px;}
  `;

  const BottomNav = () => (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.card,
      borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around",
      padding:"10px 0 14px", zIndex:100 }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => handleTabChange(t.id)}
          style={{ background:"transparent", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:"3px",
            padding:"0 12px", position:"relative" }}>
          <span style={{ fontSize:"18px" }}>{t.icon}</span>
          <span style={{ fontSize:"10px", fontWeight:"700",
            color:tab===t.id?"#34d399":C.muted,
            fontFamily:"'Space Mono',monospace", transition:"color 0.2s" }}>
            {t.label}
          </span>
          {tab===t.id && <div style={{ width:18, height:2, background:"#34d399", borderRadius:"2px", marginTop:"1px" }} />}
          {t.id==="survey" && answeredCount>0 && answeredCount<totalQs && (
            <div style={{ position:"absolute", top:0, right:6, width:7, height:7,
              borderRadius:"50%", background:"#34d399", animation:"pulse 2s infinite" }} />
          )}
        </button>
      ))}
    </div>
  );

  // ── INTRO ──
  if (tab === "intro") return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center",
        justifyContent:"center", padding:"24px", fontFamily:"'Karla',sans-serif" }}>
        <div style={{ maxWidth:400, width:"100%", animation:"fadeUp 0.5s ease" }}>

          <div style={{ textAlign:"center", marginBottom:"32px" }}>
            <div style={{ width:64, height:64, borderRadius:"20px",
              background:"linear-gradient(135deg,#34d399,#0891b2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"28px", margin:"0 auto 20px", boxShadow:"0 0 32px rgba(52,211,153,0.3)" }}>🧾</div>
            <div style={{ fontSize:"10px", color:"#34d399", fontWeight:"700", letterSpacing:"0.2em",
              textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:"14px" }}>
              Early Access Survey
            </div>
            <h1 style={{ fontSize:"26px", fontWeight:"800", color:"#eef0f8",
              fontFamily:"'Syne',sans-serif", lineHeight:1.3, marginBottom:"14px" }}>
              Your bank shows where you spent.<br/>
              <span style={{ color:"#34d399" }}>We show what you bought.</span>
            </h1>
            <p style={{ fontSize:"14px", color:C.soft, lineHeight:1.7 }}>
              Connect your email and your receipts from every merchant automatically flow in — organized, categorized, and turned into insights you've never had before.
            </p>
          </div>

          {/* 3 value props */}
          <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"28px" }}>
            {[
              { icon:"📊", title:"See what you actually buy", desc:"Not just 'Whole Foods $87' — every item, every merchant, every card in one organized place." },
              { icon:"🧠", title:"Understand your real habits", desc:"Health, budget & spending patterns built from your actual purchases — not estimates." },
              { icon:"📦", title:"Never lose a receipt again", desc:"Returns, warranties, and your full purchase history — saved and searchable forever." },
            ].map((v,i) => (
              <div key={i} style={{ display:"flex", gap:"14px", padding:"14px",
                background:C.card, border:`1px solid ${C.border}`, borderRadius:"14px",
                alignItems:"flex-start" }}>
                <span style={{ fontSize:"22px", flexShrink:0 }}>{v.icon}</span>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:"700", color:"#eef0f8", marginBottom:"3px" }}>{v.title}</div>
                  <div style={{ fontSize:"12px", color:C.soft, lineHeight:1.5 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"18px",
            padding:"10px 14px", background:"rgba(52,211,153,0.06)",
            borderRadius:"10px", border:"1px solid rgba(52,211,153,0.2)" }}>
            <span>⏱</span>
            <p style={{ fontSize:"12px", color:C.soft }}>
              <strong style={{ color:"#eef0f8" }}>3–5 minutes.</strong> Questions appear as you explore — no separate form.
            </p>
          </div>

          <button onClick={() => handleTabChange("spend")}
            style={{ width:"100%", background:"#34d399", border:"none", color:"#080f1a",
              padding:"16px", borderRadius:"14px", fontSize:"15px", fontWeight:"800",
              cursor:"pointer", fontFamily:"'Syne',sans-serif",
              boxShadow:"0 0 28px rgba(52,211,153,0.35)" }}>
            See the demo →
          </button>
        </div>
      </div>
    </>
  );

  // ── SURVEY TAB ──
  if (tab === "survey") {
    const allDone = answeredCount >= totalQs;
    const sections = [
      { label:"📊 After Spending", qs:SURVEY_QUESTIONS.spend, unlocked:visitedTabs.has("spend") },
      { label:"🧠 After Themes", qs:SURVEY_QUESTIONS.themes, unlocked:visitedTabs.has("themes") },
      { label:"📦 After Vault", qs:SURVEY_QUESTIONS.vault, unlocked:visitedTabs.has("vault") },
      { label:"🎯 Final Questions", qs:SURVEY_QUESTIONS.final, unlocked:visitedTabs.has("spend")&&visitedTabs.has("themes")&&visitedTabs.has("vault") },
    ];
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
          fontFamily:"'Karla',sans-serif", paddingBottom:80 }}>
          <div style={{ maxWidth:680, margin:"0 auto", padding:"18px 14px" }}>
            <div style={{ marginBottom:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h1 style={{ fontSize:"20px", fontWeight:"800", fontFamily:"'Syne',sans-serif" }}>Your Feedback</h1>
                <span style={{ fontSize:"11px", color:"#34d399", fontFamily:"'Space Mono',monospace", fontWeight:"700" }}>{answeredCount}/{totalQs}</span>
              </div>
              <div style={{ background:C.border, borderRadius:"4px", height:4, marginTop:"10px" }}>
                <div style={{ background:"#34d399", height:4, borderRadius:"4px",
                  width:`${(answeredCount/totalQs)*100}%`, transition:"width 0.4s ease" }} />
              </div>
            </div>
            {allDone ? (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"20px" }}>
                <FinalScreen answers={answers} onSubmitEmail={(e,a)=>console.log("Done",{e,a})} />
              </div>
            ) : sections.map(sec => (
              <div key={sec.label} style={{ marginBottom:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                  <span style={{ fontSize:"12px", fontWeight:"700", color:sec.unlocked?C.soft:C.muted,
                    fontFamily:"'Syne',sans-serif" }}>{sec.label}</span>
                  {!sec.unlocked && <span style={{ fontSize:"10px", color:C.muted, fontFamily:"'Space Mono',monospace" }}>· explore that tab first 🔒</span>}
                </div>
                {sec.unlocked ? sec.qs.map(q => (
                  <SurveyCard key={q.id} q={q} onAnswer={handleAnswer} answered={answers[q.id]} />
                )) : (
                  <div style={{ background:"rgba(255,255,255,0.01)", border:`1px solid ${C.border}`,
                    borderRadius:"14px", padding:"16px", textAlign:"center", color:C.muted, fontSize:"13px" }}>
                    Visit that section first to unlock these questions
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  // ── MAIN TABS ──
  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
        fontFamily:"'Karla',sans-serif", paddingBottom:72 }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"18px 14px" }}>

          {/* Header */}
          <div style={{ marginBottom:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"6px" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 8px #34d399" }} />
              <span style={{ fontSize:"9px", letterSpacing:"0.22em", color:"#34d399", fontWeight:"700",
                textTransform:"uppercase", fontFamily:"'Space Mono',monospace" }}>Receipt Intelligence · Demo</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
              <h1 style={{ fontSize:"22px", fontWeight:"800", fontFamily:"'Syne',sans-serif", lineHeight:1.2 }}>
                Your Money,<br/>Decoded
              </h1>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"10px", color:C.muted }}>this month</div>
                <div style={{ fontSize:"18px", fontWeight:"800", color:"#34d399", fontFamily:"'Space Mono',monospace" }}>
                  ${Math.round(totalMoVal * MULT[period]).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Survey nudge */}
          {answeredCount < totalQs && (
            <div onClick={() => handleTabChange("survey")}
              style={{ background:"rgba(52,211,153,0.05)", border:"1px solid rgba(52,211,153,0.2)",
                borderRadius:"10px", padding:"8px 12px", marginBottom:"14px",
                display:"flex", justifyContent:"space-between", cursor:"pointer" }}>
              <span style={{ fontSize:"12px", color:C.soft }}>
                Survey: <strong style={{ color:"#34d399" }}>{answeredCount}/{totalQs}</strong> questions answered
              </span>
              <span style={{ fontSize:"11px", color:"#34d399", fontWeight:"700" }}>View →</span>
            </div>
          )}

          {/* SPEND */}
          {tab === "spend" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ display:"flex", gap:"16px", alignItems:"flex-start", flexWrap:"wrap", marginBottom:"20px" }}>
                <PieChart data={CATEGORIES} onSlice={handleSlice} active={activecat} period={period} onPeriod={setPeriod} />
                <div style={{ flex:1, minWidth:170 }}>
                  <Legend cats={CATEGORIES} active={activecat} onSelect={handleSlice} period={period} />
                </div>
              </div>
              {selCat && !selSub && (
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"18px" }}>
                  <SubView cat={selCat} period={period} onSub={setActiveSub} activeSub={activeSub} />
                </div>
              )}
              {selSub && (
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"18px" }}>
                  <ItemView sub={selSub} catColor={selCat.color} period={period} onBack={() => setActiveSub(null)} />
                </div>
              )}
              {!activecat && (
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"16px" }}>
                  <p style={{ fontSize:"11px", color:C.muted, fontWeight:"700", textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:"10px" }}>💡 Top Insights This Month</p>
                  {CATEGORIES.slice(0,4).map(c => (
                    <div key={c.name} onClick={() => handleSlice(c.name)}
                      style={{ display:"flex", gap:"8px", padding:"9px 0", cursor:"pointer",
                        borderBottom:`1px solid ${C.border}`, alignItems:"flex-start" }}>
                      <span style={{ fontSize:"13px", flexShrink:0 }}>{c.icon}</span>
                      <p style={{ fontSize:"12px", color:C.soft, lineHeight:1.5, flex:1 }}>
                        <strong style={{ color:c.color }}>{c.name}:</strong> {c.insight}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {/* Inline survey */}
              <div style={{ marginTop:"20px" }}>
                <p style={{ fontSize:"10px", color:C.muted, fontWeight:"700", textTransform:"uppercase",
                  letterSpacing:"0.1em", marginBottom:"10px" }}>💬 Quick questions about what you just saw</p>
                {SURVEY_QUESTIONS.spend.map(q => (
                  <SurveyCard key={q.id} q={q} onAnswer={handleAnswer} answered={answers[q.id]} />
                ))}
              </div>
            </div>
          )}

          {/* THEMES */}
          {tab === "themes" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"18px", marginBottom:"16px" }}>
                <ThemesView />
              </div>
              <div>
                <p style={{ fontSize:"10px", color:C.muted, fontWeight:"700", textTransform:"uppercase",
                  letterSpacing:"0.1em", marginBottom:"10px" }}>💬 Quick questions about what you just saw</p>
                {SURVEY_QUESTIONS.themes.map(q => (
                  <SurveyCard key={q.id} q={q} onAnswer={handleAnswer} answered={answers[q.id]} />
                ))}
              </div>
            </div>
          )}

          {/* VAULT */}
          {tab === "vault" && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"18px", marginBottom:"16px" }}>
                <VaultView />
              </div>
              <div>
                <p style={{ fontSize:"10px", color:C.muted, fontWeight:"700", textTransform:"uppercase",
                  letterSpacing:"0.1em", marginBottom:"10px" }}>💬 Quick questions about what you just saw</p>
                {SURVEY_QUESTIONS.vault.map(q => (
                  <SurveyCard key={q.id} q={q} onAnswer={handleAnswer} answered={answers[q.id]} />
                ))}
                {visitedTabs.has("spend") && visitedTabs.has("themes") && (
                  <div style={{ marginTop:"8px" }}>
                    <p style={{ fontSize:"10px", color:"#34d399", fontWeight:"700", textTransform:"uppercase",
                      letterSpacing:"0.1em", marginBottom:"10px" }}>🎯 Final Questions</p>
                    {SURVEY_QUESTIONS.final.map(q => (
                      <SurveyCard key={q.id} q={q} onAnswer={handleAnswer} answered={answers[q.id]} />
                    ))}
                    {answeredCount >= totalQs && (
                      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"20px", marginTop:"12px" }}>
                        <FinalScreen answers={answers} onSubmitEmail={(e,a)=>console.log("Done",{e,a})} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
