"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { 
  MessageSquare, Bot, Kanban, Megaphone, Users, Zap,
  Link2, ClipboardList, TrendingUp, Sun, Moon
} from "lucide-react";
import { WhatsAppWidget } from "@/components/ui/whatsapp-widget";

/* ─── data ─────────────────────────────────────────── */
// Base prices (INR) — same as billing dashboard (PRICES_INR in billing-client.tsx)
// Final price = base * 1.15 (15% markup included)
const PRICES_BASE = {
  basic:   { monthly: 499,   yearly: 4_790  },
  pro:     { monthly: 999,   yearly: 9_590  },
  premium: { monthly: 4_999, yearly: 47_990 },
};

const PLANS = [
  {
    name: "Basic",
    tier: "basic",
    desc: "Essential WhatsApp tools for solo operators.",
    // monthly price with 15% markup
    monthly: Math.round(PRICES_BASE.basic.monthly * 1.15),
    // yearly total with 15% markup (billed annually)
    yearly: Math.round(PRICES_BASE.basic.yearly * 1.15),
    yearlyPerMonth: Math.round(Math.round(PRICES_BASE.basic.yearly * 1.15) / 12),
    highlight: false, badge: null,
    features: [
      "Up to 1,000 contacts",
      "Shared inbox (1 seat)",
      "1 chatbot flow (keyword-based)",
      "Business-hours auto-reply",
      "Welcome message automation",
      "Fixed FAQ auto-reply (5–10 Q&A)",
    ],
    notIncluded: ["Broadcasts", "Drip / follow-up automation", "Unlimited chatbot flows", "AI auto-reply"],
    cta: "Start free trial",
  },
  {
    name: "Pro",
    tier: "pro",
    desc: "For growing teams that automate customer journeys.",
    monthly: Math.round(PRICES_BASE.pro.monthly * 1.15),
    yearly: Math.round(PRICES_BASE.pro.yearly * 1.15),
    yearlyPerMonth: Math.round(Math.round(PRICES_BASE.pro.yearly * 1.15) / 12),
    highlight: true, badge: "Most popular",
    features: [
      "Up to 5,000 contacts",
      "3 team seats",
      "1,000 broadcast messages / month",
      "Unlimited chatbot flows (multi-step, button menus)",
      "Drip / follow-up automation",
      "Keyword-based auto-tagging",
      "Abandoned-inquiry recovery",
      "Everything in Basic",
    ],
    notIncluded: ["AI auto-reply", "Lead scoring"],
    cta: "Start free trial",
  },
  {
    name: "Premium",
    tier: "premium",
    desc: "AI-powered growth for high-volume businesses.",
    monthly: Math.round(PRICES_BASE.premium.monthly * 1.15),
    yearly: Math.round(PRICES_BASE.premium.yearly * 1.15),
    yearlyPerMonth: Math.round(Math.round(PRICES_BASE.premium.yearly * 1.15) / 12),
    highlight: false, badge: null,
    features: [
      "Up to 10,000 contacts",
      "10 team seats",
      "2,000 broadcast messages / month",
      "AI auto-reply (FAQ knowledge base)",
      "Lead scoring automation",
      "Multi-number bot routing (sales vs support)",
      "Festival / birthday auto-campaigns",
      "Click-to-WhatsApp Ads automation",
      "Everything in Pro",
      "Priority 24/7 support",
    ],
    notIncluded: [],
    cta: "Start free trial",
  },
];

const TESTIMONIALS = [
  { name: "Karthik Raj", role: "Owner", company: "Aura Salon Chennai", avatar: "KR", body: "Autozee automated our appointment bookings and reminders. Our no-show rate dropped by 40% in just two weeks.", stars: 5 },
  { name: "Dr. Ananya", role: "Chief Dermatologist", company: "Chennai Skin Clinic", avatar: "DA", body: "Sending automated follow-ups for post-treatment care has been a game-changer for our patient retention and satisfaction.", stars: 5 },
  { name: "Suresh Kumar", role: "Founder", company: "Arogya Herbals", avatar: "SK", body: "The broadcast feature is incredible. We sent a WhatsApp campaign for our new hair oil and sold out our inventory in 3 days.", stars: 5 },
  { name: "Meena Iyer", role: "Manager", company: "O2 Spa Anna Nagar", avatar: "MI", body: "Setup took less than 30 minutes. Our front desk was fully onboarded in a day. It's the easiest tool we've used.", stars: 5 },
  { name: "Dr. Vignesh", role: "Director", company: "Smile Dental Care", avatar: "DV", body: "Autozee's AI auto-reply handles basic inquiries like clinic timings and location, freeing up our receptionist completely.", stars: 5 },
  { name: "Priya S.", role: "Operations Lead", company: "Glow Beauty Studio", avatar: "PS", body: "The pipeline view helps us track bridal makeup inquiries effortlessly. We close deals twice as fast now.", stars: 5 },
];

const LOGOS = ["Aura Salon", "Chennai Skin Clinic", "Arogya Herbals", "O2 Spa", "Smile Dental", "Glow Studio", "Naturals", "Green Trends", "Apollo Dental", "Toni&Guy"];

const FEATURES = [
  { icon: <MessageSquare size={22} />, title: "Unified Inbox", desc: "All WhatsApp conversations in one place. Assign, label, and resolve instantly across your whole team.", color: "violet", stat: "5 min", statLabel: "avg response" },
  { icon: <Bot size={22} />, title: "AI Auto-Reply", desc: "Train AI on your FAQ, products, and policies. It handles 60% of inbound queries without human intervention.", color: "blue", stat: "60%", statLabel: "auto-resolved" },
  { icon: <Kanban size={22} />, title: "Sales Pipeline", desc: "Drag-and-drop Kanban boards linked to live WhatsApp chats. See every deal's status at a glance.", color: "emerald", stat: "3×", statLabel: "faster closes" },
  { icon: <Megaphone size={22} />, title: "Smart Broadcasts", desc: "Segment your contacts and send targeted campaigns with real-time read, click, and reply analytics.", color: "amber", stat: "40%", statLabel: "higher open rates" },
  { icon: <Users size={22} />, title: "Contact CRM", desc: "Rich profiles with conversation history, custom tags, pipeline stage, and automated follow-up triggers.", color: "rose", stat: "20h", statLabel: "saved per week" },
  { icon: <Zap size={22} />, title: "Flow Builder", desc: "Visual no-code builder to create keyword triggers, drip sequences, and multi-step chatbot conversations.", color: "cyan", stat: "30 min", statLabel: "to set up" },
];

