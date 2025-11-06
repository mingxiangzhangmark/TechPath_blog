import React, { useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView } from "framer-motion";
import ladyRelaxing from "/lady-relaxing.png";
import ladyComputer from "/lady-computer.png";

/* Stagger + card variants */
const container = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.14,
    },
  },
};
const card = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
  },
};

const Testimonials = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });

  const testimonials = [
    {
      quote:
        "The performance deep-dives saved us days of trial and error. We applied the indexing + caching tips and cut API latency by 42%.",
      name: "Lena",
      role: "Backend Engineer",
    },
    {
      quote:
        "Clear, senior-level explanations of architectural trade‑offs. The event-driven primer helped us redesign a brittle queue system.",
      name: "Jun",
      role: "Platform Lead",
    },
    {
      quote:
        "I used two refactoring patterns from an article and finally passed a tough code review. The diagrams make complex ideas stick.",
      name: "Marcos",
      role: "Full‑stack Dev",
    },
    {
      quote:
        "The concise security checklist caught 3 auth oversights in our Next.js app. Exactly the pragmatic guidance I need.",
      name: "Priya",
      role: "Security-minded FE Engineer",
    },
  ];

  return (
    <section
      id="testimonials"
      ref={ref}
      aria-labelledby="testimonials-heading"
      className="relative w-full py-28 overflow-hidden"
    >
      {/* Ambient gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-900 dark:via-slate-900/70 dark:to-slate-900" />
      {/* Subtle noise / texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay [background:repeating-linear-gradient(45deg,rgba(120,90,255,0.35)_0_2px,transparent_2px_8px)]" />
      {/* Soft radial glows */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_18%_32%,rgba(124,58,237,0.16),transparent_60%),radial-gradient(circle_at_82%_68%,rgba(236,72,153,0.18),transparent_60%)]" />

      {/* Decorative floating illustrations */}
      <motion.img
        src={ladyRelaxing}
        alt="Developer relaxing after solving performance issues"
        initial={{ opacity: 0, y: 40, rotate: -4, scale: 0.9 }}
        animate={inView ? { opacity: 0.6, y: 0, scale: 1 } : {}}
        transition={{ duration: 1, ease: "easeOut" }}
        className="hidden xl:block absolute bottom-4 -left-10 w-[300px] pointer-events-none select-none"
        style={{ filter: "drop-shadow(0 18px 28px rgba(90,60,180,0.25))" }}
      />
      <motion.img
        src={ladyComputer}
        alt="Engineer working on a laptop"
        initial={{ opacity: 0, y: 60, rotate: 6, scale: 0.9 }}
        animate={inView ? { opacity: 0.55, y: 0, scale: 1 } : {}}
        transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
        className="hidden xl:block absolute top-6 -right-8 w-[340px] pointer-events-none select-none"
        style={{ filter: "drop-shadow(0 22px 34px rgba(120,60,200,0.22))" }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600"
          >
            What Engineers Are Saying
          </h2>
          <p className="mt-6 text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Practical wins, sharper reviews and faster launches—direct from
            readers applying the patterns & strategies we publish.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 grid gap-10 sm:grid-cols-2 max-w-5xl mx-auto"
        >
          {testimonials.map((t) => (
            <motion.article
              key={t.name}
              variants={card}
              className="group relative h-full flex flex-col rounded-2xl p-8 bg-white/80 dark:bg-white/[0.06] border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-[0_10px_34px_-14px_rgba(99,102,241,0.28)]"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none" />
              <div className="text-4xl leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500">
                &ldquo;
              </div>
              <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 flex-1">
                {t.quote}
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.role}
                  </p>
                </div>
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse" />
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Subtle moving highlight band */}
        <div className="pointer-events-none absolute left-0 right-0 -bottom-10 h-40 blur-2xl opacity-50 bg-gradient-to-r from-transparent via-violet-400/20 to-transparent animate-[pulseBand_18s_linear_infinite]" />
      </div>

      <style>{`
        @keyframes pulseBand {
          0% { transform: translateX(-45%); opacity: .35; }
          50% { transform: translateX(45%); opacity: .55; }
          100% { transform: translateX(-45%); opacity: .35; }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
