import Link from "next/link";

const images = [
  "/bg/p1.png",
  "/bg/p2.png",
  "/bg/p3.png",
  "/bg/p4.png",
  "/bg/p5.png",
  "/bg/p6.png",
  "/bg/p7.png",
  "/bg/p8.png",
];

const COPIES_PER_IMAGE = 6; // 48 Bilder

function prng(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export default function Home() {
  const sprites = images.flatMap((src, i) =>
    Array.from({ length: COPIES_PER_IMAGE }).map((_, k) => {
      const idx = i * 100 + k;

      const x = prng(idx * 17 + 1) * 100; // vw
      const y = prng(idx * 19 + 2) * 100; // vh

      const BASE_SIZE = 110;
      const VARIATION = 15;
      const size =
      BASE_SIZE + Math.floor((prng(idx * 23 + 3) - 0.5) * 2 * VARIATION);
      // → ca. 95px – 125px


      // Tempo (schnell & smooth)
      const duration = 15 + prng(idx * 29 + 4) * 17; // 4..9s
      const delay = -prng(idx * 31 + 5) * duration;

      const rot = 220 + Math.floor(prng(idx * 37 + 6) * 520);
      const ax = 600 + prng(idx * 41 + 7) * 900;
      const ay = 280 + prng(idx * 43 + 8) * 700;

      return {
        key: `${src}-${k}`,
        src,
        x,
        y,
        size,
        duration,
        delay,
        rot,
        ax,
        ay,
        cls: `fly fly-${(idx % 8) + 1}`,
      };
    })
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-zinc-900">
      {/* Flying images */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {sprites.map((s) => (
          <img
            key={s.key}
            src={s.src}
            alt=""
            className={s.cls}
            style={
              {
                left: `${s.x}vw`,
                top: `${s.y}vh`,
                width: `${s.size}px`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
                ["--ax" as any]: `${s.ax}px`,
                ["--ay" as any]: `${s.ay}px`,
                ["--rot" as any]: `${s.rot}deg`,
              } as any
            }
          />
        ))}
      </div>

      {/* Content (readable glass panel) */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="panel w-full max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Projekt: Datenbanken und Webtechnologien
          </h1>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link className="nav-btn" href="/products">
              Products
            </Link>
            <Link className="nav-btn" href="/customers">
              Customers
            </Link>
            <Link className="nav-btn" href="/categories">
              Categories
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        .panel{
          padding: 28px 22px;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(10px);
          box-shadow:
            0 18px 50px rgba(0,0,0,0.12),
            0 1px 0 rgba(255,255,255,0.6) inset;
        }

        .nav-btn{
          padding: 0.9rem 1.8rem;
          border-radius: 14px;
          background: rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.14);
          transition: transform 0.15s, background 0.25s, box-shadow 0.25s;
          font-weight: 600;
        }
        .nav-btn:hover{
          background: rgba(0,0,0,0.07);
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.10);
        }

        .fly{
          position: absolute;
          border-radius: 14px;
          opacity: 1;          /* keine Transparenz */
          filter: none;        /* original Farben */
          box-shadow: 0 10px 25px rgba(0,0,0,0.10);
          will-change: transform;
          user-select: none;
          pointer-events: none;
        }

        .fly-1{ animation: chaos1 linear infinite; }
        .fly-2{ animation: chaos2 linear infinite; }
        .fly-3{ animation: chaos3 linear infinite; }
        .fly-4{ animation: chaos4 linear infinite; }
        .fly-5{ animation: chaos5 linear infinite; }
        .fly-6{ animation: chaos6 linear infinite; }
        .fly-7{ animation: chaos7 linear infinite; }
        .fly-8{ animation: chaos8 linear infinite; }

        @keyframes chaos1{
          0%{ transform: translate(0,0) rotate(0deg); }
          20%{ transform: translate(var(--ax), calc(var(--ay) * 0.3)) rotate(calc(var(--rot) * 0.25)); }
          50%{ transform: translate(calc(var(--ax) * 0.2), var(--ay)) rotate(calc(var(--rot) * 0.6)); }
          75%{ transform: translate(calc(var(--ax) * -0.7), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.85)); }
          100%{ transform: translate(0,0) rotate(var(--rot)); }
        }
        @keyframes chaos2{
          0%{ transform: translate(0,0) rotate(0deg); }
          25%{ transform: translate(calc(var(--ax) * -0.8), calc(var(--ay) * 0.35)) rotate(calc(var(--rot) * 0.25)); }
          55%{ transform: translate(calc(var(--ax) * 0.1), calc(var(--ay) * -1)) rotate(calc(var(--rot) * 0.65)); }
          80%{ transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * 0.1)) rotate(calc(var(--rot) * 0.9)); }
          100%{ transform: translate(0,0) rotate(var(--rot)); }
        }
        @keyframes chaos3{
          0%{ transform: translate(0,0) rotate(0deg); }
          18%{ transform: translate(calc(var(--ax) * 0.6), calc(var(--ay) * -0.5)) rotate(calc(var(--rot) * 0.2)); }
          52%{ transform: translate(calc(var(--ax) * -0.25), calc(var(--ay) * 0.9)) rotate(calc(var(--rot) * 0.62)); }
          82%{ transform: translate(calc(var(--ax) * -0.9), calc(var(--ay) * -0.2)) rotate(calc(var(--rot) * 0.9)); }
          100%{ transform: translate(0,0) rotate(var(--rot)); }
        }
        @keyframes chaos4{
          0%{ transform: translate(0,0) rotate(0deg); }
          28%{ transform: translate(calc(var(--ax) * -0.7), calc(var(--ay) * -0.35)) rotate(calc(var(--rot) * 0.3)); }
          58%{ transform: translate(calc(var(--ax) * 0.85), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.7)); }
          86%{ transform: translate(calc(var(--ax) * -0.1), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.92)); }
          100%{ transform: translate(0,0) rotate(var(--rot)); }
        }
        @keyframes chaos5{
          0%{ transform: translate(0,0) rotate(0deg); }
          22%{ transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * 0.25)) rotate(calc(var(--rot) * 0.25)); }
          50%{ transform: translate(calc(var(--ax) * 0.15), calc(var(--ay) * -0.95)) rotate(calc(var(--rot) * 0.6)); }
          78%{ transform: translate(calc(var(--ax) * -0.85), calc(var(--ay) * 0.1)) rotate(calc(var(--rot) * 0.88)); }
          100%{ transform: translate(0,0) rotate(var(--rot)); }
        }
        @keyframes chaos6{
          0%{ transform: translate(0,0) rotate(0deg); }
          26%{ transform: translate(calc(var(--ax) * -0.9), calc(var(--ay) * 0.15)) rotate(calc(var(--rot) * 0.3)); }
          56%{ transform: translate(calc(var(--ax) * 0.25), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.7)); }
          84%{ transform: translate(calc(var(--ax) * 0.85), calc(var(--ay) * -0.25)) rotate(calc(var(--rot) * 0.92)); }
          100%{ transform: translate(0,0) rotate(var(--rot)); }
        }
        @keyframes chaos7{
          0%{ transform: translate(0,0) rotate(0deg); }
          20%{ transform: translate(calc(var(--ax) * 0.75), calc(var(--ay) * -0.25)) rotate(calc(var(--rot) * 0.22)); }
          52%{ transform: translate(calc(var(--ax) * -0.2), calc(var(--ay) * 1.0)) rotate(calc(var(--rot) * 0.65)); }
          82%{ transform: translate(calc(var(--ax) * -0.85), calc(var(--ay) * -0.15)) rotate(calc(var(--rot) * 0.9)); }
          100%{ transform: translate(0,0) rotate(var(--rot)); }
        }
        @keyframes chaos8{
          0%{ transform: translate(0,0) rotate(0deg); }
          24%{ transform: translate(calc(var(--ax) * -0.75), calc(var(--ay) * 0.35)) rotate(calc(var(--rot) * 0.28)); }
          54%{ transform: translate(calc(var(--ax) * 0.9), calc(var(--ay) * -0.15)) rotate(calc(var(--rot) * 0.7)); }
          86%{ transform: translate(calc(var(--ax) * -0.1), calc(var(--ay) * -1.0)) rotate(calc(var(--rot) * 0.92)); }
          100%{ transform: translate(0,0) rotate(var(--rot)); }
        }
      `}</style>
    </div>
  );
}
