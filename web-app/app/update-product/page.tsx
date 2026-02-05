"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3100";

const images = [
  "/bg/p1.png", "/bg/p2.png", "/bg/p3.png", "/bg/p4.png",
  "/bg/p5.png", "/bg/p6.png", "/bg/p7.png", "/bg/p8.png",
];

const COPIES_PER_IMAGE = 5;

function prng(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export default function UpdateProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load products for the dropdown
  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setMsg("❌ Error loading products");
        setLoading(false);
      });
  }, []);

  // Auto-fill when product is selected
  useEffect(() => {
    if (selectedId) {
      const prod = products.find(p => p.ProductID === Number(selectedId));
      if (prod) {
        setProductName(prod.ProductName || "");
        setPrice(prod.Price ?? "");
      }
    } else {
      setProductName("");
      setPrice("");
    }
  }, [selectedId, products]);

  const sprites = useMemo(() => {
    return images.flatMap((src, i) =>
      Array.from({ length: COPIES_PER_IMAGE }).map((_, k) => {
        const idx = i * 100 + k;
        const x = prng(idx * 17 + 1) * 100;
        const y = prng(idx * 19 + 2) * 100;
        const BASE_SIZE = 110; 
        const VARIATION = 12;
        const size = BASE_SIZE + Math.floor((prng(idx * 23 + 3) - 0.5) * 2 * VARIATION);
        const duration = 15 + prng(idx * 29 + 4) * 17;
        const delay = -prng(idx * 31 + 5) * duration;
        const rot = 220 + Math.floor(prng(idx * 37 + 6) * 520);
        const ax = 600 + prng(idx * 41 + 7) * 900;
        const ay = 280 + prng(idx * 43 + 8) * 700;
        return { key: `${src}-${k}`, src, x, y, size, duration, delay, rot, ax, ay, cls: `fly fly-${(idx % 8) + 1}` };
      })
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    setUpdating(true);
    setMsg("");

    const payload: any = {};
    if (productName) payload.ProductName = productName;
    if (price !== "") payload.Price = Number(price);

    try {
      const res = await fetch(`${API_BASE}/products/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}

      if (!res.ok) throw new Error(data?.error || "Update failed");

      setMsg("✅ Product updated successfully");
      
      setProducts(prev => prev.map(p => 
        p.ProductID === Number(selectedId) 
        ? { ...p, ProductName: productName, Price: Number(price) } 
        : p
      ));
    } catch (err: any) {
      setMsg(`❌ Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-zinc-900">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {sprites.map((s) => (
          <img key={s.key} src={s.src} className={s.cls} style={{
            left: `${s.x}vw`, top: `${s.y}vh`, width: `${s.size}px`,
            animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
            ["--ax" as any]: `${s.ax}px`, ["--ay" as any]: `${s.ay}px`, ["--rot" as any]: `${s.rot}deg`,
          } as any} />
        ))}
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="panel w-full max-w-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Update Product</h1>
              <p className="text-[10px] text-zinc-400 uppercase font-black mt-1 tracking-widest">Edit product information</p>
            </div>
            <div className="flex gap-2">
              <Link className="ghost-btn-sm" href="/products">⬅ Back</Link>
              <Link className="ghost-btn-sm" href="/">🏠 Home</Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="card-slim">
              <label className="field">
                <span className="label-sm">Select Product</span>
                <select className="input-slim" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} disabled={loading || updating} required>
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.ProductID} value={p.ProductID}>{p.ProductName} (#{p.ProductID})</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="card-slim grid gap-4">
              <label className="field">
                <span className="label-sm">New Product Name</span>
                <input className="input-slim" placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)} disabled={!selectedId || updating} />
              </label>
              
              <label className="field">
                <span className="label-sm">New Price</span>
                <input className="input-slim" type="number" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} disabled={!selectedId || updating} />
              </label>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button className="submit-btn" type="submit" disabled={!selectedId || updating}>
                {updating ? "Saving..." : "Update Product"}
              </button>
              <Link className="cancel-link" href="/products">Cancel</Link>
            </div>

            {msg && <div className={`status-msg ${msg.startsWith("✅") ? "ok" : "err"}`}>{msg}</div>}
          </form>
        </div>
      </main>

      <style>{`
        .panel{ padding: 28px 22px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.10); background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); box-shadow: 0 18px 50px rgba(0,0,0,0.12); }
        .ghost-btn-sm{ padding: 6px 12px; border-radius: 8px; background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.1); font-weight: 700; font-size: 12px; text-decoration: none; color: inherit; }
        .card-slim{ border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.7); padding: 16px; }
        .label-sm{ font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; }
        .input-slim{ width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.12); background: #fff; font-size: 14px; outline: none; }
        .submit-btn{ padding: 12px 20px; border-radius: 12px; background: #111; color: #fff; font-weight: 900; font-size: 14px; border: none; cursor: pointer; transition: transform 0.15s; }
        .submit-btn:hover:not(:disabled){ transform: translateY(-1px); background: #333; }
        .submit-btn:disabled{ opacity: 0.3; cursor: not-allowed; }
        .cancel-link{ font-size: 13px; font-weight: 700; color: #999; text-decoration: none; }
        .status-msg{ border-radius: 12px; padding: 10px; font-weight: 800; font-size: 13px; margin-top: 10px; }
        .status-msg.ok{ background: rgba(16,185,129,0.1); color: #065f46; }
        .status-msg.err{ background: rgba(239,68,68,0.1); color: #991b1b; }
        .fly{ position: absolute; border-radius: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.12); will-change: transform; pointer-events: none; }
        .fly-1 { animation: chaos1 linear infinite; } .fly-2 { animation: chaos2 linear infinite; } .fly-3 { animation: chaos3 linear infinite; } .fly-4 { animation: chaos4 linear infinite; }
        .fly-5 { animation: chaos5 linear infinite; } .fly-6 { animation: chaos6 linear infinite; } .fly-7 { animation: chaos7 linear infinite; } .fly-8 { animation: chaos8 linear infinite; }
        @keyframes chaos1 { 0% { transform: translate(0,0) rotate(0deg); } 20% { transform: translate(var(--ax), calc(var(--ay) * 0.3)) rotate(calc(var(--rot) * 0.25)); } 50% { transform: translate(calc(var(--ax) * 0.2), var(--ay)) rotate(calc(var(--rot) * 0.6)); } 75% { transform: translate(calc(var(--ax) * -0.7), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.85)); } 100% { transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos2 { 0% { transform: translate(0,0) rotate(0deg); } 25% { transform: translate(calc(var(--ax) * -0.8), calc(var(--ay) * 0.35)) rotate(calc(var(--rot) * 0.25)); } 55% { transform: translate(calc(var(--ax) * 0.1), calc(var(--ay) * -1)) rotate(calc(var(--rot) * 0.65)); } 80% { transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * 0.1)) rotate(calc(var(--rot) * 0.9)); } 100% { transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos3 { 0% { transform: translate(0,0) rotate(0deg); } 18% { transform: translate(calc(var(--ax) * 0.6), calc(var(--ay) * -0.5)) rotate(calc(var(--rot) * 0.2)); } 52% { transform: translate(calc(var(--ax) * -0.25), calc(var(--ay) * 0.9)) rotate(calc(var(--rot) * 0.62)); } 82% { transform: translate(calc(var(--ax) * -0.9), calc(var(--ay) * -0.2)) rotate(calc(var(--rot) * 0.9)); } 100% { transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos4 { 0% { transform: translate(0,0) rotate(0deg); } 28% { transform: translate(calc(var(--ax) * -0.7), calc(var(--ay) * -0.35)) rotate(calc(var(--rot) * 0.3)); } 58% { transform: translate(calc(var(--ax) * 0.85), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.7)); } 86% { transform: translate(calc(var(--ax) * -0.1), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.92)); } 100% { transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos5 { 0% { transform: translate(0,0) rotate(0deg); } 22% { transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * 0.25)) rotate(calc(var(--rot) * 0.25)); } 50% { transform: translate(calc(var(--ax) * 0.15), calc(var(--ay) * -0.95)) rotate(calc(var(--rot) * 0.6)); } 78% { transform: translate(calc(var(--ax) * -0.85), calc(var(--ay) * 0.1)) rotate(calc(var(--rot) * 0.88)); } 100% { transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos6 { 0% { transform: translate(0,0) rotate(0deg); } 26% { transform: translate(calc(var(--ax) * -0.9), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.3)); } 56% { transform: translate(calc(var(--ax) * 0.25), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.7)); } 84% { transform: translate(calc(var(--ax) * 0.85), calc(var(--ay) * -0.25)) rotate(calc(var(--rot) * 0.92)); } 100% { transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos7 { 0% { transform: translate(0,0) rotate(0deg); } 20% { transform: translate(calc(var(--ax) * 0.75), calc(var(--ay) * -0.25)) rotate(calc(var(--rot) * 0.22)); } 52% { transform: translate(calc(var(--ax) * -0.2), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.65)); } 82% { transform: translate(calc(var(--ax) * -0.85), calc(var(--ay) * -0.15)) rotate(calc(var(--rot) * 0.9)); } 100% { transform: translate(0,0) rotate(var(--rot)); } }
        @keyframes chaos8 { 0% { transform: translate(0,0) rotate(0deg); } 24% { transform: translate(calc(var(--ax) * -0.75), calc(var(--ay) * 0.35)) rotate(calc(var(--rot) * 0.28)); } 54% { transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * -0.15)) rotate(calc(var(--rot) * 0.7)); } 86% { transform: translate(calc(var(--ax) * -0.1), calc(var(--ay) * -1.0)) rotate(calc(var(--rot) * 0.92)); } 100% { transform: translate(0,0) rotate(var(--rot)); } }
      `}</style>
    </div>
  );
}