const METRICS = [
  { value: "12,500+", label: "Conversations automated" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 5 min", label: "Avg response time" },
];

/* ─── component ─────────────────────────────────────── */
export default function LandingPage() {
  const { mode, toggleMode } = useTheme();
  const [yearly, setYearly] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp-root">
      {/* ─── SCHEMA MARKUP ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Autozee",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "url": "https://autozee.ai",
            "offers": {
              "@type": "Offer",
              "price": "499",
              "priceCurrency": "INR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "6"
            }
          })
        }}
      />
      <div className="lp-noise" aria-hidden="true" />

      {/* ─── NAV ─── */}
      <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo">
            <div className="lp-logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white"/>
                <path d="M12 0C5.374 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.83L.057 23.215a.75.75 0 00.92.908l5.42-1.458A11.945 11.945 0 0012 24c6.626 0 12-5.373 12-12S18.626 0 12 0z" fill="white" fillOpacity="0.3"/>
              </svg>
            </div>
            <span className="lp-logo-name">Autozee.ai</span>
          </Link>

          <div className="lp-nav-center">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how" className="lp-nav-link">How it works</a>
            <a href="#testimonials" className="lp-nav-link">Reviews</a>
            <a href="#pricing" className="lp-nav-link">Pricing</a>
            <a href="#contact" className="lp-nav-link">Contact</a>
            <button onClick={() => setShowPrivacy(true)} className="lp-nav-link" style={{background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit'}}>Privacy</button>
          </div>

          <div className="lp-nav-right">
            <button onClick={toggleMode} className="lp-nav-theme-toggle" aria-label="Toggle theme">
              {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" className="lp-nav-signin">Sign in</Link>
            <Link href="/login" className="lp-nav-cta">
              Get started free
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="lp-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="orb orb-1" aria-hidden="true" />
        <div className="orb orb-2" aria-hidden="true" />
        <div className="orb orb-3" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            <span>Official Meta Business Partner · WhatsApp Cloud API</span>
          </div>

          <h1 className="hero-h1">
            Turn WhatsApp into<br/>
            <span className="hero-gradient">your revenue engine</span>
          </h1>

          <p className="hero-sub">
            Unified inbox, AI automation, broadcast campaigns, and sales pipeline —
            all in one WhatsApp CRM built for Indian businesses.
          </p>

          <div className="hero-ctas">
            <Link href="/login" className="hero-cta-primary">
              Start free trial — 7 days
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#features" className="hero-cta-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              See how it works
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-avatars">
              {["P","R","S","A","K"].map((l, i) => (
                <div key={i} className="hero-avatar" style={{zIndex:5-i, marginLeft: i===0?0:"-10px"}}>{l}</div>
              ))}
            </div>
            <div>
              <p className="hero-trust-main">Businesses <strong>trust</strong> Autozee</p>
              <div className="hero-stars-row">
                {"★★★★★".split("").map((s,i) => <span key={i} style={{color:"#fbbf24",fontSize:"0.75rem"}}>{s}</span>)}
                <span className="hero-trust-rating">4.9 / 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* dashboard mockup */}
        <div className="hero-mockup-wrap">
          <div className="hero-mockup">
            {/* window bar */}
            <div className="hm-bar">
              <div className="hm-bar-dots">
                <span className="hm-dot" style={{background:"#ff5f57"}}/>
                <span className="hm-dot" style={{background:"#febc2e"}}/>
                <span className="hm-dot" style={{background:"#28c840"}}/>
              </div>
              <div className="hm-bar-url">app.autozee.ai/inbox</div>
              <div className="hm-bar-status">
                <span className="hm-live-dot"/>Live
              </div>
            </div>

            {/* app layout */}
            <div className="hm-body">
              {/* sidebar */}
              <div className="hm-sidebar">
                <div 
                  className="hm-s-logo" 
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 12px rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white"/>
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.83L.057 23.215a.75.75 0 00.92.908l5.42-1.458A11.945 11.945 0 0012 24c6.626 0 12-5.373 12-12S18.626 0 12 0z" fill="white" fillOpacity="0.3"/>
                  </svg>
                </div>
                {[
                  {icon:<MessageSquare size={16} />,label:"Inbox",badge:"12",active:true},
                  {icon:<Kanban size={16} />,label:"Pipeline",badge:null,active:false},
                  {icon:<Users size={16} />,label:"Contacts",badge:null,active:false},
                  {icon:<Megaphone size={16} />,label:"Broadcast",badge:null,active:false},
                  {icon:<Zap size={16} />,label:"Flows",badge:null,active:false},
                ].map(item => (
                  <div key={item.label} className={`hm-nav-item ${item.active ? "hm-nav-item--active" : ""}`}>
                    <span className="hm-nav-icon">{item.icon}</span>
                    <span className="hm-nav-label">{item.label}</span>
                    {item.badge && <span className="hm-badge">{item.badge}</span>}
                  </div>
                ))}
              </div>

              {/* conversation list */}
              <div className="hm-convlist">
                <div className="hm-convlist-header">
                  <span>All conversations</span>
                  <span className="hm-convlist-count">12</span>
                </div>
                {[
                  {name:"Priya Sharma",msg:"Interested in Pro plan 👀",time:"2m",unread:true,tag:"Hot lead"},
                  {name:"Rahul M.",msg:"When can we schedule a call?",time:"15m",unread:true,tag:null},
                  {name:"Sneha P.",msg:"Invoice received, thanks!",time:"1h",unread:false,tag:"Customer"},
                  {name:"Arjun K.",msg:"Can you send the pricing?",time:"2h",unread:false,tag:null},
                ].map((c,i)=>(
                  <div key={i} className={`hm-conv ${i===0?"hm-conv--active":""}`}>
                    <div className="hm-conv-avatar">{c.name[0]}</div>
                    <div className="hm-conv-body">
                      <div className="hm-conv-row1">
                        <span className="hm-conv-name">{c.name}</span>
                        <span className="hm-conv-time">{c.time}</span>
                      </div>
                      <div className="hm-conv-row2">
                        <span className="hm-conv-msg">{c.msg}</span>
                        {c.unread && <span className="hm-conv-dot"/>}
                      </div>
                      {c.tag && <span className="hm-conv-tag">{c.tag}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* chat pane */}
              <div className="hm-chat">
                <div className="hm-chat-header">
                  <div className="hm-chat-avatar">P</div>
                  <div>
                    <div className="hm-chat-name">Priya Sharma</div>
                    <div className="hm-chat-sub">🟢 Online · Hot lead</div>
                  </div>
                  <div style={{marginLeft:"auto",display:"flex",gap:"0.5rem"}}>
                    <div className="hm-chat-action">Assign</div>
                    <div className="hm-chat-action hm-chat-action--resolve">Resolve</div>
                  </div>
                </div>
                <div className="hm-chat-msgs">
                  <div className="hm-msg hm-msg--in">Hi! I&apos;m interested in the Pro plan. What&apos;s included? 👋</div>
                  <div className="hm-msg hm-msg--out">Hi Priya! Great choice — Pro is our most popular. You get unlimited flows, 10,000 broadcast messages, and 3 seats. Want a quick demo?</div>
                  <div className="hm-msg hm-msg--in">Yes please! When are you free?</div>
                  <div className="hm-typing"><span/><span/><span/></div>
                </div>
                <div className="hm-chat-input">
                  <div className="hm-chat-input-box">Type a message…</div>
                  <div className="hm-chat-send">➤</div>
                </div>
              </div>
            </div>
          </div>

          {/* floating stat cards */}
          <div className="hm-float hm-float-1">
            <div className="hm-float-icon"><TrendingUp size={20} /></div>
            <div>
              <div className="hm-float-val">+143%</div>
              <div className="hm-float-label">Revenue this month</div>
            </div>
          </div>
          <div className="hm-float hm-float-2">
            <div className="hm-float-icon"><Zap size={20} /></div>
            <div>
              <div className="hm-float-val">4 min</div>
              <div className="hm-float-label">Avg response time</div>
            </div>
          </div>
          <div className="hm-float hm-float-3">
            <div className="hm-float-icon-sm"><Bot size={16} /></div>
            <div>
              <div className="hm-float-val-sm">AI replied</div>
              <div className="hm-float-label">2 sec ago</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGO MARQUEE ─── */}
      <div className="lp-marquee-wrap">
        <p className="lp-marquee-eyebrow">Trusted by teams at</p>
        <div className="lp-marquee-fade lp-marquee-fade--left" aria-hidden="true"/>
        <div className="lp-marquee">
          <div className="lp-marquee-track">
            {[...LOGOS,...LOGOS].map((l,i)=>(
              <div key={i} className="lp-marquee-logo">{l}</div>
            ))}
          </div>
        </div>
        <div className="lp-marquee-fade lp-marquee-fade--right" aria-hidden="true"/>
      </div>

      {/* ─── METRICS STRIP ─── */}
      <div className="metrics-strip">
        {METRICS.map((m,i) => (
          <div key={i} className="metric-item">
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">Platform features</div>
          <h2 className="lp-h2">Everything your team needs<br/>to win on WhatsApp</h2>
          <p className="lp-h2-sub">One platform. Zero tab-switching. Maximum conversions.</p>

          <div className="feat-grid">
            {FEATURES.map(f => (
              <div key={f.title} className={`feat-card feat-card--${f.color}`}>
                <div className="feat-card-top">
                  <div className="feat-icon-wrap">
                    <span className="feat-icon">{f.icon}</span>
                  </div>
                  <div className="feat-stat-wrap">
                    <div className="feat-stat-val">{f.stat}</div>
                    <div className="feat-stat-label">{f.statLabel}</div>
                  </div>
                </div>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="lp-section lp-section--alt">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">How it works</div>
          <h2 className="lp-h2">Up and running<br/>in under 30 minutes</h2>

          <div className="steps-grid">
            {[
              {n:"01", icon:<Link2 size={24} />, title:"Connect WhatsApp", desc:"Link your WhatsApp Business number via the official Meta Cloud API. Verified, secure, zero risk of account bans."},
              {n:"02", icon:<ClipboardList size={24} />, title:"Import Contacts", desc:"Bring your existing contacts via CSV or sync from Google Sheets, HubSpot, or any CRM in minutes."},
              {n:"03", icon:<Zap size={24} />, title:"Build Automations", desc:"Use our visual flow builder to automate welcome messages, follow-ups, lead qualification, and more."},
              {n:"04", icon:<TrendingUp size={24} />, title:"Close More Deals", desc:"Watch your pipeline fill up. Track every deal, reply to hot leads instantly, and hit your revenue targets."},
            ].map((s, i) => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <div className="step-icon-wrap">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
                {i < 3 && <div className="step-connector" aria-hidden="true"/>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">Customer stories</div>
          <h2 className="lp-h2">Loved by our customers</h2>

          <div className="testi-grid">
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className={`testi-card ${i===1?"testi-card--featured":""}`}>
                <div className="testi-stars">
                  {"★★★★★".split("").map((s,j)=><span key={j} className="testi-star">{s}</span>)}
                </div>
                <p className="testi-body">&quot;{t.body}&quot;</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.avatar}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role} · <span className="testi-company">{t.company}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="lp-section lp-section--alt">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">Pricing</div>
          <h2 className="lp-h2">Simple, transparent pricing</h2>
          <p className="lp-h2-sub">Start with a 7-day free trial. No credit card required. Cancel anytime.</p>

          {/* toggle */}
          <div className="price-toggle-wrap">
            <span className={`price-toggle-label ${!yearly?"price-toggle-label--on":""}`}>Monthly</span>
            <button
              id="billing-toggle"
              role="switch"
              aria-checked={yearly}
              onClick={()=>setYearly(v=>!v)}
              className={`price-switch ${yearly?"price-switch--on":""}`}
            >
              <span className="price-switch-thumb"/>
            </button>
            <span className={`price-toggle-label ${yearly?"price-toggle-label--on":""}`}>
              Yearly
              <span className="price-save-badge">Save 20%</span>
            </span>
          </div>

          <div className="price-grid">
            {PLANS.map(plan => {
              const displayPrice = yearly ? plan.yearlyPerMonth : plan.monthly;
              return (
                <div key={plan.name} className={`price-card ${plan.highlight?"price-card--hl":""}`}>
                  {plan.highlight && <div className="price-card-glow" aria-hidden="true"/>}
                  {plan.badge && <div className="price-badge">{plan.badge}</div>}

                  <div className="price-top">
                    <div className="price-name">{plan.name}</div>
                    <div className="price-desc">{plan.desc}</div>
                    <div className="price-amount-row">
                      <span className="price-currency">₹</span>
                      <span className="price-amount">{displayPrice.toLocaleString("en-IN")}</span>
                      <span className="price-per">/mo</span>
                    </div>
                    {yearly && (
                      <div className="price-yearly-note">
                        Billed ₹{plan.yearly.toLocaleString("en-IN")} annually — save 20%
                      </div>
                    )}
                    <div className="price-tax-note">Incl. 15% Markup</div>
                  </div>

                  <ul className="price-feats">
                    {plan.features.map(f => (
                      <li key={f} className="price-feat">
                        <svg className="price-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                    {plan.notIncluded.map(f => (
                      <li key={f} className="price-feat price-feat--no">
                        <svg className="price-cross" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/login" className={plan.highlight?"price-cta-hl":"price-cta"}>
                    {plan.cta}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="price-enterprise">
            <div className="price-enterprise-inner">
              <div>
                <p className="price-enterprise-title">Need a custom plan?</p>
                <p className="price-enterprise-sub">For agencies, franchises, or 100K+ contact databases — we&apos;ll build something tailored.</p>
              </div>
              <a href="mailto:sales@autozee.ai" className="price-enterprise-cta">Talk to sales →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT FORM ─── */}
      <section id="contact" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">Get in touch</div>
          <h2 className="lp-h2">Have questions? Let&apos;s talk</h2>
          <p className="lp-h2-sub">Fill out the form below or call us at <strong>+91 7603917369</strong> and our team will get back to you shortly.</p>

          <div className="contact-wrap">
            <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! We will get back to you shortly."); }}>
              <div className="contact-group">
                <label>Name</label>
                <input type="text" required placeholder="John Doe" />
              </div>
              <div className="contact-group">
                <label>Contact Number</label>
                <input type="tel" required placeholder="+91 9876543210" />
              </div>
              <div className="contact-group">
                <label>Email</label>
                <input type="email" required placeholder="john@company.com" />
              </div>
              <div className="contact-group">
                <label>Message</label>
                <textarea required placeholder="How can we help you?" rows={4}></textarea>
              </div>
              <button type="submit" className="hero-cta-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="lp-final-cta">
        <div className="final-cta-orb final-cta-orb-1" aria-hidden="true"/>
        <div className="final-cta-orb final-cta-orb-2" aria-hidden="true"/>
        <div className="final-cta-inner">
          <div className="final-cta-badge">
            <span className="final-cta-badge-dot"/>
            7-day free trial · No credit card
          </div>
          <h2 className="final-cta-h2">
            Your competitors are already<br/>
            <span className="hero-gradient">closing deals on WhatsApp</span>
          </h2>
          <p className="final-cta-sub">
            Join businesses using Autozee to convert every WhatsApp conversation into revenue. Takes 30 minutes to set up.
          </p>
          <div className="final-cta-actions">
            <Link href="/login" className="hero-cta-primary hero-cta-primary--xl">
              Start your free trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <div className="final-cta-trust">
              <span>✓ No credit card</span>
              <span>✓ Cancel anytime</span>
              <span>✓ Live in 30 min</span>
            </div>
            <Link href="/login" className="final-cta-signin">Already have an account? Sign in →</Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <Link href="/" className="lp-logo">
              <div className="lp-logo-mark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white"/>
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.83L.057 23.215a.75.75 0 00.92.908l5.42-1.458A11.945 11.945 0 0012 24c6.626 0 12-5.373 12-12S18.626 0 12 0z" fill="white" fillOpacity="0.3"/>
                </svg>
              </div>
              <span className="lp-logo-name">Autozee.ai</span>
            </Link>
            <p className="lp-footer-tagline">The WhatsApp CRM built for India&apos;s growing businesses.</p>
            <div className="lp-footer-meta-badge">Official Meta Business Partner</div>
          </div>

          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Product</div>
              <a href="#features" className="lp-footer-link">Features</a>
              <a href="#pricing" className="lp-footer-link">Pricing</a>
              <a href="#how" className="lp-footer-link">How it works</a>
              <a href="#testimonials" className="lp-footer-link">Reviews</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Company</div>
              <a href="#" className="lp-footer-link">About us</a>
              <a href="#" className="lp-footer-link">Blog</a>
              <a href="mailto:support@autozee.ai" className="lp-footer-link">Support</a>
              <a href="mailto:sales@autozee.ai" className="lp-footer-link">Contact sales</a>
              <a href="tel:+917603917369" className="lp-footer-link">Call: +91 7603917369</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Legal</div>
              <button onClick={() => setShowPrivacy(true)} className="lp-footer-link" style={{background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0}}>Privacy Policy</button>
              <button onClick={() => setShowPrivacy(true)} className="lp-footer-link" style={{background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0}}>Terms of Service</button>
              <button onClick={() => setShowPrivacy(true)} className="lp-footer-link" style={{background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0}}>Cookie Policy</button>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} zeenox. All rights reserved.</p>
          <p>Made with ❤️ in India · Powered by WhatsApp Cloud API</p>
        </div>
      </footer>

      {showPrivacy && (
        <div className="privacy-popup">
          <div className="privacy-popup-inner">
            <div className="privacy-popup-content">
              <h4>Privacy & Terms</h4>
              <p>We use cookies to improve your experience and securely provide our CRM services. By using Zeenox, you agree to our Terms of Service and Privacy Policy. We never sell your data to third parties.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} className="privacy-popup-btn">Got it</button>
          </div>
        </div>
      )}

      {/* ─── WHATSAPP FLOATING WIDGET ─── */}
      <WhatsAppWidget />

      {/* ─── STYLES ─── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          --lp-bg: #07090f;
          --lp-fg: #e2e8f0;
          --lp-fg-strong: #f8fafc;
          --lp-nav-bg: rgba(7,9,15,0.85);
          --lp-border: rgba(255,255,255,0.06);
          --lp-border-light: rgba(255,255,255,0.15);
          --lp-card-bg: rgba(255,255,255,0.025);
          --lp-card-hover: rgba(255,255,255,0.05);
          --lp-mockup-bg: #0d1422;
          --lp-mockup-bar: #111827;
          --lp-muted: rgba(148,163,184,0.7);

          --lp-noise-opacity: 0.4;
          --lp-pill-bg: rgba(16,185,129,0.1);
          --lp-pill-border: rgba(16,185,129,0.25);
          --lp-pill-text: rgba(110,231,183,0.9);
          --lp-grad-1: #34d399;
          --lp-grad-2: #4ade80;
          --lp-grad-3: #2dd4bf;
          --lp-orb-1: rgba(16,185,129,0.16);
          --lp-orb-2: rgba(34,197,94,0.12);
          --lp-orb-3: rgba(20,184,166,0.08);
          --lp-btn-bg-1: #10b981;
          --lp-btn-bg-2: #059669;
          --lp-btn-shadow: rgba(16,185,129,0.45);
          --lp-btn-shadow-hover: rgba(16,185,129,0.6);
          --lp-float-bg: rgba(13,20,34,0.92);
          --lp-float-shadow: rgba(0,0,0,0.5);
          --lp-mockup-shadow: rgba(0,0,0,0.65);
          --lp-mockup-border: rgba(16,185,129,0.08);

          position: relative; min-height: 100vh;
          background: var(--lp-bg);
          color: var(--lp-fg);
          font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
          overflow-x: hidden;
        }

        html[data-mode="light"] .lp-root {
          --lp-bg: #ffffff;
          --lp-fg: #334155;
          --lp-fg-strong: #0f172a;
          --lp-nav-bg: rgba(255,255,255,0.85);
          --lp-border: rgba(0,0,0,0.08);
          --lp-border-light: rgba(0,0,0,0.15);
          --lp-card-bg: rgba(0,0,0,0.02);
          --lp-card-hover: rgba(0,0,0,0.05);
          --lp-mockup-bg: #f8fafc;
          --lp-mockup-bar: #f1f5f9;
          --lp-muted: rgba(71,85,105,0.8);

          --lp-noise-opacity: 0.25;
          --lp-pill-bg: rgba(16,185,129,0.08);
          --lp-pill-border: rgba(16,185,129,0.15);
          --lp-pill-text: #047857;
          --lp-grad-1: var(--lp-btn-bg-1);
          --lp-grad-2: var(--lp-btn-bg-2);
          --lp-grad-3: #0f766e;
          --lp-orb-1: rgba(16,185,129,0.07);
          --lp-orb-2: rgba(34,197,94,0.05);
          --lp-orb-3: rgba(20,184,166,0.04);
          --lp-btn-bg-1: #059669;
          --lp-btn-bg-2: #047857;
          --lp-btn-shadow: var(--lp-pill-border);
          --lp-btn-shadow-hover: rgba(16,185,129,0.35);
          --lp-float-bg: rgba(255,255,255,0.92);
          --lp-float-shadow: rgba(0,0,0,0.1);
          --lp-mockup-shadow: rgba(0,0,0,0.15);
          --lp-mockup-border: rgba(16,185,129,0.15);
        }

        .lp-nav-theme-toggle {
          background: transparent; border: none; color: var(--lp-fg-strong);
          cursor: pointer; padding: 0.4rem; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .lp-nav-theme-toggle:hover { background: var(--lp-card-hover); color: var(--lp-fg-strong); }

        .lp-noise {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 256px; opacity: var(--lp-noise-opacity);
        }

        /* ── nav ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s;
        }
        .lp-nav--scrolled {
          background: var(--lp-nav-bg);
          backdrop-filter: blur(24px) saturate(200%);
          border-bottom: 1px solid var(--lp-border);
        }
        .lp-nav-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 2rem;
          height: 70px; display: flex; align-items: center;
        }
        .lp-logo { display: flex; align-items: center; gap: 0.65rem; text-decoration: none; flex-shrink: 0; }
        .lp-logo-mark {
          width: 38px; height: 38px; border-radius: 11px;
          background: linear-gradient(135deg, var(--lp-btn-bg-1), var(--lp-btn-bg-2));
          box-shadow: 0 0 24px rgba(124,58,237,0.45);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lp-logo-name { font-size: 1.15rem; font-weight: 800; color: var(--lp-fg-strong); letter-spacing: -var(--lp-noise-opacity)px; }
        .lp-nav-center { display: flex; align-items: center; gap: 0.15rem; margin: 0 auto; }
        .lp-nav-link {
          padding: 0.45rem 0.95rem; font-size: 0.875rem;
          color: var(--lp-fg); text-decoration: none;
          border-radius: 8px; transition: color 0.15s, background 0.15s;
          font-weight: 500;
        }
        .lp-nav-link:hover { color: var(--lp-fg-strong); background: var(--lp-border); }
        .lp-nav-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .lp-nav-signin {
          padding: 0.45rem 1rem; font-size: 0.875rem; font-weight: 500;
          color: var(--lp-fg); text-decoration: none;
          border-radius: 8px; transition: color 0.15s;
        }
        .lp-nav-signin:hover { color: var(--lp-fg-strong); }
        .lp-nav-cta {
          display: flex; align-items: center; gap: 0.45rem;
          padding: 0.5rem 1.15rem; font-size: 0.875rem; font-weight: 600;
          background: linear-gradient(135deg, var(--lp-btn-bg-1), var(--lp-btn-bg-2));
          color: #fff; text-decoration: none; border-radius: 10px;
          box-shadow: 0 0 24px var(--lp-btn-shadow);
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .lp-nav-cta:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 28px var(--lp-btn-shadow-hover); }

        /* ── hero ── */
        .lp-hero {
          position: relative; min-height: 100vh;
          display: flex; align-items: center;
          padding: 110px 2rem 5rem;
          max-width: 1280px; margin: 0 auto;
          gap: 4rem;
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(var(--lp-card-bg) 1px, transparent 1px),
            linear-gradient(90deg, var(--lp-card-bg) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(ellipse 90% 70% at 50% 40%, black, transparent);
        }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(130px); pointer-events: none;
          animation: orbFloat 14s ease-in-out infinite;
        }
        .orb-1 { width: 750px; height: 750px; background: var(--lp-orb-1); top: -120px; left: -250px; }
        .orb-2 { width: 550px; height: 550px; background: var(--lp-orb-2); top: 80px; right: -180px; animation-delay: 5s; }
        .orb-3 { width: 400px; height: 400px; background: var(--lp-orb-3); bottom: 0; left: 35%; animation-delay: 9s; }
        @keyframes orbFloat {
          0%,100%{transform:translate(0,0) scale(1)}
          33%{transform:translate(18px,-28px) scale(1.03)}
          66%{transform:translate(-12px,18px) scale(0.97)}
        }

        .hero-content { position: relative; z-index: 1; flex: 0 0 500px; display: flex; flex-direction: column; gap: 1.75rem; }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.4rem 0.9rem 0.4rem 0.65rem;
          background: var(--lp-pill-bg);
          border: 1px solid var(--lp-pill-border);
          border-radius: 999px;
          font-size: 0.78rem; font-weight: 600;
          color: var(--lp-pill-text);
          width: fit-content;
        }
        .hero-eyebrow-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 9px #4ade80;
          animation: pillPulse 2s ease-in-out infinite; flex-shrink: 0;
        }
        @keyframes pillPulse {
          0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)}
        }

        .hero-h1 {
          font-size: clamp(2.8rem, 4.8vw, 4rem);
          font-weight: 900; line-height: 1.06; letter-spacing: -0.055em;
          color: var(--lp-fg-strong);
        }
        .hero-gradient {
          background: linear-gradient(135deg, var(--lp-grad-1) 0%, var(--lp-grad-2) 35%, var(--lp-grad-3) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          font-size: 1.05rem; line-height: 1.8; color: var(--lp-muted);
          max-width: 450px;
        }
        .hero-ctas { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }
        .hero-cta-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 1.85rem;
          background: linear-gradient(135deg, var(--lp-btn-bg-1), var(--lp-btn-bg-2));
          color: #fff; font-size: 0.95rem; font-weight: 700;
          text-decoration: none; border-radius: 13px;
          box-shadow: 0 6px 36px var(--lp-btn-shadow);
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: -0.01em;
        }
        .hero-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 48px var(--lp-btn-shadow-hover); }
        .hero-cta-primary--xl { padding: 1rem 2.2rem; font-size: 1.05rem; }
        .hero-cta-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 1.6rem;
          background: var(--lp-border);
          border: 1px solid var(--lp-border-light);
          color: var(--lp-fg); font-size: 0.95rem; font-weight: 500;
          text-decoration: none; border-radius: 13px;
          transition: background 0.15s, color 0.15s;
          backdrop-filter: blur(8px);
        }
        .hero-cta-ghost:hover { background: var(--lp-border); color: var(--lp-fg-strong); }

        .hero-trust { display: flex; align-items: center; gap: 1rem; }
        .hero-avatars { display: flex; }
        .hero-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, var(--lp-btn-bg-1), var(--lp-btn-bg-2));
          border: 2px solid var(--lp-bg);
          color: #fff; font-size: 0.65rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .hero-trust-main { font-size: 0.82rem; color: var(--lp-muted); }
        .hero-trust-main strong { color: var(--lp-fg-strong); }
        .hero-stars-row { display: flex; align-items: center; gap: 3px; margin-top: 2px; }
        .hero-trust-rating { font-size: 0.72rem; color: var(--lp-muted); margin-left: 4px; font-weight: 600; }

        /* ── mockup ── */
        .hero-mockup-wrap { position: relative; flex: 1; z-index: 1; min-width: 0; }
        .hero-mockup {
          border-radius: 18px; overflow: hidden;
          border: 1px solid var(--lp-border);
          background: var(--lp-mockup-bg);
          box-shadow: 0 60px 180px var(--lp-mockup-shadow), 0 0 0 1px var(--lp-mockup-border);
        }
        .hm-bar {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.65rem 1rem;
          background: var(--lp-mockup-bar); border-bottom: 1px solid var(--lp-border);
        }
        .hm-bar-dots { display: flex; gap: 5px; }
        .hm-dot { width: 10px; height: 10px; border-radius: 50%; display: block; }
        .hm-bar-url {
          flex: 1; text-align: center;
          font-size: 0.7rem; color: var(--lp-muted); font-weight: 500;
          background: var(--lp-border); border-radius: 6px;
          padding: 0.2rem 0.6rem; border: 1px solid var(--lp-border);
        }
        .hm-bar-status {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.68rem; font-weight: 600; color: #4ade80;
        }
        .hm-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
          box-shadow: 0 0 8px #4ade80; animation: pillPulse 2s ease-in-out infinite;
        }
        .hm-body { display: flex; height: 300px; }

        .hm-sidebar {
          width: 58px; padding: 0.6rem 0.4rem;
          border-right: 1px solid var(--lp-border);
          display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
          flex-shrink: 0;
        }
        .hm-s-logo {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg,var(--lp-btn-bg-1),var(--lp-btn-bg-2));
          color: #fff; font-size: 0.7rem; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.5rem;
        }
        .hm-nav-item {
          width: 100%; display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 0.4rem 0.2rem; border-radius: 8px;
          cursor: default; position: relative;
        }
        .hm-nav-item--active { background: rgba(124,58,237,0.15); }
        .hm-nav-icon { font-size: 0.95rem; line-height: 1; }
        .hm-nav-label { font-size: 0.55rem; color: var(--lp-muted); font-weight: 500; }
        .hm-nav-item--active .hm-nav-label { color: var(--lp-grad-1); }
        .hm-badge {
          position: absolute; top: 4px; right: 4px;
          background: var(--lp-btn-bg-1); color: #fff;
          font-size: 0.5rem; font-weight: 800;
          padding: 1px 4px; border-radius: 999px;
          min-width: 14px; text-align: center;
        }

        .hm-convlist {
          width: 170px; border-right: 1px solid var(--lp-border);
          overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column;
        }
        .hm-convlist-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0.7rem 0.5rem;
          font-size: 0.68rem; font-weight: 700; color: var(--lp-muted);
          border-bottom: 1px solid var(--lp-border);
        }
        .hm-convlist-count {
          background: rgba(124,58,237,0.15); color: var(--lp-grad-1);
          font-size: 0.58rem; font-weight: 700;
          padding: 0.15rem 0.45rem; border-radius: 999px;
        }
        .hm-conv {
          display: flex; align-items: flex-start; gap: 0.5rem;
          padding: 0.55rem 0.7rem; cursor: default;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .hm-conv--active { background: rgba(124,58,237,0.08); }
        .hm-conv-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg,var(--lp-btn-bg-1),var(--lp-btn-bg-2));
          color: #fff; font-size: 0.65rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .hm-conv-body { flex: 1; min-width: 0; }
        .hm-conv-row1 { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
        .hm-conv-name { font-size: 0.68rem; font-weight: 700; color: var(--lp-fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hm-conv-time { font-size: 0.58rem; color: var(--lp-muted); flex-shrink: 0; }
        .hm-conv-row2 { display: flex; align-items: center; justify-content: space-between; margin-top: 1px; }
        .hm-conv-msg { font-size: 0.62rem; color: var(--lp-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; }
        .hm-conv-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--lp-btn-bg-1); flex-shrink: 0; }
        .hm-conv-tag {
          display: inline-block; margin-top: 3px;
          font-size: 0.54rem; font-weight: 700; padding: 1px 5px;
          border-radius: 999px; background: rgba(245,158,11,0.15);
          color: #fbbf24; border: 1px solid rgba(245,158,11,0.2);
        }

        .hm-chat { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
        .hm-chat-header {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--lp-border);
          flex-shrink: 0;
        }
        .hm-chat-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg,var(--lp-btn-bg-1),var(--lp-btn-bg-2));
          color: #fff; font-size: 0.7rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .hm-chat-name { font-size: 0.72rem; font-weight: 700; color: var(--lp-fg-strong); }
        .hm-chat-sub { font-size: 0.6rem; color: var(--lp-muted); margin-top: 1px; }
        .hm-chat-action {
          font-size: 0.6rem; font-weight: 600; padding: 0.2rem 0.5rem;
          border-radius: 6px; background: var(--lp-border);
          border: 1px solid var(--lp-border);
          color: var(--lp-muted); cursor: default;
        }
        .hm-chat-action--resolve { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.2); color: #4ade80; }
        .hm-chat-msgs { flex: 1; padding: 0.65rem; display: flex; flex-direction: column; gap: 0.4rem; overflow: hidden; }
        .hm-msg { max-width: 82%; padding: 0.38rem 0.65rem; border-radius: 10px; font-size: 0.68rem; line-height: 1.5; }
        .hm-msg--in { background: var(--lp-border); color: var(--lp-fg); align-self: flex-start; border-bottom-left-radius: 3px; }
        .hm-msg--out { background: linear-gradient(135deg,var(--lp-btn-bg-1),var(--lp-btn-bg-2)); color: #fff; align-self: flex-end; border-bottom-right-radius: 3px; }
        .hm-typing {
          display: flex; align-items: center; gap: 3px;
          padding: 0.42rem 0.65rem; background: var(--lp-border);
          border-radius: 10px; border-bottom-left-radius: 3px;
          width: fit-content; align-self: flex-start;
        }
        .hm-typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--lp-muted); animation: typDot 1.3s ease-in-out infinite; }
        .hm-typing span:nth-child(2){animation-delay:0.2s} .hm-typing span:nth-child(3){animation-delay:0.4s}
        @keyframes typDot{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-4px);opacity:1}}
        .hm-chat-input {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 0.7rem; border-top: 1px solid var(--lp-border); flex-shrink: 0;
        }
        .hm-chat-input-box {
          flex: 1; background: var(--lp-border); border: 1px solid var(--lp-border);
          border-radius: 8px; padding: 0.3rem 0.6rem;
          font-size: 0.63rem; color: var(--lp-muted);
        }
        .hm-chat-send {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg,var(--lp-btn-bg-1),var(--lp-btn-bg-2));
          color: #fff; font-size: 0.65rem;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* floating cards */
        .hm-float {
          position: absolute; display: flex; align-items: center; gap: 0.65rem;
          padding: 0.75rem 1rem; border-radius: 14px;
          background: var(--lp-float-bg); backdrop-filter: blur(16px);
          border: 1px solid var(--lp-border);
          box-shadow: 0 20px 60px var(--lp-float-shadow);
          animation: floatCard 6s ease-in-out infinite;
        }
        .hm-float-1 { bottom: -22px; left: -28px; animation-delay: 0s; }
        .hm-float-2 { top: -18px; right: -22px; animation-delay: 3s; }
        .hm-float-3 { bottom: 60px; right: -32px; padding: 0.5rem 0.75rem; animation-delay: 1.5s; }
        @keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .hm-float-icon { font-size: 1.3rem; }
        .hm-float-val { font-size: 1.05rem; font-weight: 900; color: var(--lp-fg-strong); letter-spacing: -0.05em; }
        .hm-float-label { font-size: 0.65rem; color: var(--lp-muted); margin-top: 1px; }
        .hm-float-icon-sm { font-size: 1rem; }
        .hm-float-val-sm { font-size: 0.72rem; font-weight: 700; color: #4ade80; }

        /* ── marquee ── */
        .lp-marquee-wrap {
          position: relative; padding: 2.5rem 0;
          border-top: 1px solid var(--lp-border);
          border-bottom: 1px solid var(--lp-border);
          overflow: hidden;
        }
        .lp-marquee-eyebrow {
          text-align: center; margin-bottom: 1.25rem;
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--lp-muted);
        }
        .lp-marquee-fade { position: absolute; top: 0; bottom: 0; width: 140px; z-index: 2; pointer-events: none; }
        .lp-marquee-fade--left { left: 0; background: linear-gradient(90deg, var(--lp-bg), transparent); }
        .lp-marquee-fade--right { right: 0; background: linear-gradient(-90deg, var(--lp-bg), transparent); }
        .lp-marquee { overflow: hidden; }
        .lp-marquee-track { display: flex; gap: 2.5rem; width: max-content; animation: marquee 28s linear infinite; }
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .lp-marquee-logo {
          padding: 0.5rem 1.5rem; border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--lp-border);
          font-size: 0.83rem; font-weight: 700;
          color: var(--lp-muted);
          white-space: nowrap; letter-spacing: 0.01em;
        }

        /* ── metrics strip ── */
        .metrics-strip {
          display: grid; grid-template-columns: repeat(4,1fr);
          max-width: 1280px; margin: 0 auto;
          padding: 4rem 2rem; gap: 1px;
          border-bottom: 1px solid var(--lp-border);
        }
        .metric-item {
          text-align: center; padding: 2rem 1rem;
          border-right: 1px solid var(--lp-border);
        }
        .metric-item:last-child { border-right: none; }
        .metric-value {
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 900; letter-spacing: -0.05em; color: var(--lp-fg-strong);
          background: linear-gradient(135deg,var(--lp-grad-1),var(--lp-grad-3));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .metric-label { font-size: 0.85rem; color: var(--lp-muted); margin-top: 0.4rem; font-weight: 500; }

        /* ── shared section ── */
        .lp-section { position: relative; z-index: 1; }
        .lp-section--alt {
          background: rgba(255,255,255,0.012);
          border-top: 1px solid var(--lp-border);
          border-bottom: 1px solid var(--lp-border);
        }
        .lp-section-inner { max-width: 1280px; margin: 0 auto; padding: 7rem 2rem; text-align: center; }
        .lp-eyebrow {
          display: inline-block; margin-bottom: 1.1rem;
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--lp-grad-2);
          padding: 0.3rem 0.8rem; border-radius: 999px;
          background: rgba(129,140,248,0.1); border: 1px solid rgba(129,140,248,0.2);
        }
        .lp-h2 {
          font-size: clamp(1.85rem, 3.5vw, 2.75rem);
          font-weight: 900; letter-spacing: -0.045em; color: var(--lp-fg-strong);
          line-height: 1.1; margin-bottom: 1.1rem;
        }
        .lp-h2-sub { font-size: 1.05rem; color: var(--lp-muted); line-height: 1.75; max-width: 520px; margin: 0 auto 3.5rem; }

        /* ── features ── */
        .feat-grid {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem;
          text-align: left;
        }
        .feat-card {
          padding: 2.5rem 2rem;
          background: var(--lp-card-bg);
          backdrop-filter: blur(24px) saturate(200%);
          border-radius: 24px;
          border: 1px solid var(--lp-border-light);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .feat-card:hover { 
          transform: translateY(-4px); 
          background: var(--lp-card-hover); 
          border-color: var(--lp-pill-border);
          box-shadow: 0 24px 60px rgba(0,0,0,0.08);
        }
        .feat-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.1rem; }
        .feat-icon-wrap {
          width: 46px; height: 46px; border-radius: 12px;
          background: var(--lp-border); border: 1px solid var(--lp-border);
          display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
        }
        .feat-stat-wrap { text-align: right; }
        .feat-stat-val {
          font-size: 1.3rem; font-weight: 900; letter-spacing: -0.04em;
          background: linear-gradient(135deg,var(--lp-grad-1),var(--lp-grad-3));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .feat-stat-label { font-size: 0.65rem; color: var(--lp-muted); font-weight: 600; margin-top: 1px; }
        .feat-title { font-size: 0.975rem; font-weight: 800; color: var(--lp-fg-strong); margin-bottom: 0.5rem; letter-spacing: -0.025em; }
        .feat-desc { font-size: 0.85rem; color: var(--lp-muted); line-height: 1.7; }

        /* ── how it works ── */
        .steps-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 1.5rem; margin-top: 3.5rem; text-align: left;
          position: relative;
        }
        .step-card {
          padding: 2rem; border-radius: 24px;
          background: var(--lp-card-bg);
          backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid var(--lp-border-light);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          position: relative;
          transition: border-color 0.3s, transform 0.3s, background 0.3s;
        }
        .step-card:hover { border-color: var(--lp-pill-border); background: var(--lp-card-hover); transform: translateY(-3px); }
        .step-num {
          font-size: 0.65rem; font-weight: 900; letter-spacing: 0.05em;
          color: var(--lp-grad-1); margin-bottom: 0.75rem;
          background: var(--lp-pill-bg); display: inline-block;
          padding: 0.2rem 0.5rem; border-radius: 6px;
        }
        .step-icon-wrap { font-size: 1.6rem; margin-bottom: 0.75rem; }
        .step-title { font-size: 0.975rem; font-weight: 800; color: var(--lp-fg-strong); margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .step-desc { font-size: 0.82rem; color: var(--lp-muted); line-height: 1.7; }
        .step-connector {
          position: absolute; top: 2.2rem; right: -0.85rem;
          width: 1.7rem; height: 2px;
          background: linear-gradient(90deg, rgba(124,58,237,0.5), transparent);
          z-index: 1;
        }

        /* ── testimonials ── */
        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; text-align: left; }
        .testi-card {
          padding: 2rem;
          background: var(--lp-card-bg);
          backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid var(--lp-border-light);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          border-radius: 24px;
          display: flex; flex-direction: column; gap: 1rem;
          transition: transform 0.3s, border-color 0.3s, background 0.3s;
        }
        .testi-card:hover { transform: translateY(-4px); background: var(--lp-card-hover); border-color: var(--lp-pill-border); }
        .testi-card--featured {
          background: var(--lp-pill-bg);
          border-color: var(--lp-pill-border);
          box-shadow: 0 0 0 1px var(--lp-pill-border), 0 24px 64px var(--lp-pill-bg);
        }
        .testi-stars { display: flex; gap: 2px; }
        .testi-star { color: #fbbf24; font-size: 0.85rem; }
        .testi-body { font-size: 0.875rem; color: var(--lp-fg); line-height: 1.75; flex: 1; }
        .testi-author { display: flex; align-items: center; gap: 0.8rem; }
        .testi-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg,var(--lp-btn-bg-1),var(--lp-btn-bg-2));
          color: #fff; font-size: 0.78rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .testi-name { font-size: 0.83rem; font-weight: 800; color: var(--lp-fg-strong); }
        .testi-role { font-size: 0.73rem; color: var(--lp-muted); margin-top: 2px; }
        .testi-company { color: var(--lp-grad-1); font-weight: 600; }

        /* ── pricing ── */
        .price-toggle-wrap {
          display: inline-flex; align-items: center; gap: 0.9rem;
          margin-bottom: 3rem; padding: 0.55rem 1.25rem;
          background: var(--lp-border);
          border: 1px solid var(--lp-border);
          border-radius: 999px;
        }
        .price-toggle-label { font-size: 0.875rem; font-weight: 600; color: var(--lp-muted); transition: color 0.2s; display: flex; align-items: center; gap: 0.45rem; }
        .price-toggle-label--on { color: var(--lp-fg-strong); }
        .price-save-badge {
          font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.55rem;
          border-radius: 999px; background: rgba(52,211,153,0.15);
          color: #34d399; border: 1px solid rgba(52,211,153,0.25);
        }
        .price-switch {
          position: relative; width: 44px; height: 24px;
          background: var(--lp-border-light); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px; cursor: pointer;
          transition: background 0.25s, border-color 0.25s; flex-shrink: 0; outline: none;
        }
        .price-switch--on { background: var(--lp-btn-bg-1); border-color: var(--lp-btn-bg-1); box-shadow: 0 0 18px var(--lp-btn-shadow); }
        .price-switch:focus-visible { box-shadow: 0 0 0 3px var(--lp-btn-shadow-hover); }
        .price-switch-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; transition: transform 0.25s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .price-switch--on .price-switch-thumb { transform: translateX(20px); }

        .price-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; align-items: start; text-align: left; }
        .price-card {
          position: relative; display: flex; flex-direction: column;
          padding: 2.25rem; border-radius: 24px;
          background: var(--lp-card-bg);
          backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid var(--lp-border-light);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          transition: transform 0.3s, border-color 0.3s, background 0.3s;
        }
        .price-card:hover { transform: translateY(-5px); background: var(--lp-card-hover); }
        .price-card--hl {
          background: var(--lp-pill-bg);
          border-color: var(--lp-pill-border);
          box-shadow: 0 0 0 1px var(--lp-pill-border), 0 32px 90px rgba(0,0,0,0.12);
        }
        .price-card--hl:hover { box-shadow: 0 0 0 1px var(--lp-pill-border), 0 48px 120px rgba(0,0,0,0.18); }
        .price-card-glow {
          position: absolute; inset: -1px; border-radius: 24px;
          background: linear-gradient(135deg, var(--lp-pill-border), var(--lp-orb-2), transparent 55%);
          pointer-events: none; z-index: 0;
        }
        .price-badge {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          padding: 0.28rem 1rem; border-radius: 999px;
          background: linear-gradient(135deg,var(--lp-btn-bg-1),var(--lp-btn-bg-2));
          color: #fff; font-size: 0.68rem; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase;
          white-space: nowrap; box-shadow: 0 4px 24px var(--lp-btn-shadow);
        }
        .price-top { position: relative; z-index: 1; margin-bottom: 1.5rem; }
        .price-name { font-size: 1.15rem; font-weight: 900; color: var(--lp-fg-strong); margin-bottom: 0.3rem; letter-spacing: -0.03em; }
        .price-desc { font-size: 0.8rem; color: var(--lp-muted); margin-bottom: 1.4rem; line-height: 1.6; }
        .price-amount-row { display: flex; align-items: flex-end; gap: 0.1rem; }
        .price-currency { font-size: 1.2rem; font-weight: 800; color: var(--lp-muted); line-height: 1.85; }
        .price-amount { font-size: 3rem; font-weight: 900; color: var(--lp-fg-strong); letter-spacing: -0.06em; line-height: 1; transition: all 0.25s ease; }
        .price-per { font-size: 0.8rem; color: var(--lp-muted); margin-left: 0.3rem; line-height: 2.5; }
        .price-yearly-note { font-size: 0.72rem; color: #34d399; margin-top: 0.5rem; font-weight: 600; }
        .price-tax-note { font-size: 0.68rem; color: var(--lp-muted); margin-top: 0.35rem; }
        .price-feats { list-style: none; flex: 1; display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.85rem; position: relative; z-index: 1; }
        .price-feat { display: flex; align-items: flex-start; gap: 0.55rem; font-size: 0.84rem; color: var(--lp-fg); line-height: 1.4; }
        .price-feat--no { color: var(--lp-muted); }
        .price-check { color: #34d399; flex-shrink: 0; margin-top: 1px; }
        .price-cross { color: var(--lp-muted); flex-shrink: 0; margin-top: 1px; }
        .price-cta-hl {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.9rem; border-radius: 13px;
          background: linear-gradient(135deg,var(--lp-btn-bg-1),var(--lp-btn-bg-2));
          color: #fff; font-size: 0.9rem; font-weight: 700;
          text-decoration: none; position: relative; z-index: 1;
          box-shadow: 0 6px 28px var(--lp-btn-shadow);
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .price-cta-hl:hover { opacity: 0.92; transform: translateY(-2px); box-shadow: 0 12px 40px var(--lp-btn-shadow-hover); }
        .price-cta {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.9rem; border-radius: 13px;
          background: var(--lp-border); border: 1px solid var(--lp-border-light);
          color: var(--lp-fg); font-size: 0.9rem; font-weight: 700;
          text-decoration: none;
          transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .price-cta:hover { background: var(--lp-border); color: var(--lp-fg-strong); transform: translateY(-2px); }

        .price-enterprise {
          margin-top: 2.5rem; border-radius: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--lp-border);
          padding: 1.5rem 2rem;
        }
        .price-enterprise-inner { display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; text-align: left; }
        .price-enterprise-title { font-size: 0.95rem; font-weight: 800; color: var(--lp-fg-strong); margin-bottom: 0.3rem; }
        .price-enterprise-sub { font-size: 0.82rem; color: var(--lp-muted); }
        .price-enterprise-cta {
          font-size: 0.875rem; font-weight: 700;
          color: var(--lp-grad-1); text-decoration: none; white-space: nowrap;
          padding: 0.65rem 1.5rem; border-radius: 10px;
          border: 1px solid var(--lp-pill-border);
          background: var(--lp-pill-bg);
          transition: background 0.15s, border-color 0.15s;
        }
        .price-enterprise-cta:hover { background: var(--lp-card-hover); border-color: var(--lp-btn-shadow); }

        /* ── final cta ── */
        .lp-final-cta {
          position: relative; padding: 10rem 2rem;
          text-align: center; overflow: hidden;
          border-top: 1px solid var(--lp-border);
        }
        .final-cta-orb { position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none; }
        .final-cta-orb-1 { width: 700px; height: 700px; background: var(--lp-orb-1); top: -250px; left: 50%; transform: translateX(-50%); }
        .final-cta-orb-2 { width: 350px; height: 350px; background: var(--lp-orb-3); bottom: -100px; right: 8%; }
        .final-cta-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1.75rem; }
        .final-cta-badge {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.4rem 1rem; border-radius: 999px;
          background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2);
          font-size: 0.78rem; font-weight: 600; color: #4ade80;
        }
        .final-cta-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 9px #4ade80;
          animation: pillPulse 2s ease-in-out infinite;
        }
        .final-cta-h2 { font-size: clamp(2.2rem, 4.2vw, 3.25rem); font-weight: 900; letter-spacing: -0.055em; color: var(--lp-fg-strong); line-height: 1.08; }
        .final-cta-sub { font-size: 1.05rem; color: var(--lp-muted); line-height: 1.75; max-width: 540px; }
        .final-cta-actions { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .final-cta-trust { display: flex; gap: 1.5rem; font-size: 0.82rem; color: var(--lp-muted); font-weight: 500; }
        .final-cta-trust span::before { content: ""; }
        .final-cta-signin { font-size: 0.83rem; color: var(--lp-muted); text-decoration: none; transition: color 0.15s; }
        .final-cta-signin:hover { color: var(--lp-fg-strong); }

        /* ── contact form ── */
        .contact-wrap {
          max-width: 540px; margin: 3rem auto 0;
          padding: 2.5rem; border-radius: 24px;
          background: var(--lp-card-bg);
          backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid var(--lp-border-light);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: left;
        }
        .contact-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .contact-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .contact-group label { font-size: 0.85rem; font-weight: 600; color: var(--lp-fg-strong); }
        .contact-group input, .contact-group textarea {
          width: 100%; padding: 0.8rem 1rem; border-radius: 12px;
          border: 1px solid var(--lp-border);
          background: rgba(0,0,0,0.1); color: var(--lp-fg);
          font-family: inherit; font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        html[data-mode="light"] .contact-group input, html[data-mode="light"] .contact-group textarea {
          background: #fff;
        }
        .contact-group input:focus, .contact-group textarea:focus {
          outline: none; border-color: var(--lp-grad-1);
        }
        .contact-group textarea { resize: vertical; min-height: 100px; }

        /* ── footer ── */
        .lp-footer { border-top: 1px solid var(--lp-border); background: var(--lp-bg); }
        .lp-footer-inner { max-width: 1280px; margin: 0 auto; padding: 4rem 2rem; display: flex; gap: 5rem; flex-wrap: wrap; }
        .lp-footer-brand { flex: 0 0 240px; display: flex; flex-direction: column; gap: 0.85rem; }
        .lp-footer-tagline { font-size: 0.83rem; color: var(--lp-muted); line-height: 1.6; }
        .lp-footer-meta-badge {
          display: inline-block; font-size: 0.68rem; font-weight: 700;
          color: rgba(52,211,153,0.7); border: 1px solid rgba(52,211,153,0.2);
          background: rgba(52,211,153,0.07);
          padding: 0.25rem 0.65rem; border-radius: 6px; letter-spacing: 0.03em;
        }
        .lp-footer-links { display: flex; gap: 4rem; flex: 1; flex-wrap: wrap; }
        .lp-footer-col { display: flex; flex-direction: column; gap: 0.65rem; }
        .lp-footer-col-title { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lp-muted); margin-bottom: 0.3rem; }
        .lp-footer-link { font-size: 0.84rem; color: var(--lp-muted); text-decoration: none; transition: color 0.15s; }
        .lp-footer-link:hover { color: var(--lp-fg); }
        .lp-footer-bottom {
          max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem;
          border-top: 1px solid var(--lp-border);
          font-size: 0.78rem; color: var(--lp-muted);
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;
        }
        
        .privacy-popup {
          position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
          z-index: 1000; width: 90%; max-width: 600px;
          background: var(--lp-float-bg); backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid var(--lp-border-light); border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15); padding: 1.25rem 1.5rem;
          animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .privacy-popup-inner { display: flex; gap: 1.5rem; align-items: center; justify-content: space-between; }
        .privacy-popup-content h4 { font-size: 0.95rem; font-weight: 800; color: var(--lp-fg-strong); margin-bottom: 0.25rem; }
        .privacy-popup-content p { font-size: 0.8rem; color: var(--lp-muted); line-height: 1.5; }
        .privacy-popup-btn {
          background: var(--lp-btn-bg-1); color: #fff; border: none;
          padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: filter 0.2s; white-space: nowrap;
        }
        .privacy-popup-btn:hover { filter: brightness(1.1); }
        @keyframes popUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }

        /* ── responsive ── */
        @media (max-width: 1100px) {
          .lp-hero { flex-direction: column; min-height: auto; padding-top: 120px; gap: 3.5rem; text-align: center; }
          .hero-content { flex: none; max-width: 640px; margin: 0 auto; align-items: center; }
          .hero-sub { text-align: center; }
          .hero-ctas { justify-content: center; }
          .hero-trust { justify-content: center; }
          .hero-mockup-wrap { width: 100%; max-width: 680px; margin: 0 auto; }
          .feat-grid { grid-template-columns: repeat(2,1fr); }
          .testi-grid { grid-template-columns: repeat(2,1fr); }
          .price-grid { grid-template-columns: 1fr; max-width: 500px; margin-inline: auto; }
          .steps-grid { grid-template-columns: repeat(2,1fr); gap: 2rem; }
          .step-connector { display: none; }
          .metrics-strip { grid-template-columns: repeat(2,1fr); }
          .lp-nav-center { display: none; }
        }
        
        @media (max-width: 850px) {
          .lp-footer-inner { gap: 3rem; }
          .lp-footer-links { flex-direction: column; gap: 2rem; }
        }

        @media (max-width: 640px) {
          .lp-nav-inner { padding: 0 1rem; }
          .lp-logo-name { font-size: 1rem; }
          .lp-nav-signin { display: none; }
          .lp-nav-cta { padding: 0.45rem 0.85rem; font-size: 0.8rem; }
          
          .lp-hero { padding: 90px 1rem 3rem; gap: 2.5rem; }
          .hero-h1 { font-size: 2.2rem; }
          .hero-sub { font-size: 0.95rem; }
          .hero-ctas { flex-direction: column; width: 100%; align-items: stretch; gap: 0.75rem; }
          .hero-cta-primary, .hero-cta-ghost { width: 100%; justify-content: center; }
          
          .hm-float { display: none; }
          .hm-convlist { display: none; }
          .hm-sidebar { width: 48px; padding: 0.5rem 0.25rem; }
          .hm-nav-label { display: none; }
          .hm-badge { right: 2px; }
          .hm-chat-header { padding: 0.5rem; }
          .hm-chat-name { font-size: 0.65rem; }
          .hm-chat-action { display: none; }
          
          .lp-section-inner { padding: 4rem 1rem; }
          .lp-h2 { font-size: 1.75rem; }
          .lp-h2-sub { font-size: 0.95rem; margin-bottom: 2rem; }
          
          .feat-grid, .testi-grid, .steps-grid { grid-template-columns: 1fr; gap: 1.25rem; }
          
          .metrics-strip { grid-template-columns: repeat(2,1fr); padding: 2rem 1rem; gap: 0; }
          .metric-item { padding: 1.5rem 0.5rem; border-right: none; }
          .metric-item:nth-child(odd) { border-right: 1px solid var(--lp-border); }
          .metric-item:nth-child(1), .metric-item:nth-child(2) { border-bottom: 1px solid var(--lp-border); }
          
          .price-toggle-wrap { margin-bottom: 2rem; }
          .price-card { padding: 1.75rem 1.25rem; }
          .price-amount { font-size: 2.5rem; }
          
          .lp-footer-inner { flex-direction: column; gap: 2.5rem; padding: 3rem 1rem; }
          .lp-footer-brand { flex: none; align-items: center; text-align: center; }
          .lp-footer-links { flex-direction: column; gap: 2rem; text-align: center; }
          .lp-footer-bottom { flex-direction: column; gap: 0.5rem; padding: 1.5rem 1rem; text-align: center; }
          
          .final-cta-trust { flex-direction: column; gap: 0.5rem; align-items: center; }
          .price-enterprise-inner { flex-direction: column; gap: 1.25rem; text-align: center; justify-content: center; }
          .privacy-popup-inner { flex-direction: column; align-items: stretch; text-align: center; gap: 1rem; }
          .final-cta-h2 { font-size: 1.9rem; }
          .contact-wrap { padding: 1.5rem; margin-top: 2rem; }
        }

        @media (max-width: 400px) {
          .lp-nav-cta { padding: 0.4rem 0.6rem; font-size: 0.75rem; }
          .lp-logo-name { font-size: 0.9rem; }
          .hero-h1 { font-size: 1.9rem; }
          .hero-sub { font-size: 0.9rem; }
          .hero-eyebrow { font-size: 0.7rem; padding: 0.35rem 0.75rem 0.35rem 0.5rem; }
          
          .lp-section-inner { padding: 3rem 1rem; }
          .lp-h2 { font-size: 1.5rem; }
          .metrics-strip { grid-template-columns: 1fr; }
          .metric-item { border-right: none !important; border-bottom: 1px solid var(--lp-border); padding: 1.5rem 1rem; }
          .metric-item:last-child { border-bottom: none; }
          
          .feat-card { padding: 1.75rem 1.25rem; }
          .price-card { padding: 1.5rem 1rem; }
        }
      `}</style>
    </div>
  );
}
