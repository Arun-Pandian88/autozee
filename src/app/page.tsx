"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ─── data ─────────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    desc: "Perfect for small teams just getting started.",
    monthly: 999, yearly: 799,
    highlight: false, badge: null,
    features: ["1 WhatsApp number","Up to 3 agents","1,000 contacts","Broadcast messaging","Basic automation flows","Email support"],
    cta: "Get started",
  },
  {
    name: "Growth",
    desc: "For growing teams that need more power.",
    monthly: 2499, yearly: 1999,
    highlight: true, badge: "Most popular",
    features: ["3 WhatsApp numbers","Up to 15 agents","10,000 contacts","Advanced broadcasts","AI automation & flows","Sales pipeline (CRM)","Priority support"],
    cta: "Start free trial",
  },
  {
    name: "Scale",
    desc: "For high-volume businesses that demand scale.",
    monthly: 5999, yearly: 4799,
    highlight: false, badge: null,
    features: ["Unlimited WA numbers","Unlimited agents","Unlimited contacts","Custom AI agents","Advanced analytics","Dedicated account manager","SLA & priority support","Custom integrations"],
    cta: "Contact sales",
  },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Sales Director, Zomato", avatar: "PS", body: "Autozee cut our response time from 4 hours to under 5 minutes. Our WhatsApp pipeline now generates 3× more qualified leads every month.", stars: 5 },
  { name: "Rahul Mehta", role: "Founder, QuickFin", avatar: "RM", body: "We replaced 3 separate tools with Autozee. The automation builder alone saved us 20+ hours of manual follow-up work every week.", stars: 5 },
  { name: "Sneha Patel", role: "Head of Growth, Meesho", avatar: "SP", body: "The broadcast feature with real-time delivery stats is a game-changer. Our open rates are up 40% since switching to Autozee.", stars: 5 },
  { name: "Arjun Nair", role: "CEO, LogiTrack", avatar: "AN", body: "Setup took less than 30 minutes. Our team was fully onboarded in a day. The UX is the cleanest I've seen in any CRM tool.", stars: 5 },
  { name: "Kavya Reddy", role: "Marketing Lead, Urban Company", avatar: "KR", body: "Autozee's AI agents handle 60% of our inbound queries automatically. Our team now focuses only on high-intent customers.", stars: 5 },
  { name: "Vikram Singh", role: "Operations Manager, BlinkIt", avatar: "VS", body: "Incredible product. The pipeline view combined with WhatsApp conversations in one screen is something we never knew we needed.", stars: 5 },
];

const LOGOS = ["Zomato","Meesho","Urban Co","BlinkIt","QuickFin","LogiTrack","Razorpay","Swiggy"];

const FEATURES = [
  { icon: "💬", title: "Unified Inbox", desc: "All your WhatsApp conversations in one place. Assign, label, and resolve with one click.", color: "violet" },
  { icon: "🤖", title: "AI Automation", desc: "Let AI handle routine queries so your team focuses on high-value deals.", color: "blue" },
  { icon: "📊", title: "Sales Pipeline", desc: "Drag-and-drop Kanban boards to track every deal from lead to close.", color: "emerald" },
  { icon: "📣", title: "Broadcasts", desc: "Send targeted campaigns to segmented lists with real-time delivery stats.", color: "amber" },
  { icon: "👥", title: "Contact CRM", desc: "Rich profiles with conversation history, tags, and custom fields.", color: "rose" },
  { icon: "⚡", title: "Flows & Triggers", desc: "Visual no-code builder to trigger actions on any event instantly.", color: "cyan" },
];

