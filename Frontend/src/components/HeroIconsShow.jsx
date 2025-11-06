import React, { useRef, useEffect, useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // NEW: for staged entrance

export default function HeroIconsShow({ palette = "violetAurora" }) {
  const palettes = {
    violetAurora: {
      gradient: "from-violet-400/14 via-fuchsia-400/10 to-pink-400/14",
      surface: "bg-white/60 dark:bg-white/5",
      accent: "#6D28D9",
      accentTo: "#DB2777",
      ring: "shadow-[0_0_0_1px_#6D28D930,0_4px_18px_-4px_#DB277760,0_0_34px_-6px_#6D28D950]",
    },
    mintBlue: {
      gradient: "from-[#63FFAC]/14 via-[#65A7FF]/10 to-[#56DAFF]/16",
      surface: "bg-white/55 dark:bg-white/5",
      accent: "#458EEB",
      accentTo: "#56DAFF",
      ring: "shadow-[0_0_0_1px_#458EEB30,0_4px_18px_-4px_#63FFAC50,0_0_32px_-4px_#56DAFF50]",
    },
    warmMint: {
      gradient: "from-[#FFD8D8]/18 via-[#63FFAC]/12 to-[#FEEOCB]/22",
      surface: "bg-white/60 dark:bg-white/5",
      accent: "#38B982",
      accentTo: "#F9D9A8",
      ring: "shadow-[0_0_0_1px_#38B98230,0_4px_18px_-4px_#FFD8D850,0_0_30px_-4px_#38B98245]",
    },
    violetSky: {
      gradient: "from-[#7D8EFF]/18 via-[#56DAFF]/10 to-[#FEEOCB]/20",
      surface: "bg-white/60 dark:bg-white/5",
      accent: "#5F6EEB",
      accentTo: "#56DAFF",
      ring: "shadow-[0_0_0_1px_#5F6EEB30,0_4px_18px_-4px_#56DAFF50,0_0_32px_-6px_#5F6EEB55]",
    },
  };
  const theme = palettes[palette] || palettes.violetAurora;

  const logos = useMemo(
    () => [
      {
        name: "Python",
        src: "/tech/python.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      },
      {
        name: "Java",
        src: "/tech/java.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
      },
      {
        name: "JavaScript",
        src: "/tech/javascript.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      },
      {
        name: "TypeScript",
        src: "/tech/typescript.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      },
      {
        name: "React",
        src: "/tech/react.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      },
      {
        name: "Next.js",
        src: "/tech/nextjs.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
      },
      {
        name: "Node.js",
        src: "/tech/nodejs.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      },
      {
        name: "Spring",
        src: "/tech/spring.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
      },
      {
        name: "Django",
        src: "/tech/django.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg",
      },
      {
        name: "Docker",
        src: "/tech/docker.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
      },
      {
        name: "Kubernetes",
        src: "/tech/kubernetes.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
      },
      {
        name: "PostgreSQL",
        src: "/tech/postgresql.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      },
      {
        name: "Git",
        src: "/tech/git.svg",
        cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
      },
    ],
    [],
  );

  const marqueeRef = useRef(null);
  const sectionRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(28);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState("intro"); // 'intro' -> staged entrance, then 'marquee'

  useEffect(() => {
    const calc = () => {
      if (!marqueeRef.current) return;
      const first = marqueeRef.current.querySelector(".logo-strip");
      if (!first) return;
      const w = first.scrollWidth;
      setDistance(w);
      const base = window.innerWidth < 640 ? 34 : 26;
      setDuration(Math.min(68, Math.max(base, w / 165)));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(document.documentElement);
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("resize", calc);
      ro.disconnect();
    };
  }, [phase]);

  // After visibility, run staged entrance then switch to marquee
  useEffect(() => {
    if (!visible) return;
    if (phase !== "intro") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("marquee");
      return;
    }
    // Intro timings (enlarged animation -> longer single card duration)
    const appearDuration = 0.85; // was 0.65 (allow full 1.5x -> settle)
    const stagger = 0.1; // slightly larger gap for clarity (was 0.09)
    const extraHold = 700; // a bit more pause before scroll (was 600)
    const total = appearDuration + stagger * (logos.length - 1) + extraHold;
    const t = setTimeout(() => setPhase("marquee"), total);
    return () => clearTimeout(t);
  }, [visible, phase, logos.length]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  const handleHover = (on) => {
    if (!marqueeRef.current) return;
    marqueeRef.current.style.animationPlayState = on ? "paused" : "running";
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Technology stack"
      className="relative w-full py-14 sm:py-20 overflow-hidden"
    >
      {/* Pure white (light) / solid dark background */}
      <div className="absolute inset-0 bg-white dark:bg-slate-900" />
      {/* Subtle vertical depth gradient (very light) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-800/60 dark:via-slate-900/40 dark:to-slate-900" />
      {/* Optional soft radial hints (extremely faint) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.4] [background:radial-gradient(circle_at_25%_30%,rgba(124,58,237,0.06),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.05),transparent_65%)] dark:opacity-[0.25]" />
      {/* Light sweep (kept very subtle) */}
      <div className="pointer-events-none absolute -inset-x-32 -top-32 h-56 bg-gradient-to-r from-transparent via-slate-200/60 to-transparent dark:via-white/10 blur-2xl animate-sweep" />

      <div className="relative max-w-6xl mx-auto px-6 flex flex-col items-center gap-8">
        <header
          className={`flex flex-col items-center text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
            Technology Stack
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl dark:text-slate-300">
            Key languages, frameworks and platforms knowledge our blog shares.
          </p>
        </header>

        <div
          className={`relative w-full overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10 ${theme.surface} shadow-[0_4px_20px_-6px_rgba(30,41,59,0.12)] backdrop-blur-xl transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
          }}
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
        >
          <div
            ref={marqueeRef}
            className={`flex items-stretch select-none transition-opacity ${phase === "marquee" ? "opacity-100" : "opacity-100"}`}
            style={
              phase === "marquee"
                ? {
                    "--marquee-distance": `${distance}px`,
                    animation: distance
                      ? `marquee ${duration}s linear infinite`
                      : "none",
                  }
                : undefined
            }
          >
            {/* When in intro phase: single row, animated cards.
                When marquee: duplicate rows for seamless scroll */}
            {phase === "intro" && (
              <motion.div
                className="logo-strip flex gap-8 px-10 py-8 flex-shrink-0"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.07,
                      delayChildren: 0.05,
                    },
                  },
                }}
              >
                {logos.map((l) => (
                  <MotionLogoCard
                    key={`intro-${l.name}`}
                    {...l}
                    accent={theme.accent}
                    accentTo={theme.accentTo}
                    ring={theme.ring}
                  />
                ))}
              </motion.div>
            )}

            {phase === "marquee" && (
              <>
                <div className="logo-strip flex gap-8 px-10 py-8 flex-shrink-0">
                  {logos.map((l) => (
                    <LogoCard
                      key={`row-${l.name}`}
                      {...l}
                      accent={theme.accent}
                      accentTo={theme.accentTo}
                      ring={theme.ring}
                    />
                  ))}
                </div>
                <div className="logo-strip flex gap-8 px-10 py-8 flex-shrink-0">
                  {logos.map((l) => (
                    <LogoCard
                      key={`rowb-${l.name}`}
                      {...l}
                      accent={theme.accent}
                      accentTo={theme.accentTo}
                      ring={theme.ring}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Edge fades (white) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80" />
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-1 * var(--marquee-distance))); }
        }
        @keyframes sweep {
          0% { transform: translateX(-45%) translateY(0); opacity: 0; }
          35% { opacity: .22; }
          65% { opacity: .22; }
          100% { transform: translateX(45%) translateY(0); opacity: 0; }
        }
        .animate-sweep { animation: sweep 14s linear infinite; }
        [style*="marquee"] { will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .animate-sweep { animation-duration: 28s; }
          [style*="marquee"] { animation-duration: ${duration * 2}s !important; }
        }
      `}</style>
    </section>
  );
}

// Motion variant logo card (intro only)
function MotionLogoCard(props) {
  return (
    <motion.div
      style={{
        transformOrigin: "center center",
        willChange: "transform, opacity",
      }}
      variants={{
        hidden: { opacity: 0, y: 28, scale: 1.5 }, // start much larger (1.5x)
        visible: {
          opacity: 1,
          y: 0,
          // Dramatic shrink-in, slight overshoot, then settle
          scale: [1.5, 0.9, 1.02, 1],
          transition: {
            duration: 0.85,
            ease: "easeOut",
            times: [0, 0.55, 0.82, 1],
          },
        },
      }}
    >
      <LogoCard {...props} />
    </motion.div>
  );
}

function LogoCard({ name, src, cdn, accent, accentTo, ring }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <div
      aria-label={name}
      className="relative h-16 w-28 sm:h-20 sm:w-32 flex items-center justify-center"
    >
      <div className="absolute inset-0 rounded-xl bg-white/85 dark:bg-white/5 border border-slate-200/70 dark:border-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]" />
      <button
        type="button"
        className="relative rounded-xl h-full w-full flex flex-col gap-1 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:ring-[color:var(--accent)] dark:focus-visible:ring-offset-slate-900"
        style={{ "--accent": accent }}
      >
        <div className="absolute -inset-px rounded-xl opacity-0 bg-gradient-to-br from-white/70 via-transparent to-white/40 transition-opacity duration-300 hover:opacity-100 pointer-events-none" />
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          onError={() => {
            if (imgSrc !== cdn) setImgSrc(cdn);
            else setImgSrc("/tech/fallback.svg");
          }}
          className="h-9 sm:h-10 w-auto object-contain transition-transform duration-400 hover:scale-110"
        />
        <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-300">
          {name}
        </span>
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-400 hover:opacity-100"
          style={{ boxShadow: ring }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 hover:opacity-55 mix-blend-plus-lighter transition duration-400"
          style={{
            background: `radial-gradient(circle at 50% 115%, ${accent}33 0%, transparent 70%)`,
          }}
        />
        <span
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-0 hover:opacity-100 transition-opacity duration-400"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent} 35%, ${accentTo} 65%, transparent)`,
          }}
        />
      </button>
    </div>
  );
}
