"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Star,
  TrendingUp,
  Users,
  Layers,
  Rocket,
  Heart,
  Search,
  Check,
  Activity,
  ChevronRight,
  Package,
  BarChart3,
  ShoppingCart,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Store,
} from "lucide-react";
import { getProducts } from "@/lib/api";

// ─── Recharts (lazy mounted to avoid SSR issues) ─────────────────────────────
let AreaChart, Area, ResponsiveContainer, Tooltip;
if (typeof window !== "undefined") {
  const recharts = require("recharts");
  AreaChart = recharts.AreaChart;
  Area = recharts.Area;
  ResponsiveContainer = recharts.ResponsiveContainer;
  Tooltip = recharts.Tooltip;
}

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTS & MOCK DATA
// ════════════════════════════════════════════════════════════════════════════════

const PRODUCTS = [
  { id: 1, name: "Neural Headset Pro", price: 299, rating: 4.8, reviews: 842, category: "Tech", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" },
  { id: 2, name: "Quantum Watch X", price: 599, rating: 4.9, reviews: 1204, category: "Wearables", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80" },
  { id: 3, name: "Arc Keyboard MK2", price: 189, rating: 4.7, reviews: 567, category: "Peripherals", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80" },
  { id: 4, name: "Pulse Speaker Orb", price: 449, rating: 4.6, reviews: 389, category: "Audio", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80" },
  { id: 5, name: "Holo Display 4K", price: 899, rating: 4.9, reviews: 2100, category: "Displays", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80" },
  { id: 6, name: "Cyber Sneaker V3", price: 159, rating: 4.5, reviews: 789, category: "Fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" },
];

const FEATURES = [
  { icon: Zap,       title: "Lightning Fast",       desc: "Sub-second page loads powered by Next.js edge runtime and intelligent caching.",       color: "#3b82f6", bg: "rgba(59,130,246,0.08)"  },
  { icon: Shield,    title: "Secure by Default",    desc: "End-to-end encryption, fraud detection, and PCI-DSS compliant payments.",            color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  { icon: Globe,     title: "Global Network",       desc: "Reach buyers in 150+ countries with localised payments and smart shipping.",           color: "#06b6d4", bg: "rgba(6,182,212,0.08)"  },
  { icon: TrendingUp,title: "Real-time Analytics",  desc: "Live dashboards with revenue insights, funnel tracking, and cohort analysis.",        color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  { icon: Layers,    title: "Multi-Vendor Ready",   desc: "Manage hundreds of vendors with role-based permissions and white-label storefronts.",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { icon: Rocket,    title: "Scale Without Limits", desc: "Auto-scaling infrastructure that adapts to Black-Friday-level traffic instantly.",     color: "#ef4444", bg: "rgba(239,68,68,0.08)"  },
];

const TESTIMONIALS = [
  { name: "Sarah Chen",     role: "Fashion Vendor · 2 yrs",    quote: "Vendora transformed my small boutique into a 6-figure business. The analytics alone are worth it.",         avatar: "SC", stars: 5 },
  { name: "Marcus Williams",role: "Electronics Retailer",       quote: "The vendor dashboard is insane. I manage 400+ SKUs without ever feeling overwhelmed.",                       avatar: "MW", stars: 5 },
  { name: "Priya Patel",    role: "Premium Buyer",              quote: "Best marketplace UI I've ever used. Finding exactly what I want is actually enjoyable now.",                  avatar: "PP", stars: 5 },
  { name: "James Ford",     role: "Tech Vendor · Top 10",       quote: "Zero to $50K monthly in 8 months. Vendora's seller tools and built-in SEO are genuinely unmatched.",        avatar: "JF", stars: 5 },
];

const STEPS = [
  { num: "01", title: "Create Account",   desc: "Sign up as a buyer or vendor in under 60 seconds. Choose your role and get started instantly — no credit card required.",          icon: Users  },
  { num: "02", title: "Browse or List",   desc: "Discover thousands of curated products, or list your own with AI-powered descriptions and smart category matching.",              icon: Search },
  { num: "03", title: "Transact Securely",desc: "Buy or sell with full confidence. Instant payouts, buyer protection, real-time tracking — commerce the way it should be.",       icon: Shield },
];

const STATS = [
  { value: 2.4,  suffix: "M+", label: "GMV Processed",    prefix: "$", color: "#3b82f6" },
  { value: 50,   suffix: "K+", label: "Active Vendors",    prefix: "",  color: "#8b5cf6" },
  { value: 1.2,  suffix: "M+", label: "Products Listed",   prefix: "",  color: "#06b6d4" },
  { value: 98,   suffix: "%",  label: "Satisfaction Rate", prefix: "",  color: "#10b981" },
];

const CHART_DATA = [
  { month: "Jan", revenue: 12400 },
  { month: "Feb", revenue: 18800 },
  { month: "Mar", revenue: 15200 },
  { month: "Apr", revenue: 24100 },
  { month: "May", revenue: 31500 },
  { month: "Jun", revenue: 28900 },
  { month: "Jul", revenue: 38200 },
];

const TICKER_ITEMS = [
  "50K+ Vendors", "Lightning Checkout", "Real-time Analytics", "Global Shipping",
  "Secure Payments", "Multi-vendor", "AI-powered Search", "24/7 Support",
  "Instant Payouts", "Buyer Protection", "Smart SEO", "Live Inventory",
];

// ════════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ════════════════════════════════════════════════════════════════════════════════

const ease = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const staggerFast = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

const slideFromLeft = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.85, ease } },
};

const slideFromRight = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.85, ease } },
};

// ════════════════════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════════

function SectionWrapper({ children, className = "" }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-90px" }}
      variants={stagger}
      className={`relative z-10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionPill({ children }) {
  return (
    <motion.div
      variants={item}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 text-[11px] font-semibold tracking-[0.12em] uppercase"
      style={{
        background: "rgba(59,130,246,0.07)",
        border: "1px solid rgba(59,130,246,0.22)",
        color: "#60a5fa",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
      {children}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM HOOKS
// ════════════════════════════════════════════════════════════════════════════════

function useCountUp(target, duration = 2200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(parseFloat((eased * target).toFixed(1)));
      if (frame >= totalFrames) { setCount(target); clearInterval(timer); }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// ════════════════════════════════════════════════════════════════════════════════
// 1. ANIMATED BACKGROUND
// ════════════════════════════════════════════════════════════════════════════════

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-black" />

      {/* Top radial hero glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[90vh]"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(37,99,235,0.14) 0%, transparent 70%)" }}
      />

      {/* Blob 1 — blue */}
      <div
        className="absolute -top-48 -left-48 w-[680px] h-[680px] rounded-full animate-blob"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
      />

      {/* Blob 2 — purple */}
      <div
        className="absolute top-[45%] -right-48 w-[560px] h-[560px] rounded-full animate-blob animation-delay-2000"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
      />

      {/* Blob 3 — cyan */}
      <div
        className="absolute -bottom-32 left-1/4 w-[480px] h-[480px] rounded-full animate-blob animation-delay-4000"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
      />

      {/* Grid texture */}
      <div className="absolute inset-0 grid-bg opacity-[0.028]" />

      {/* Bottom fade to black */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 2. HERO SECTION
// ════════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { stiffness: 35, damping: 28 };
  const sX = useSpring(mouseX, springCfg);
  const sY = useSpring(mouseY, springCfg);

  // Parallax transforms for floating cards
  const leftCardX  = useTransform(sX, [-700, 700], [-22, 22]);
  const rightCardX = useTransform(sX, [-700, 700], [22, -22]);
  const cardY      = useTransform(sY, [-500, 500], [-14, 14]);

  // Scroll-based parallax for the hero content
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -80]);

  const handleMouseMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left - r.width  / 2);
    mouseY.set(e.clientY - r.top  - r.height / 2);
  }, [mouseX, mouseY]);

  const wordVariant = {
    hidden:  { opacity: 0, y: 80, rotateX: -20 },
    visible: (i) => ({
      opacity: 1, y: 0, rotateX: 0,
      transition: { duration: 0.95, ease, delay: i * 0.13 },
    }),
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-24 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Centre radial glow */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(37,99,235,0.16) 0%, transparent 65%)" }}
      />

      {/* Hero SVG grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hg" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#3b82f6" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hg)" />
        </svg>
      </div>

      {/* Main content */}
      <motion.div
        style={{ y: heroY }}
        className="relative z-10 text-center max-w-5xl mx-auto w-full"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "backOut" }}
          className="inline-flex items-center gap-2.5 mb-9 px-4 py-2 rounded-full"
          style={{
            background: "rgba(59,130,246,0.07)",
            border: "1px solid rgba(59,130,246,0.22)",
            backdropFilter: "blur(14px)",
          }}
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-70" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-blue-400 text-sm font-medium tracking-wide">Vendora v2.0 is Live</span>
          <span className="h-3.5 w-px bg-blue-900/60" />
          <span className="text-slate-500 text-sm">Multi-Vendor Marketplace</span>
        </motion.div>

        {/* Headline — word by word 3-D reveal */}
        <div className="perspective-1000 mb-7">
          <h1 className="text-[clamp(2.8rem,9.5vw,7.5rem)] font-black tracking-tighter leading-[0.9] select-none">
            {["The", "Marketplace"].map((w, i) => (
              <motion.span
                key={w}
                custom={i}
                variants={wordVariant}
                initial="hidden"
                animate="visible"
                className="inline-block mr-[0.2em] text-white"
                style={{ transformOrigin: "bottom center" }}
              >
                {w}
              </motion.span>
            ))}
            <br />
            {["of", "Tomorrow"].map((w, i) => (
              <motion.span
                key={w}
                custom={i + 2}
                variants={wordVariant}
                initial="hidden"
                animate="visible"
                className={`inline-block mr-[0.2em] ${w === "Tomorrow" ? "text-gradient-animated" : "text-white"}`}
                style={{ transformOrigin: "bottom center" }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.62 }}
          className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Vendora connects vendors and buyers in a{" "}
          <span className="text-white font-medium">seamless marketplace</span>{" "}
          experience built for the next generation of commerce.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.78 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/shop">
            <motion.button
              whileHover={{
                scale: 1.055,
                boxShadow: "0 0 48px rgba(37,99,235,0.55), 0 0 100px rgba(37,99,235,0.15)",
              }}
              whileTap={{ scale: 0.96 }}
              className="relative group overflow-hidden px-9 py-4 rounded-full font-semibold text-white flex items-center gap-2 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 0 32px rgba(37,99,235,0.38), 0 0 72px rgba(37,99,235,0.1)",
              }}
            >
              <span className="relative z-10 text-[0.95rem]">Start Shopping</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
              {/* Shimmer sweep */}
              <span className="absolute inset-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/14 to-transparent pointer-events-none" />
            </motion.button>
          </Link>

          <Link href="/sign-up?role=vendor">
            <motion.button
              whileHover={{
                scale: 1.04,
                borderColor: "rgba(59,130,246,0.45)",
                background: "rgba(59,130,246,0.07)",
              }}
              whileTap={{ scale: 0.96 }}
              className="px-9 py-4 rounded-full font-semibold flex items-center gap-2 text-slate-200 transition-colors duration-250 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              Become a Seller
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 1.0 }}
          className="flex items-center justify-center gap-6 flex-wrap"
        >
          {[
            { label: "50K+ Vendors",    dot: "#3b82f6" },
            { label: "1.2M Products",   dot: "#8b5cf6" },
            { label: "$2.4M+ GMV",      dot: "#06b6d4" },
            { label: "98% Satisfaction",dot: "#10b981" },
          ].map(({ label, dot }, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
              <span className="text-slate-500 text-sm">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Floating analytics card (left) ── */}
      <motion.div
        style={{ x: leftCardX, y: cardY }}
        className="absolute left-[4%] top-1/2 -translate-y-[55%] hidden xl:block animate-float"
      >
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.2, ease }}
          className="glass-premium rounded-2xl p-5 w-60 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.14)" }}
              >
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Revenue</p>
                <p className="text-[11px] text-slate-400 font-medium">This Week</p>
              </div>
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full text-emerald-400 font-semibold"
              style={{ background: "rgba(16,185,129,0.12)" }}
            >
              Live
            </span>
          </div>
          <p className="text-[1.7rem] font-black text-white tracking-tight mb-1">$24,891</p>
          <p className="text-xs text-emerald-400 font-medium mb-3">↑ +18.4% vs last week</p>
          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 1.6, delay: 1.8, ease: "easeOut" }}
              className="h-1.5 rounded-full"
              style={{ background: "linear-gradient(90deg, #1d4ed8, #60a5fa)" }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5">72% of monthly goal</p>
        </motion.div>
      </motion.div>

      {/* ── Floating live orders card (right) ── */}
      <motion.div
        style={{ x: rightCardX, y: cardY }}
        className="absolute right-[4%] top-1/2 -translate-y-[45%] hidden xl:block animate-float animation-delay-3000"
      >
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.35, ease }}
          className="glass-premium rounded-2xl p-5 w-60 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.14)" }}
              >
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-[11px] font-medium text-slate-300">Live Orders</p>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: "Neural Headset Pro",  price: "$299", dot: "#3b82f6" },
              { name: "Quantum Watch X",     price: "$599", dot: "#8b5cf6" },
              { name: "Arc Keyboard MK2",    price: "$189", dot: "#06b6d4" },
            ].map((order, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 + i * 0.18, ease }}
                className="flex items-center gap-2.5"
              >
                <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: order.dot }} />
                <span className="text-[11px] text-slate-300 flex-1 truncate">{order.name}</span>
                <span className="text-[11px] text-slate-500 flex-shrink-0 font-medium">{order.price}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] text-slate-600 text-right">Updated just now</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-slate-700 text-[9px] tracking-[0.35em] uppercase font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="w-0.5 h-2 rounded-full bg-blue-500 opacity-80" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 3. MARQUEE TICKER STRIP
// ════════════════════════════════════════════════════════════════════════════════

function MarqueeStrip() {
  return (
    <div
      className="relative z-10 overflow-hidden py-3.5"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(255,255,255,0.018)",
      }}
    >
      <div className="flex gap-14 animate-ticker whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-widest text-slate-600 uppercase flex-shrink-0"
          >
            <span className="h-1 w-1 rounded-full bg-blue-800" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 4. MARKETPLACE SHOWCASE
// ════════════════════════════════════════════════════════════════════════════════

function ProductCard({ product, index }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -10, transition: { duration: 0.3, ease } }}
      className="group relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg, rgba(22,22,22,0.85) 0%, rgba(10,10,10,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
          style={{ transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{ background: "linear-gradient(to top, rgba(37,99,235,0.18), transparent)" }}
        />

        {/* Category badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "#a3a3a3",
          }}
        >
          {product.category}
        </div>

        {/* Wishlist */}
        <button
          id={`wishlist-${product.id}`}
          onClick={() => setLiked((p) => !p)}
          className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: liked ? "rgba(239,68,68,0.85)" : "rgba(0,0,0,0.65)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-all duration-200 ${
              liked ? "fill-white text-white scale-110" : "text-slate-400"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <Link
          href={`/product/${product.id}`}
          className="font-bold text-white hover:text-blue-400 transition-colors text-[1.05rem] leading-snug mb-2.5 block"
        >
          {product.name}
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, j) => (
            <Star
              key={j}
              className={`h-3 w-3 ${
                j < Math.floor(product.rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-slate-800"
              }`}
            />
          ))}
          <span className="text-slate-500 text-[11px] ml-1">
            {product.rating} ({product.reviews.toLocaleString()})
          </span>
        </div>

        <div
          className="flex items-center justify-between mt-auto pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="text-[1.6rem] font-black text-white tracking-tight">${product.price}</span>
          <Link href={`/product/${product.id}`}>
            <motion.button
              id={`view-product-${product.id}`}
              whileHover={{ scale: 1.06, boxShadow: "0 0 22px rgba(37,99,235,0.45)" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
            >
              View →
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function MarketplaceShowcase() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((data) => {
      // Limit to 6 featured products for the landing page
      setProducts(data.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-28 relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <SectionWrapper>
          <div className="text-center mb-16">
            <SectionPill>Marketplace</SectionPill>
            <motion.h2 variants={item} className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
              Shop the Future
            </motion.h2>
            <motion.p variants={item} className="text-slate-400 text-lg max-w-xl mx-auto">
              Curated products from verified vendors. Premium quality, guaranteed.
            </motion.p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-slate-800/50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </motion.div>
          )}

          <motion.div variants={item} className="text-center mt-12">
            <Link href="/shop">
              <motion.button
                id="view-all-products"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-slate-300"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                }}
              >
                Browse All Products
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>
        </SectionWrapper>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 5. FEATURE HIGHLIGHTS
// ════════════════════════════════════════════════════════════════════════════════

function FeatureHighlights() {
  return (
    <section className="py-28 relative z-10">
      {/* Subtle section bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(37,99,235,0.04) 0%, transparent 65%)" }}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        <SectionWrapper>
          <div className="text-center mb-16">
            <SectionPill>Why Vendora</SectionPill>
            <motion.h2 variants={item} className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
              Built Different
            </motion.h2>
            <motion.p variants={item} className="text-slate-400 text-lg max-w-xl mx-auto">
              Every detail engineered for velocity, security, and infinite scale.
            </motion.p>
          </div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -8, transition: { duration: 0.28 } }}
                className="group relative p-7 rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, rgba(22,22,22,0.7) 0%, rgba(10,10,10,0.85) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Hover border glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 0 1px ${f.color}28, 0 0 40px ${f.color}0a` }}
                />

                {/* Corner accent */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${f.color}14 0%, transparent 70%)`,
                    transform: "translate(30%, -30%)",
                  }}
                />

                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: f.bg }}
                >
                  <f.icon className="h-5.5 w-5.5" style={{ color: f.color }} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2.5">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{f.desc}</p>

                <div
                  className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all duration-200"
                  style={{ color: f.color }}
                >
                  <span>Learn more</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </SectionWrapper>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 6. VENDOR DASHBOARD PREVIEW
// ════════════════════════════════════════════════════════════════════════════════

function DashboardMockup() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-6"
      style={{
        background: "linear-gradient(155deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(59,130,246,0.08)",
      }}
    >
      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] rounded-2xl"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Dashboard header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">Vendora</p>
          <p className="text-white font-bold text-sm">Vendor Dashboard</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-400"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Revenue",  value: "$38,200", delta: "+22%",  color: "#3b82f6" },
          { label: "Orders",   value: "284",     delta: "+14%",  color: "#8b5cf6" },
          { label: "Rating",   value: "4.9 ★",   delta: "Top 5%",color: "#10b981" },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-xl p-3.5"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <p className="text-slate-600 text-[10px] mb-1.5 uppercase tracking-wider">{s.label}</p>
            <p className="text-white font-bold text-sm mb-0.5">{s.value}</p>
            <p className="text-[10px] font-semibold" style={{ color: s.color }}>{s.delta}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {mounted && AreaChart && (
        <div
          className="mb-5 rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.018)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-3">Revenue · 7 months</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: 11,
                    padding: "6px 10px",
                  }}
                  formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]}
                  labelStyle={{ color: "#737373", marginBottom: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#rev)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-3">Recent Orders</p>
        <div className="space-y-1.5">
          {[
            { name: "Neural Headset Pro", status: "Delivered", amount: "$299", s: "emerald" },
            { name: "Quantum Watch X",    status: "Shipped",   amount: "$599", s: "blue"    },
            { name: "Arc Keyboard MK2",   status: "Processing",amount: "$189", s: "yellow"  },
          ].map((o, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 px-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.022)" }}
            >
              <span className="text-[11px] text-slate-300 flex-1 truncate">{o.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                  o.s === "emerald"
                    ? "text-emerald-400 bg-emerald-400/10"
                    : o.s === "blue"
                    ? "text-blue-400 bg-blue-400/10"
                    : "text-yellow-400 bg-yellow-400/10"
                }`}
              >
                {o.status}
              </span>
              <span className="text-[11px] text-white font-bold flex-shrink-0">{o.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VendorDashboardPreview() {
  return (
    <section className="py-28 relative z-10 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 70% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left copy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.div variants={item}>
              <SectionPill>For Vendors</SectionPill>
            </motion.div>

            <motion.h2
              variants={item}
              className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white leading-[1.05]"
            >
              Power your business
              <br />
              <span className="text-gradient">without limits.</span>
            </motion.h2>

            <motion.p variants={item} className="text-slate-400 text-lg leading-relaxed mb-8">
              Get a real-time command centre that gives you revenue, orders, analytics, and inventory
              management — in one beautifully crafted interface.
            </motion.p>

            <motion.ul variants={stagger} className="space-y-3 mb-10">
              {[
                "Real-time revenue tracking",
                "Multi-product inventory management",
                "Customer analytics & audience insights",
                "Automated order processing & notifications",
                "Built-in SEO & store customisation tools",
              ].map((text, i) => (
                <motion.li key={i} variants={item} className="flex items-center gap-3">
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.3)",
                    }}
                  >
                    <Check className="h-3 w-3 text-blue-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={item}>
              <Link href="/sign-up?role=vendor">
                <motion.button
                  id="start-selling-btn"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 44px rgba(37,99,235,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 0 28px rgba(37,99,235,0.3)",
                  }}
                >
                  Start Selling Free
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 70, rotateY: -6 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease }}
            className="relative"
            style={{ perspective: "1200px" }}
          >
            <DashboardMockup />

            {/* Glow halo behind mockup */}
            <div
              className="absolute -inset-6 -z-10 rounded-3xl opacity-35"
              style={{
                background: "radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 65%)",
                filter: "blur(36px)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 7. STATISTICS SECTION
// ════════════════════════════════════════════════════════════════════════════════

function StatCounter({ value, suffix, prefix, label, color }) {
  const { count, ref } = useCountUp(value);
  const display = value % 1 !== 0 ? count.toFixed(1) : Math.round(count).toLocaleString();

  return (
    <div ref={ref} className="text-center">
      <p
        className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-2 tabular-nums"
        style={{ color }}
      >
        {prefix}
        {display}
        {suffix}
      </p>
      <p className="text-slate-500 text-sm tracking-wide">{label}</p>
    </div>
  );
}

function StatisticsSection() {
  return (
    <section className="py-28 relative z-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(37,99,235,0.055) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 max-w-5xl">
        <SectionWrapper>
          <div className="text-center mb-16">
            <SectionPill>By the Numbers</SectionPill>
            <motion.h2 variants={item} className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              Trusted at Scale
            </motion.h2>
          </div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-10"
          >
            {STATS.map((stat, i) => (
              <motion.div key={i} variants={item}>
                <StatCounter {...stat} />
              </motion.div>
            ))}
          </motion.div>
        </SectionWrapper>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 8. TESTIMONIALS
// ════════════════════════════════════════════════════════════════════════════════

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #2563eb, #7c3aed)",
  "linear-gradient(135deg, #0891b2, #2563eb)",
  "linear-gradient(135deg, #7c3aed, #db2777)",
  "linear-gradient(135deg, #059669, #0891b2)",
];

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-28 relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <SectionWrapper>
          <div className="text-center mb-16">
            <SectionPill>Testimonials</SectionPill>
            <motion.h2 variants={item} className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
              Loved by Thousands
            </motion.h2>
            <motion.p variants={item} className="text-slate-400 text-lg max-w-xl mx-auto">
              Vendors and buyers who have made Vendora their home.
            </motion.p>
          </div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -8, transition: { duration: 0.28 } }}
                className="relative p-6 rounded-2xl cursor-pointer transition-all duration-500"
                style={{
                  background:
                    active === i
                      ? "linear-gradient(160deg, rgba(37,99,235,0.12) 0%, rgba(16,16,16,0.9) 100%)"
                      : "linear-gradient(160deg, rgba(20,20,20,0.7) 0%, rgba(10,10,10,0.85) 100%)",
                  border:
                    active === i
                      ? "1px solid rgba(59,130,246,0.28)"
                      : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: active === i ? "0 0 40px rgba(37,99,235,0.1)" : "none",
                }}
                onClick={() => setActive(i)}
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>

                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: AVATAR_GRADIENTS[i] }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{t.name}</p>
                    <p className="text-slate-500 text-[11px]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Dot nav */}
          <motion.div variants={item} className="flex items-center justify-center gap-2 mt-10">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                id={`testimonial-dot-${i}`}
                onClick={() => setActive(i)}
                className="h-1.5 rounded-full transition-all duration-400 cursor-pointer"
                style={{
                  width: active === i ? "2rem" : "0.375rem",
                  background: active === i ? "#3b82f6" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </motion.div>
        </SectionWrapper>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 9. HOW IT WORKS
// ════════════════════════════════════════════════════════════════════════════════

function HowItWorksSection() {
  return (
    <section className="py-28 relative z-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <SectionWrapper>
          <div className="text-center mb-16">
            <SectionPill>How It Works</SectionPill>
            <motion.h2 variants={item} className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
              Simple as 1-2-3
            </motion.h2>
            <motion.p variants={item} className="text-slate-400 text-lg max-w-xl mx-auto">
              From sign-up to your first transaction — in minutes, not days.
            </motion.p>
          </div>

          <motion.div variants={stagger} className="relative">
            {/* Connector line — desktop */}
            <div
              className="absolute top-10 left-[16.5%] right-[16.5%] h-px hidden md:block"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(59,130,246,0.35) 20%, rgba(59,130,246,0.35) 80%, transparent)",
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon box */}
                  <div className="relative mb-6">
                    <div
                      className="h-20 w-20 rounded-2xl flex items-center justify-center relative"
                      style={{
                        background: "linear-gradient(145deg, rgba(37,99,235,0.18), rgba(37,99,235,0.06))",
                        border: "1px solid rgba(59,130,246,0.22)",
                        boxShadow: "0 0 40px rgba(37,99,235,0.18)",
                      }}
                    >
                      <step.icon className="h-8 w-8 text-blue-400" />
                    </div>
                    {/* Step number badge */}
                    <div
                      className="absolute -top-3 -right-3 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black text-blue-400"
                      style={{
                        background: "#050505",
                        border: "1px solid rgba(59,130,246,0.28)",
                      }}
                    >
                      {step.num}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </SectionWrapper>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// 10. CTA BANNER
// ════════════════════════════════════════════════════════════════════════════════

function CTABanner() {
  return (
    <section className="py-28 relative z-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease }}
          className="relative rounded-3xl p-12 md:p-20 text-center overflow-hidden"
          style={{
            background: "linear-gradient(155deg, rgba(22,22,22,0.92) 0%, rgba(10,10,10,0.97) 100%)",
            border: "1px solid rgba(59,130,246,0.14)",
          }}
        >
          {/* Animated blob bg */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div
              className="absolute -top-32 -left-32 w-80 h-80 rounded-full animate-blob"
              style={{
                background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
                filter: "blur(45px)",
              }}
            />
            <div
              className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full animate-blob animation-delay-2000"
              style={{
                background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
                filter: "blur(45px)",
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 65%)",
                filter: "blur(30px)",
              }}
            />
          </div>

          {/* Gradient inner border shimmer */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                "linear-gradient(145deg, rgba(59,130,246,0.06), transparent 40%, rgba(139,92,246,0.05))",
            }}
          />

          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full text-sm"
              style={{
                background: "rgba(59,130,246,0.07)",
                border: "1px solid rgba(59,130,246,0.2)",
                color: "#60a5fa",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Ready to get started?
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-5 text-white leading-[1.0]">
              Join the future
              <br />
              of commerce.
            </h2>

            <p className="text-slate-400 text-lg mb-11 max-w-lg mx-auto">
              Whether you're a buyer or a vendor — Vendora is your marketplace. Start free, no credit card
              required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <motion.button
                  id="cta-get-started"
                  whileHover={{ scale: 1.055, boxShadow: "0 0 55px rgba(37,99,235,0.55)" }}
                  whileTap={{ scale: 0.97 }}
                  className="relative overflow-hidden px-10 py-4 rounded-full font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 0 32px rgba(37,99,235,0.38)",
                  }}
                >
                  <span className="relative z-10">Get Started Free</span>
                  <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/12 to-transparent" />
                </motion.button>
              </Link>

              <Link href="/shop">
                <motion.button
                  id="cta-explore"
                  whileHover={{ scale: 1.04, borderColor: "rgba(59,130,246,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 rounded-full font-semibold text-slate-300 transition-colors duration-300"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  Explore Products
                </motion.button>
              </Link>
            </div>

            {/* Micro social proof */}
            <p className="mt-8 text-slate-600 text-xs">
              Trusted by{" "}
              <span className="text-slate-400 font-medium">50,000+</span> vendors and{" "}
              <span className="text-slate-400 font-medium">1.2M+</span> buyers worldwide
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ════════════════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Fixed layered background */}
      <AnimatedBackground />

      {/* Sections */}
      <HeroSection />
      <MarqueeStrip />

      <MarketplaceShowcase />

      <div className="section-divider" />
      <FeatureHighlights />

      <div className="section-divider" />
      <VendorDashboardPreview />

      <div className="section-divider" />
      <StatisticsSection />

      <div className="section-divider" />
      <TestimonialsSection />

      <div className="section-divider" />
      <HowItWorksSection />

      <CTABanner />
    </div>
  );
}
