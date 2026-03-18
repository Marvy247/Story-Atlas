'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { ArrowRight, BarChart3, GitBranch, Search, Zap, Globe, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Globe,
    title: 'Live Mainnet Data',
    desc: 'Visualizes all 5.6M+ IP assets on Story Protocol mainnet in real time.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: GitBranch,
    title: 'Derivative Chains',
    desc: 'Trace the full lineage of any IP — see every remix, fork, and derivative relationship.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Search,
    title: 'Smart Search & Filter',
    desc: 'Find any IP by name, filter by license type, media type, or commercial status.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'License distribution, trending IPs, creator stats, and IP creation over time.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: Zap,
    title: 'Force-Directed Graph',
    desc: 'D3-powered physics simulation — nodes cluster by relationship, zoom and pan freely.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Shield,
    title: 'Open Source',
    desc: 'Fully open source, MIT licensed. Built for the Story Protocol developer community.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
];

const NODE_COLORS = [
  { label: 'Commercial Remix', color: '#22c55e' },
  { label: 'Commercial Only', color: '#3b82f6' },
  { label: 'Non-Commercial Remix', color: '#f97316' },
  { label: 'Attribution Only', color: '#a855f7' },
  { label: 'No License', color: '#71717a' },
];

function GraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#71717a', '#06b6d4'];
    const nodes = Array.from({ length: 55 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 5 + 3,
      color: colors[i % colors.length],
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '44';
        ctx.fill();
        ctx.strokeStyle = n.color + '99';
        ctx.lineWidth = 1;
        ctx.stroke();
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } as object },
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Story Atlas</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-white hidden sm:flex">
              <Link href="/analytics">Analytics</Link>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-500 text-white">
              <Link href="/graph">Launch App <ArrowRight className="ml-1.5 w-3.5 h-3.5" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GraphBackground />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 pointer-events-none" />

        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
          style={{ y: heroY }}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Live on Story Protocol Mainnet
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            Explore the{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              IP Universe
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Story Atlas visualizes every IP asset, derivative chain, and licensing relationship
            on Story Protocol as a living, interactive graph.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20">
              <Link href="/graph">Explore the Graph <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 px-8 h-12 text-base">
              <Link href="/analytics">View Analytics</Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
            {[
              { value: '5.6M+', label: 'IP Assets' },
              { value: 'Mainnet', label: 'Story Protocol' },
              { value: 'Real-time', label: 'Live Data' },
              { value: 'Open Source', label: 'MIT License' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-16 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p variants={fadeUp} className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight">Everything you need to explore IP</motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {FEATURES.map(f => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className={`rounded-xl border ${f.border} ${f.bg} p-6 hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className={`w-10 h-10 rounded-lg ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-zinc-800/60">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <div>
              <motion.p variants={fadeUp} className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">How it works</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight mb-6">
                Every node tells a story
              </motion.h2>
              <motion.p variants={fadeUp} className="text-zinc-400 leading-relaxed mb-8">
                Each circle is an IP asset. Its color shows the license type. Its size reflects how many derivatives it has spawned. Edges connect parent IPs to their remixes — follow the chain to trace creative lineage across the entire ecosystem.
              </motion.p>
              <motion.div variants={fadeUp} className="space-y-3">
                {NODE_COLORS.map(n => (
                  <div key={n.label} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: n.color }} />
                    <span className="text-sm text-zinc-300">{n.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              className="relative h-72 rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden"
            >
              <GraphBackground />
              <div className="absolute inset-0 flex items-center justify-center">
                <Link href="/graph">
                  <motion.div
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950/80 border border-zinc-700 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors backdrop-blur-sm cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ArrowRight className="w-4 h-4" /> Open full graph
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-28 px-4 sm:px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 sm:p-12 overflow-hidden"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight mb-4">
              Start exploring now
            </motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400 mb-8 text-lg">
              No wallet. No sign-up. Just the full Story Protocol IP graph, live.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-12 text-base font-semibold shadow-lg shadow-blue-500/20">
                <Link href="/graph">Launch Story Atlas <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="text-zinc-400 hover:text-white h-12 text-base">
                <a href="https://github.com/storyprotocol" target="_blank" rel="noopener noreferrer">View on GitHub</a>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GitBranch className="w-3 h-3 text-white" />
            </div>
            <span>Story Atlas — Built for Story Protocol</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link href="/graph" className="hover:text-zinc-300 transition-colors">Graph</Link>
            <Link href="/analytics" className="hover:text-zinc-300 transition-colors">Analytics</Link>
            <a href="https://docs.story.foundation" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Docs</a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
