"use client";

import Link from "next/link";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react";

const BLOG_POSTS = [
  {
    id: 1,
    title: "How to Automate WhatsApp Sales for E-Commerce",
    excerpt: "Learn how to use keywords, catalog integration, and automated follow-ups to increase your e-commerce conversion rates by up to 35%.",
    category: "Guides",
    date: "July 12, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "The Ultimate Guide to WhatsApp Cloud API Limits",
    excerpt: "Everything you need to know about messaging tiers, template approvals, and how to scale your business number to unlimited messages.",
    category: "Technical",
    date: "July 8, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "5 WhatsApp CRM Features Every D2C Brand Needs",
    excerpt: "From abandoned cart recovery to VIP customer segmentation, discover the must-have features for D2C growth in 2026.",
    category: "Strategy",
    date: "June 28, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Introducing Zeenox AI Auto-Reply V2",
    excerpt: "We've completely overhauled our AI engine. Train your bots 10x faster with PDF uploads and website scraping.",
    category: "Product News",
    date: "June 15, 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "How XYZ Corp Reduced Support Tickets by 60%",
    excerpt: "A deep dive into how a leading logistics company implemented Zeenox to automate tracking updates and customer queries.",
    category: "Case Study",
    date: "May 30, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 6,
    title: "WhatsApp Marketing vs SMS: Which is Better?",
    excerpt: "An data-driven comparison of open rates, ROI, and customer engagement across WhatsApp and traditional SMS marketing.",
    category: "Comparison",
    date: "May 12, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=800",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090f] text-slate-900 dark:text-slate-200 font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Zeenox <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Insights</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-xl">
              The latest news, guides, and strategies to help you grow your business on WhatsApp.
            </p>
          </div>
        </header>

        {/* Featured Post (Optional, currently just showing grid) */}
        
        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="group flex flex-col">
              <article className="h-full flex flex-col bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                
                {/* Image Wrapper */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
                    {post.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                    <time>{post.date}</time>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Read Article 
                    <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

              </article>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
