"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/api";

type Product = {
  ProductID: number;
  ProductName: string;
  Price: number;
  CategoryID?: number;
};

type Category = {
  CategoryID: number;
  CategoryName: string;
};

const images = [
  "/bg/p1.png", "/bg/p2.png", "/bg/p3.png", "/bg/p4.png",
  "/bg/p5.png", "/bg/p6.png", "/bg/p7.png", "/bg/p8.png",
];

const COPIES_PER_IMAGE = 6; // Konsistent mit 48 Sprites

function prng(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "name" | "price" | "category">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, c] = await Promise.all([getProducts(), getCategories()]);
        setProducts(Array.isArray(p) ? p : []);
        setCategories(Array.isArray(c) ? c : []);
      } catch (e: any) {
        setMsg(`❌ ${e?.message || "Failed to load data"}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryNameById = useMemo(() => {
    const m = new Map<number, string>();
    categories.forEach((c) => m.set(c.CategoryID, c.CategoryName));
    return m;
  }, [categories]);

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;

    if (categoryId !== "") {
      list = list.filter((p) => p.CategoryID === categoryId);
    }

    if (q) {
      list = list.filter((p) => p.ProductName.toLowerCase().includes(q));
    }

    const sorted = [...list].sort((a, b) => {
      if (sortBy === "id") return a.ProductID - b.ProductID;
      if (sortBy === "name") return a.ProductName.localeCompare(b.ProductName);
      if (sortBy === "price") return (a.Price ?? 0) - (b.Price ?? 0);
      if (sortBy === "category") {
        const catA = categoryNameById.get(a.CategoryID ?? -1) || "General";
        const catB = categoryNameById.get(b.CategoryID ?? -1) || "General";
        return catA.localeCompare(catB);
      }
      return 0;
    });

    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [products, query, categoryId, sortBy, sortDir, categoryNameById]);

  const sprites = useMemo(() => {
    return images.flatMap((src, i) =>
      Array.from({ length: COPIES_PER_IMAGE }).map((_, k) => {
        const idx = i * 100 + k;
        const x = prng(idx * 17 + 1) * 100;
        const y = prng(idx * 19 + 2) * 100;
        const size = 110 + Math.floor((prng(idx * 23 + 3) - 0.5) * 2 * 12);
        const duration = 15 + prng(idx * 29 + 4) * 17;
        const delay = -prng(idx * 31 + 5) * duration;
        const rot = 220 + Math.floor(prng(idx * 37 + 6) * 520);
        const ax = 600 + prng(idx * 41 + 7) * 900;
        const ay = 280 + prng(idx * 43 + 8) * 700;
        return { 
          key: `${src}-${k}`, src, x, y, size, duration, delay, rot, ax, ay, 
          cls: `fly fly-${(idx % 8) + 1}` 
        };
      })
    );
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-zinc-900">
      {/* Background Sprites */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {sprites.map((s) => (
          <img 
            key={s.key} 
            src={s.src} 
            alt=""
            className={s.cls} 
            style={{
              left: `${s.x}vw`, top: `${s.y}vh`, width: `${s.size}px`,
              animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
              ["--ax" as any]: `${s.ax}px`, ["--ay" as any]: `${s.ay}px`, ["--rot" as any]: `${s.rot}deg`,
            } as any} 
          />
        ))}
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="panel w-full max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Products</h1>
            </div>
            <div className="flex gap-2">
              <Link className="ghost-btn-sm" href="/">🏠 Home</Link>
              <Link className="ghost-btn-sm" href="/create-product">➕ Create</Link>
              <Link className="ghost-btn-sm" href="/update-product">✏️ Update</Link>
              <Link className="ghost-btn-sm" href="/delete-product">🗑️ Delete</Link>
            </div>
          </div>

          <div className="card-slim mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="label-sm">Category Filter</span>
              <select className="input-slim" value={categoryId} onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}>
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="label-sm">Search</span>
              <input className="input-slim" placeholder="Product name..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div>
              <span className="label-sm">Sort By</span>
              <select className="input-slim" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="id">ID</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div>
              <span className="label-sm">Order</span>
              <select className="input-slim" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {msg && <div className="status-msg err mb-4">{msg}</div>}
          {loading && <div className="text-center py-10 font-black text-zinc-300 animate-pulse uppercase tracking-widest">Loading Inventory...</div>}

          {!loading && (
            <div className="overflow-hidden border border-zinc-100 rounded-2xl bg-white/50 backdrop-blur-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="p-4 font-black uppercase text-[10px] text-zinc-400 tracking-wider border-b border-zinc-100">ID</th>
                    <th className="p-4 font-black uppercase text-[10px] text-zinc-400 tracking-wider border-b border-zinc-100">Product Name</th>
                    <th className="p-4 font-black uppercase text-[10px] text-zinc-400 tracking-wider border-b border-zinc-100">Price</th>
                    <th className="p-4 font-black uppercase text-[10px] text-zinc-400 tracking-wider border-b border-zinc-100">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {visibleProducts.map((p) => (
                    <tr key={p.ProductID} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-zinc-400">#{p.ProductID}</td>
                      <td className="p-4 font-bold text-zinc-900">{p.ProductName}</td>
                      <td className="p-4 font-bold text-zinc-600">
                        {typeof p.Price === "number" ? `$${p.Price.toFixed(2)}` : "—"}
                      </td>
                      <td className="p-4">
                        <span className="bg-zinc-100 text-zinc-500 text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tight">
                          {p.CategoryID ? (categoryNameById.get(p.CategoryID) ?? p.CategoryID) : "General"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleProducts.length === 0 && (
                <div className="p-12 text-center font-bold text-zinc-300 uppercase tracking-tighter">No products matched.</div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .panel{ padding: 28px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .ghost-btn-sm{ padding: 8px 14px; border-radius: 10px; background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); font-weight: 800; font-size: 11px; text-decoration: none; color: inherit; text-transform: uppercase; transition: all 0.2s; }
        .ghost-btn-sm:hover{ background: #000; color: #fff; }
        .card-slim{ border-radius: 18px; border: 1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.6); padding: 14px; }
        .label-sm{ font-size: 9px; font-weight: 900; color: #bbb; text-transform: uppercase; margin-bottom: 4px; display: block; letter-spacing: 0.05em; }
        .input-slim{ width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); background: #fff; font-size: 14px; outline: none; }
        .status-msg{ border-radius: 12px; padding: 12px; font-weight: 800; font-size: 13px; }
        .status-msg.err{ background: rgba(239,68,68,0.1); color: #991b1b; }

        .fly{ position: absolute; border-radius: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); opacity: 0.85; will-change: transform; pointer-events: none; }
        .fly-1{ animation: chaos1 linear infinite; } .fly-2{ animation: chaos2 linear infinite; }
        .fly-3{ animation: chaos3 linear infinite; } .fly-4{ animation: chaos4 linear infinite; }
        .fly-5{ animation: chaos5 linear infinite; } .fly-6{ animation: chaos6 linear infinite; }
        .fly-7{ animation: chaos7 linear infinite; } .fly-8{ animation: chaos8 linear infinite; }

        @keyframes chaos1{ 0%{ transform: translate(0,0) rotate(0deg); } 20%{ transform: translate(var(--ax), calc(var(--ay) * 0.3)) rotate(calc(var(--rot) * 0.25)); } 50%{ transform: translate(calc(var(--ax) * 0.2), var(--ay)) rotate(calc(var(--rot) * 0.6)); } 75%{ transform: translate(calc(var(--ax) * -0.7), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.85)); } 100%{ transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos2{ 0%{ transform: translate(0,0) rotate(0deg); } 25%{ transform: translate(calc(var(--ax) * -0.8), calc(var(--ay) * 0.35)) rotate(calc(var(--rot) * 0.25)); } 55%{ transform: translate(calc(var(--ax) * 0.1), calc(var(--ay) * -1)) rotate(calc(var(--rot) * 0.65)); } 80%{ transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * 0.1)) rotate(calc(var(--rot) * 0.9)); } 100%{ transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos3{ 0%{ transform: translate(0,0) rotate(0deg); } 18%{ transform: translate(calc(var(--ax) * 0.6), calc(var(--ay) * -0.5)) rotate(calc(var(--rot) * 0.2)); } 52%{ transform: translate(calc(var(--ax) * -0.25), calc(var(--ay) * 0.9)) rotate(calc(var(--rot) * 0.62)); } 82%{ transform: translate(calc(var(--ax) * -0.9), calc(var(--ay) * -0.2)) rotate(calc(var(--rot) * 0.9)); } 100%{ transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos4{ 0%{ transform: translate(0,0) rotate(0deg); } 28%{ transform: translate(calc(var(--ax) * -0.7), calc(var(--ay) * -0.35)) rotate(calc(var(--rot) * 0.3)); } 58%{ transform: translate(calc(var(--ax) * 0.85), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.7)); } 86%{ transform: translate(calc(var(--ax) * -0.1), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.92)); } 100%{ transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos5{ 0%{ transform: translate(0,0) rotate(0deg); } 22%{ transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * 0.25)) rotate(calc(var(--rot) * 0.25)); } 50%{ transform: translate(calc(var(--ax) * 0.15), calc(var(--ay) * -0.95)) rotate(calc(var(--rot) * 0.6)); } 78%{ transform: translate(calc(var(--ax) * -0.85), calc(var(--ay) * 0.1)) rotate(calc(var(--rot) * 0.88)); } 100%{ transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos6{ 0%{ transform: translate(0,0) rotate(0deg); } 26%{ transform: translate(calc(var(--ax) * -0.9), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.3)); } 56%{ transform: translate(calc(var(--ax) * 0.25), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.7)); } 84%{ transform: translate(calc(var(--ax) * 0.85), calc(var(--ay) * -0.25)) rotate(calc(var(--rot) * 0.92)); } 100%{ transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos7{ 0%{ transform: translate(0,0) rotate(0deg); } 20%{ transform: translate(calc(var(--ax) * 0.75), calc(var(--ay) * -0.25)) rotate(calc(var(--rot) * 0.22)); } 52%{ transform: translate(calc(var(--ax) * -0.2), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.65)); } 82%{ transform: translate(calc(var(--ax) * -0.85), calc(var(--ay) * -0.15)) rotate(calc(var(--rot) * 0.9)); } 100%{ transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos8{ 0%{ transform: translate(0,0) rotate(0deg); } 24%{ transform: translate(calc(var(--ax) * -0.75), calc(var(--ay) * 0.35)) rotate(calc(var(--rot) * 0.28)); } 54%{ transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * -0.15)) rotate(calc(var(--rot) * 0.7)); } 86%{ transform: translate(calc(var(--ax) * -0.1), calc(var(--ay) * -1.0)) rotate(calc(var(--rot) * 0.92)); } 100%{ transform: translate(0,0) rotate(var(--rot)); } }
      `}</style>
    </div>
  );
}