/* ─── component ─────────────────────────────────────── */
export default function LandingPage() {
  const [yearly, setYearly] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp-root">
      {/* ─── noise overlay ─── */}
      <div className="lp-noise" aria-hidden="true" />

      {/* ─── NAV ─── */}
      <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark">Az</div>
            <span className="lp-logo-name">Autozee</span>
          </div>
          <div className="lp-nav-center">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how" className="lp-nav-link">How it works</a>
            <a href="#testimonials" className="lp-nav-link">Reviews</a>
            <a href="#pricing" className="lp-nav-link">Pricing</a>
          </div>
          <div className="lp-nav-right">
            <Link href="/login" className="lp-nav-signin">Sign in</Link>
            <Link href="/login" className="lp-nav-cta">
              Get started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="lp-hero">
        {/* animated grid */}
        <div className="hero-grid" aria-hidden="true" />
        {/* glow orbs */}
        <div className="orb orb-1" aria-hidden="true" />
        <div className="orb orb-2" aria-hidden="true" />
        <div className="orb orb-3" aria-hidden="true" />

        <div className="hero-content">
          <a href="#pricing" className="hero-pill">
            <span className="hero-pill-dot" />
            <span>14-day free trial — no credit card needed</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>

          <h1 className="hero-h1">
            Turn WhatsApp into<br/>
            <span className="hero-gradient">your #1 sales channel</span>
          </h1>

          <p className="hero-sub">
            Autozee is the all-in-one WhatsApp CRM — unified inbox, AI automation,
            broadcast campaigns, and sales pipeline in one beautiful platform.
          </p>

          <div className="hero-ctas">
            <Link href="/login" className="hero-cta-primary">
              Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#features" className="hero-cta-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              See how it works
            </a>
          </div>

          <div className="hero-social-proof">
            <div className="hero-avatars">
              {["A","B","C","D"].map((l,i)=>(
                <div key={i} className="hero-avatar" style={{zIndex:4-i,marginLeft: i===0?0:"-10px"}}>{l}</div>
              ))}
            </div>
            <p className="hero-proof-text"><strong>2,400+</strong> businesses growing with Autozee</p>
          </div>
        </div>

        {/* hero dashboard mockup */}
        <div className="hero-mockup-wrap">
          <div className="hero-mockup">
            {/* top bar */}
            <div className="hm-bar">
              <div className="hm-bar-dots">
                <span className="hm-dot" style={{background:"#ff5f57"}}/>
                <span className="hm-dot" style={{background:"#febc2e"}}/>
                <span className="hm-dot" style={{background:"#28c840"}}/>
              </div>
              <div className="hm-bar-title">Autozee · Inbox</div>
              <div className="hm-bar-actions">
                <div className="hm-pill green">● Live</div>
              </div>
            </div>
            {/* body */}
            <div className="hm-body">
              {/* sidebar */}
              <div className="hm-sidebar">
                <div className="hm-nav-item active">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Inbox
                  <span className="hm-badge">12</span>
                </div>
                {["Pipeline","Contacts","Broadcasts","Automations"].map(n=>(
                  <div key={n} className="hm-nav-item">{n}</div>
                ))}
              </div>
              {/* conversation list */}
              <div className="hm-convlist">
                {[
                  {name:"Priya Sharma",msg:"Interested in Growth plan 👀",time:"2m",unread:true},
                  {name:"Rahul M.",msg:"When can we schedule a call?",time:"15m",unread:true},
                  {name:"Sneha P.",msg:"Invoice received, thank you!",time:"1h",unread:false},
                ].map((c,i)=>(
                  <div key={i} className={`hm-conv ${i===0?"hm-conv--active":""}`}>
                    <div className="hm-conv-avatar">{c.name[0]}</div>
                    <div className="hm-conv-body">
                      <div className="hm-conv-name">{c.name}</div>
                      <div className="hm-conv-msg">{c.msg}</div>
                    </div>
                    <div className="hm-conv-meta">
                      <span className="hm-conv-time">{c.time}</span>
                      {c.unread && <span className="hm-conv-dot"/>}
                    </div>
                  </div>
                ))}
              </div>
              {/* chat */}
              <div className="hm-chat">
                <div className="hm-msg hm-msg--in">Hey, I'm interested in the Growth plan 👋</div>
                <div className="hm-msg hm-msg--out">Hi Priya! Great choice — Growth is our most popular plan. Can I get you a quick demo?</div>
                <div className="hm-msg hm-msg--in">Yes please! What's included?</div>
                <div className="hm-typing">
                  <span/><span/><span/>
                </div>
              </div>
            </div>
          </div>
          {/* floating stat cards */}
          <div className="hm-float hm-float-1">
            <div className="hm-float-icon">📈</div>
            <div>
              <div className="hm-float-val">+143%</div>
              <div className="hm-float-label">Revenue this month</div>
            </div>
          </div>
          <div className="hm-float hm-float-2">
            <div className="hm-float-icon">⚡</div>
            <div>
              <div className="hm-float-val">4 min</div>
              <div className="hm-float-label">Avg response time</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGO MARQUEE ─── */}
      <div className="lp-marquee-wrap">
        <div className="lp-marquee-fade lp-marquee-fade--left" aria-hidden="true"/>
        <div className="lp-marquee" ref={marqueeRef}>
          <div className="lp-marquee-track">
            {[...LOGOS,...LOGOS].map((l,i)=>(
              <div key={i} className="lp-marquee-logo">{l}</div>
            ))}
          </div>
        </div>
        <div className="lp-marquee-fade lp-marquee-fade--right" aria-hidden="true"/>
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">Platform features</div>
          <h2 className="lp-h2">Everything your team needs<br/>to win on WhatsApp</h2>
          <p className="lp-h2-sub">One platform. Zero tab-switching. Maximum conversions.</p>

          <div className="feat-grid">
            {FEATURES.map(f=>(
              <div key={f.title} className={`feat-card feat-card--${f.color}`}>
                <div className="feat-icon-wrap">
                  <span className="feat-icon">{f.icon}</span>
                </div>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
                <div className="feat-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="lp-section lp-section--dark">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">How it works</div>
          <h2 className="lp-h2">Up and running<br/>in under 30 minutes</h2>

          <div className="steps-wrap">
            <div className="steps-line" aria-hidden="true"/>
            {[
              {n:"01",title:"Connect WhatsApp",desc:"Link your WhatsApp Business number via the official Meta Cloud API. Verified, secure, no risk of bans."},
              {n:"02",title:"Import Contacts",desc:"Bring your existing contacts via CSV or sync from Google Sheets, HubSpot, or any tool."},
              {n:"03",title:"Build Automations",desc:"Use our visual drag-and-drop flow builder to automate follow-ups, welcome messages, and more."},
              {n:"04",title:"Close More Deals",desc:"Watch your pipeline fill up. Track every deal, reply to hot leads instantly, and hit your targets."},
            ].map((s,i)=>(
              <div key={s.n} className="step-item">
                <div className="step-num-wrap">
                  <div className="step-num">{s.n}</div>
                </div>
                <div className="step-body">
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">Customer stories</div>
          <h2 className="lp-h2">Loved by 2,400+ teams<br/>across India</h2>

          <div className="testi-grid">
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className={`testi-card ${i===1?"testi-card--featured":""}`}>
                <div className="testi-stars">
                  {"★★★★★".split("").map((s,j)=><span key={j} className="testi-star">{s}</span>)}
                </div>
                <p className="testi-body">"{t.body}"</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.avatar}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="lp-section lp-section--dark">
        <div className="lp-section-inner">
          <div className="lp-eyebrow">Pricing</div>
          <h2 className="lp-h2">Simple, transparent pricing</h2>
          <p className="lp-h2-sub">Start free for 14 days. No credit card required.</p>

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
            {PLANS.map(plan=>{
              const price = yearly ? plan.yearly : plan.monthly;
              return (
                <div key={plan.name} className={`price-card ${plan.highlight?"price-card--hl":""}`}>
                  {plan.highlight && (
                    <div className="price-card-glow" aria-hidden="true"/>
                  )}
                  {plan.badge && (
                    <div className="price-badge">{plan.badge}</div>
                  )}
                  <div className="price-top">
                    <div className="price-name">{plan.name}</div>
                    <div className="price-desc">{plan.desc}</div>
                    <div className="price-amount-row">
                      <span className="price-currency">₹</span>
                      <span className="price-amount">{price.toLocaleString("en-IN")}</span>
                      <span className="price-per">/mo</span>
                    </div>
                    {yearly&&(
                      <div className="price-yearly-note">
                        Billed ₹{(price*12).toLocaleString("en-IN")} annually
                      </div>
                    )}
                  </div>

                  <ul className="price-feats">
                    {plan.features.map(f=>(
                      <li key={f} className="price-feat">
                        <svg className="price-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/login" className={plan.highlight?"price-cta-hl":"price-cta"}>
                    {plan.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="price-note">
            All plans include a <strong>14-day free trial</strong>. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="lp-final-cta">
        <div className="final-cta-orb final-cta-orb-1" aria-hidden="true"/>
        <div className="final-cta-orb final-cta-orb-2" aria-hidden="true"/>
        <div className="final-cta-inner">
          <div className="lp-eyebrow" style={{color:"oklch(0.8 0.15 293)"}}>Get started today</div>
          <h2 className="final-cta-h2">
            Your WhatsApp inbox is<br/>
            <span className="hero-gradient">leaving money on the table</span>
          </h2>
          <p className="final-cta-sub">
            Join 2,400+ businesses that use Autozee to convert WhatsApp chats into revenue. Takes 30 minutes to set up.
          </p>
          <div className="final-cta-actions">
            <Link href="/login" className="hero-cta-primary hero-cta-primary--xl">
              Start your free trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/login" className="final-cta-signin">Already have an account? Sign in →</Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo">
              <div className="lp-logo-mark">Az</div>
              <span className="lp-logo-name">Autozee</span>
            </div>
            <p className="lp-footer-tagline">The WhatsApp CRM built for growth.</p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Product</div>
              <a href="#features" className="lp-footer-link">Features</a>
              <a href="#pricing" className="lp-footer-link">Pricing</a>
              <a href="#how" className="lp-footer-link">How it works</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Company</div>
              <a href="#" className="lp-footer-link">About</a>
              <a href="#" className="lp-footer-link">Blog</a>
              <a href="#" className="lp-footer-link">Careers</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Legal</div>
              <a href="#" className="lp-footer-link">Privacy</a>
              <a href="#" className="lp-footer-link">Terms</a>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} Autozee. All rights reserved.</p>
        </div>
      </footer>

      {/* ─── STYLES ─── */}
      <style>{`
        /* ── base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lp-root {
          position: relative;
          min-height: 100vh;
          background: #080b14;
          color: #e2e8f0;
          font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
          overflow-x: hidden;
        }
        .lp-noise {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 256px;
          opacity: 0.5;
        }

        /* ── nav ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
        }
        .lp-nav--scrolled {
          background: rgba(8,11,20,0.8);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 2rem;
          height: 68px; display: flex; align-items: center;
        }
        .lp-logo { display: flex; align-items: center; gap: 0.65rem; text-decoration: none; flex-shrink: 0; }
        .lp-logo-mark {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          box-shadow: 0 0 20px rgba(124,58,237,0.4);
          color: #fff; font-size: 13px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: -0.5px; flex-shrink: 0;
        }
        .lp-logo-name { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; letter-spacing: -0.3px; }
        .lp-nav-center { display: flex; align-items: center; gap: 0.25rem; margin: 0 auto; }
        .lp-nav-link {
          padding: 0.45rem 0.9rem; font-size: 0.875rem;
          color: rgba(226,232,240,0.6); text-decoration: none;
          border-radius: 8px; transition: color 0.15s, background 0.15s;
        }
        .lp-nav-link:hover { color: #f1f5f9; background: rgba(255,255,255,0.06); }
        .lp-nav-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .lp-nav-signin {
          padding: 0.45rem 1rem; font-size: 0.875rem;
          color: rgba(226,232,240,0.7); text-decoration: none;
          border-radius: 8px; transition: color 0.15s;
        }
        .lp-nav-signin:hover { color: #f1f5f9; }
        .lp-nav-cta {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 1.1rem; font-size: 0.875rem; font-weight: 600;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; text-decoration: none; border-radius: 9px;
          box-shadow: 0 0 20px rgba(124,58,237,0.35);
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .lp-nav-cta:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 24px rgba(124,58,237,0.5); }

        /* ── hero ── */
        .lp-hero {
          position: relative; min-height: 100vh;
          display: flex; align-items: center;
          padding: 100px 2rem 4rem;
          max-width: 1200px; margin: 0 auto;
          gap: 5rem;
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent);
        }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(120px); pointer-events: none;
          animation: orbFloat 12s ease-in-out infinite;
        }
        .orb-1 { width: 700px; height: 700px; background: rgba(124,58,237,0.18); top: -100px; left: -200px; }
        .orb-2 { width: 500px; height: 500px; background: rgba(79,70,229,0.14); top: 100px; right: -150px; animation-delay: 4s; }
        .orb-3 { width: 350px; height: 350px; background: rgba(6,182,212,0.1); bottom: 50px; left: 30%; animation-delay: 8s; }
        @keyframes orbFloat {
          0%,100%{transform:translate(0,0) scale(1)}
          33%{transform:translate(15px,-25px) scale(1.04)}
          66%{transform:translate(-10px,15px) scale(0.97)}
        }

        .hero-content { position: relative; z-index: 1; flex: 0 0 520px; display: flex; flex-direction: column; gap: 1.6rem; }

        .hero-pill {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 1rem 0.4rem 0.7rem;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 999px; font-size: 0.8rem; font-weight: 500;
          color: rgba(196,181,253,0.9); text-decoration: none;
          width: fit-content;
          transition: background 0.2s, border-color 0.2s;
        }
        .hero-pill:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.5); }
        .hero-pill-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80;
          animation: pillPulse 2s ease-in-out infinite;
        }
        @keyframes pillPulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.6;transform:scale(0.85)}
        }

        .hero-h1 {
          font-size: clamp(2.6rem, 4.5vw, 3.75rem);
          font-weight: 800; line-height: 1.08; letter-spacing: -0.05em;
          color: #f8fafc;
        }
        .hero-gradient {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #38bdf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          font-size: 1.05rem; line-height: 1.75; color: rgba(148,163,184,0.9);
          max-width: 460px;
        }

        .hero-ctas { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .hero-cta-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.75rem;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; font-size: 0.95rem; font-weight: 600;
          text-decoration: none; border-radius: 12px;
          box-shadow: 0 4px 30px rgba(124,58,237,0.4);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
        }
        .hero-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(124,58,237,0.55); opacity: 0.95; }
        .hero-cta-primary--xl { padding: 0.95rem 2rem; font-size: 1rem; }
        .hero-cta-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(226,232,240,0.85); font-size: 0.95rem; font-weight: 500;
          text-decoration: none; border-radius: 12px;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          backdrop-filter: blur(8px);
        }
        .hero-cta-ghost:hover { background: rgba(255,255,255,0.09); color: #f1f5f9; transform: translateY(-1px); }

        .hero-social-proof { display: flex; align-items: center; gap: 0.75rem; }
        .hero-avatars { display: flex; }
        .hero-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: 2px solid #080b14;
          color: #fff; font-size: 0.65rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .hero-proof-text { font-size: 0.83rem; color: rgba(148,163,184,0.8); }
        .hero-proof-text strong { color: #f1f5f9; }

        /* ── hero mockup ── */
        .hero-mockup-wrap { position: relative; flex: 1; z-index: 1; }
        .hero-mockup {
          border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: #0f1523;
          box-shadow: 0 50px 150px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1);
        }
        .hm-bar {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.7rem 1rem;
          background: #131929; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hm-bar-dots { display: flex; gap: 5px; }
        .hm-dot { width: 10px; height: 10px; border-radius: 50%; display: block; }
        .hm-bar-title { font-size: 0.78rem; color: rgba(148,163,184,0.6); font-weight: 500; margin-left: 0.25rem; }
        .hm-bar-actions { margin-left: auto; }
        .hm-pill { font-size: 0.68rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 999px; }
        .hm-pill.green { background: rgba(74,222,128,0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.25); }
        .hm-body { display: flex; height: 280px; }
        .hm-sidebar {
          width: 120px; padding: 0.75rem 0.5rem;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column; gap: 0.2rem; flex-shrink: 0;
        }
        .hm-nav-item {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.6rem; border-radius: 7px;
          font-size: 0.72rem; color: rgba(148,163,184,0.55);
          cursor: default;
        }
        .hm-nav-item.active { background: rgba(124,58,237,0.15); color: #a78bfa; font-weight: 600; }
        .hm-badge { margin-left: auto; background: #7c3aed; color: #fff; font-size: 0.6rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px; }
        .hm-convlist { width: 160px; border-right: 1px solid rgba(255,255,255,0.05); overflow: hidden; flex-shrink: 0; }
        .hm-conv { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.65rem 0.65rem; cursor: default; transition: background 0.15s; }
        .hm-conv--active { background: rgba(124,58,237,0.08); }
        .hm-conv-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg,#7c3aed,#4f46e5); color: #fff; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .hm-conv-body { flex: 1; min-width: 0; }
        .hm-conv-name { font-size: 0.7rem; font-weight: 600; color: rgba(241,245,249,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hm-conv-msg { font-size: 0.65rem; color: rgba(148,163,184,0.55); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
        .hm-conv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
        .hm-conv-time { font-size: 0.6rem; color: rgba(148,163,184,0.4); }
        .hm-conv-dot { width: 6px; height: 6px; border-radius: 50%; background: #7c3aed; }
        .hm-chat { flex: 1; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.45rem; overflow: hidden; }
        .hm-msg { max-width: 78%; padding: 0.42rem 0.7rem; border-radius: 10px; font-size: 0.72rem; line-height: 1.45; }
        .hm-msg--in { background: rgba(255,255,255,0.07); color: rgba(226,232,240,0.85); align-self: flex-start; border-bottom-left-radius: 3px; }
        .hm-msg--out { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; align-self: flex-end; border-bottom-right-radius: 3px; }
        .hm-typing { display: flex; align-items: center; gap: 4px; padding: 0.5rem 0.8rem; background: rgba(255,255,255,0.07); border-radius: 10px; border-bottom-left-radius: 3px; width: fit-content; align-self: flex-start; }
        .hm-typing span { width: 5px; height: 5px; border-radius: 50%; background: rgba(148,163,184,0.5); animation: typDot 1.3s ease-in-out infinite; }
        .hm-typing span:nth-child(2){animation-delay:0.2s} .hm-typing span:nth-child(3){animation-delay:0.4s}
        @keyframes typDot{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-4px);opacity:1}}

        /* floating cards */
        .hm-float {
          position: absolute; display: flex; align-items: center; gap: 0.6rem;
          padding: 0.7rem 1rem; border-radius: 12px;
          background: rgba(15,21,35,0.85); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 16px 48px rgba(0,0,0,0.4);
          animation: floatCard 6s ease-in-out infinite;
        }
        .hm-float-1 { bottom: -20px; left: -30px; animation-delay: 0s; }
        .hm-float-2 { top: -18px; right: -24px; animation-delay: 3s; }
        @keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .hm-float-icon { font-size: 1.2rem; }
        .hm-float-val { font-size: 1rem; font-weight: 800; color: #f1f5f9; letter-spacing: -0.04em; }
        .hm-float-label { font-size: 0.68rem; color: rgba(148,163,184,0.6); }

        /* ── marquee ── */
        .lp-marquee-wrap { position: relative; padding: 2rem 0; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .lp-marquee-fade { position: absolute; top: 0; bottom: 0; width: 120px; z-index: 2; pointer-events: none; }
        .lp-marquee-fade--left { left: 0; background: linear-gradient(90deg, #080b14, transparent); }
        .lp-marquee-fade--right { right: 0; background: linear-gradient(-90deg, #080b14, transparent); }
        .lp-marquee { overflow: hidden; }
        .lp-marquee-track { display: flex; gap: 3rem; width: max-content; animation: marquee 25s linear infinite; }
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .lp-marquee-logo {
          padding: 0.5rem 1.5rem; border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 0.85rem; font-weight: 600;
          color: rgba(148,163,184,0.5);
          white-space: nowrap;
        }

        /* ── shared section ── */
        .lp-section { position: relative; z-index: 1; }
        .lp-section--dark { background: #060910; border-top: 1px solid rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.04); }
        .lp-section-inner { max-width: 1200px; margin: 0 auto; padding: 6rem 2rem; text-align: center; }
        .lp-eyebrow {
          display: inline-block; margin-bottom: 1rem;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #818cf8;
        }
        .lp-h2 { font-size: clamp(1.75rem, 3.5vw, 2.6rem); font-weight: 800; letter-spacing: -0.04em; color: #f8fafc; line-height: 1.1; margin-bottom: 1rem; }
        .lp-h2-sub { font-size: 1rem; color: rgba(148,163,184,0.75); line-height: 1.7; max-width: 520px; margin: 0 auto 3rem; }

        /* ── features ── */
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: left; }
        .feat-card {
          position: relative; padding: 1.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, background 0.25s;
          cursor: default;
        }
        .feat-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.05); }
        .feat-card--violet:hover { border-color: rgba(124,58,237,0.4); }
        .feat-card--blue:hover { border-color: rgba(79,70,229,0.4); }
        .feat-card--emerald:hover { border-color: rgba(16,185,129,0.4); }
        .feat-card--amber:hover { border-color: rgba(245,158,11,0.4); }
        .feat-card--rose:hover { border-color: rgba(244,63,94,0.4); }
        .feat-card--cyan:hover { border-color: rgba(6,182,212,0.4); }
        .feat-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem; font-size: 1.3rem;
        }
        .feat-title { font-size: 0.975rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.45rem; letter-spacing: -0.02em; }
        .feat-desc { font-size: 0.85rem; color: rgba(148,163,184,0.7); line-height: 1.65; }
        .feat-arrow { position: absolute; bottom: 1.25rem; right: 1.25rem; color: rgba(148,163,184,0.3); transition: color 0.2s, transform 0.2s; }
        .feat-card:hover .feat-arrow { color: rgba(148,163,184,0.7); transform: translate(2px,-2px); }

        /* ── how ── */
        .steps-wrap { position: relative; display: flex; flex-direction: column; gap: 0; margin-top: 3rem; text-align: left; max-width: 680px; margin-inline: auto; }
        .steps-line { position: absolute; left: 23px; top: 28px; bottom: 28px; width: 2px; background: linear-gradient(to bottom, rgba(124,58,237,0.6), rgba(79,70,229,0.1)); }
        .step-item { display: flex; gap: 1.5rem; padding: 1.75rem 0; }
        .step-num-wrap { flex-shrink: 0; }
        .step-num {
          width: 48px; height: 48px; border-radius: 50%;
          background: #0f1523; border: 2px solid rgba(124,58,237,0.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 800; color: #a78bfa;
          box-shadow: 0 0 20px rgba(124,58,237,0.2);
          position: relative; z-index: 1;
        }
        .step-body { padding-top: 0.5rem; }
        .step-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.4rem; letter-spacing: -0.02em; }
        .step-desc { font-size: 0.875rem; color: rgba(148,163,184,0.7); line-height: 1.7; }

        /* ── testimonials ── */
        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: left; }
        .testi-card {
          padding: 1.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          display: flex; flex-direction: column; gap: 1rem;
          transition: transform 0.2s, border-color 0.2s;
        }
        .testi-card:hover { transform: translateY(-3px); border-color: rgba(124,58,237,0.25); }
        .testi-card--featured {
          background: rgba(124,58,237,0.07);
          border-color: rgba(124,58,237,0.25);
          box-shadow: 0 0 0 1px rgba(124,58,237,0.15), 0 20px 60px rgba(124,58,237,0.1);
        }
        .testi-stars { display: flex; gap: 2px; }
        .testi-star { color: #fbbf24; font-size: 0.85rem; }
        .testi-body { font-size: 0.875rem; color: rgba(226,232,240,0.8); line-height: 1.7; flex: 1; }
        .testi-author { display: flex; align-items: center; gap: 0.75rem; }
        .testi-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .testi-name { font-size: 0.825rem; font-weight: 700; color: #f1f5f9; }
        .testi-role { font-size: 0.75rem; color: rgba(148,163,184,0.55); margin-top: 1px; }

        /* ── pricing ── */
        .price-toggle-wrap {
          display: inline-flex; align-items: center; gap: 0.85rem;
          margin-bottom: 3rem; padding: 0.5rem 1.1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
        }
        .price-toggle-label { font-size: 0.875rem; font-weight: 500; color: rgba(148,163,184,0.55); transition: color 0.2s; display: flex; align-items: center; gap: 0.45rem; }
        .price-toggle-label--on { color: #f1f5f9; }
        .price-save-badge {
          font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.5rem;
          border-radius: 999px; background: rgba(52,211,153,0.15);
          color: #34d399; border: 1px solid rgba(52,211,153,0.25);
        }
        .price-switch {
          position: relative; width: 44px; height: 24px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px; cursor: pointer;
          transition: background 0.25s, border-color 0.25s;
          flex-shrink: 0; outline: none;
        }
        .price-switch--on { background: #7c3aed; border-color: #7c3aed; box-shadow: 0 0 16px rgba(124,58,237,0.4); }
        .price-switch:focus-visible { box-shadow: 0 0 0 3px rgba(124,58,237,0.35); }
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
          padding: 2rem; border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .price-card:hover { transform: translateY(-4px); }
        .price-card--hl {
          background: rgba(124,58,237,0.08);
          border-color: rgba(124,58,237,0.35);
          box-shadow: 0 0 0 1px rgba(124,58,237,0.2), 0 30px 80px rgba(124,58,237,0.12);
        }
        .price-card--hl:hover { box-shadow: 0 0 0 1px rgba(124,58,237,0.35), 0 40px 100px rgba(124,58,237,0.2); }
        .price-card-glow { position: absolute; inset: -1px; border-radius: 20px; background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.15), transparent 60%); pointer-events: none; z-index: 0; }
        .price-badge {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          padding: 0.28rem 0.9rem; border-radius: 999px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          white-space: nowrap; box-shadow: 0 4px 20px rgba(124,58,237,0.5);
        }
        .price-top { position: relative; z-index: 1; margin-bottom: 1.5rem; }
        .price-name { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem; letter-spacing: -0.02em; }
        .price-desc { font-size: 0.82rem; color: rgba(148,163,184,0.6); margin-bottom: 1.25rem; line-height: 1.5; }
        .price-amount-row { display: flex; align-items: flex-end; gap: 0.1rem; }
        .price-currency { font-size: 1.1rem; font-weight: 700; color: rgba(241,245,249,0.7); line-height: 1.9; }
        .price-amount { font-size: 2.8rem; font-weight: 900; color: #f8fafc; letter-spacing: -0.05em; line-height: 1; transition: all 0.25s ease; }
        .price-per { font-size: 0.82rem; color: rgba(148,163,184,0.55); margin-left: 0.3rem; line-height: 2.2; }
        .price-yearly-note { font-size: 0.75rem; color: #34d399; margin-top: 0.4rem; font-weight: 500; }
        .price-feats { list-style: none; flex: 1; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.75rem; position: relative; z-index: 1; }
        .price-feat { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: rgba(203,213,225,0.8); }
        .price-check { color: #34d399; flex-shrink: 0; }
        .price-cta-hl {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.82rem; border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; font-size: 0.9rem; font-weight: 600;
          text-decoration: none; position: relative; z-index: 1;
          box-shadow: 0 4px 24px rgba(124,58,237,0.45);
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .price-cta-hl:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 36px rgba(124,58,237,0.6); }
        .price-cta {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.82rem; border-radius: 12px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(226,232,240,0.85); font-size: 0.9rem; font-weight: 600;
          text-decoration: none;
          transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .price-cta:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; transform: translateY(-1px); }
        .price-note { margin-top: 2.5rem; font-size: 0.85rem; color: rgba(148,163,184,0.5); }
        .price-note strong { color: rgba(241,245,249,0.75); }

        /* ── final cta ── */
        .lp-final-cta {
          position: relative; padding: 8rem 2rem;
          text-align: center; overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .final-cta-orb { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
        .final-cta-orb-1 { width: 600px; height: 600px; background: rgba(124,58,237,0.15); top: -200px; left: 50%; transform: translateX(-50%); }
        .final-cta-orb-2 { width: 300px; height: 300px; background: rgba(6,182,212,0.1); bottom: -100px; right: 10%; }
        .final-cta-inner { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .final-cta-h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.05em; color: #f8fafc; line-height: 1.1; }
        .final-cta-sub { font-size: 1rem; color: rgba(148,163,184,0.75); line-height: 1.7; max-width: 520px; }
        .final-cta-actions { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .final-cta-signin { font-size: 0.85rem; color: rgba(148,163,184,0.55); text-decoration: none; transition: color 0.15s; }
        .final-cta-signin:hover { color: rgba(148,163,184,0.85); }

        /* ── footer ── */
        .lp-footer { border-top: 1px solid rgba(255,255,255,0.05); background: #060910; }
        .lp-footer-inner { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; display: flex; gap: 4rem; flex-wrap: wrap; }
        .lp-footer-brand { flex: 0 0 220px; display: flex; flex-direction: column; gap: 0.75rem; }
        .lp-footer-tagline { font-size: 0.82rem; color: rgba(148,163,184,0.45); line-height: 1.5; }
        .lp-footer-links { display: flex; gap: 3rem; flex: 1; flex-wrap: wrap; }
        .lp-footer-col { display: flex; flex-direction: column; gap: 0.6rem; }
        .lp-footer-col-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(148,163,184,0.4); margin-bottom: 0.25rem; }
        .lp-footer-link { font-size: 0.85rem; color: rgba(148,163,184,0.55); text-decoration: none; transition: color 0.15s; }
        .lp-footer-link:hover { color: rgba(241,245,249,0.85); }
        .lp-footer-bottom { max-width: 1200px; margin: 0 auto; padding: 1.25rem 2rem; border-top: 1px solid rgba(255,255,255,0.04); font-size: 0.78rem; color: rgba(148,163,184,0.3); }

        /* ── responsive ── */
        @media (max-width: 1024px) {
          .lp-hero { flex-direction: column; min-height: auto; padding-top: 120px; gap: 3rem; }
          .hero-content { flex: none; max-width: 600px; }
          .hero-mockup-wrap { width: 100%; max-width: 600px; }
          .feat-grid { grid-template-columns: repeat(2,1fr); }
          .testi-grid { grid-template-columns: repeat(2,1fr); }
          .price-grid { grid-template-columns: 1fr; max-width: 400px; margin-inline: auto; }
          .lp-nav-center { display: none; }
        }
        @media (max-width: 640px) {
          .lp-hero { padding: 100px 1.25rem 3rem; }
          .feat-grid, .testi-grid { grid-template-columns: 1fr; }
          .hm-convlist { display: none; }
          .hm-sidebar { display: none; }
          .lp-footer-inner { flex-direction: column; gap: 2rem; }
          .lp-footer-brand { flex: none; }
        }
      `}</style>
    </div>
  );
}
