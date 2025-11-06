import React, { useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation, useInView } from "framer-motion";

/* Modern fade / slide */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.15, duration: 0.7, ease: "easeOut" },
  }),
};

/* Circular reveal for arrows / accent blocks */
const reveal = {
  hidden: { opacity: 0, scale: 0.4, clipPath: "circle(0% at 50% 50%)" },
  visible: {
    opacity: 1,
    scale: 1,
    clipPath: "circle(140% at 50% 50%)",
    transition: { duration: 1, ease: "easeInOut" },
  },
};

export default function WhyTechBlog() {
  const topControls = useAnimation();
  const bottomControls = useAnimation();

  const containerRef = useRef(null);
  const inView = useInView(containerRef, {
    once: true,
    margin: "-35% 0px -35% 0px",
  });

  useEffect(() => {
    const run = async () => {
      if (inView) {
        await topControls.start("visible");
        await bottomControls.start("visible");
      }
    };
    run();
  }, [inView, topControls, bottomControls]);

  return (
    <section
      ref={containerRef}
      className="relative max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col gap-24 rounded-3xl bg-white/90 backdrop-blur-xl shadow-lg mb-5"
      aria-labelledby="why-tech-blog-heading"
    >
      {/* Soft ambient gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 rounded-2xl" />

      {/* TOP BLOCK */}
      <motion.div
        className="flex flex-col items-center gap-12 lg:flex-row lg:items-start ml-10"
        initial="hidden"
        animate={topControls}
        variants={{}}
      >
        {/* Left Text */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="w-full max-w-md text-center lg:text-left"
        >
          <h2
            id="why-tech-blog-heading"
            className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-slate-800"
          >
            Why TechPath Blog?
          </h2>
          <p className="mt-5 text-slate-600 leading-relaxed">
            Staying current is hard. We filter noise, surface signal and give
            you practical, senior–level guidance you can apply immediately in
            code, architecture and career growth.
          </p>
        </motion.div>

        {/* Arrow / connector */}
        <motion.div
          variants={reveal}
          custom={0.6}
          className="hidden lg:flex w-40 h-40 items-center justify-center relative"
          aria-hidden="true"
        >
          <CurveArrow />
        </motion.div>

        {/* Highlight Bubble */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className="relative w-full max-w-sm rounded-3xl bg-white/70 backdrop-blur-xl border border-violet-200/60 shadow-[0_8px_28px_-12px_rgba(109,40,217,0.18)] px-8 py-10 text-left"
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none bg-[radial-gradient(circle_at_30%_25%,rgba(139,92,246,0.15),transparent_65%)]" />
          <p className="text-slate-700 leading-7">
            We synthesize deep dives on language internals, performance tuning,
            security practices, DevOps workflows and scalable frontend
            patterns—then pair them with concise how‑to snippets and recommended
            toolchains.
          </p>
        </motion.div>
      </motion.div>

      {/* BOTTOM BLOCK */}
      <motion.div
        className="flex flex-col-reverse items-center gap-12 lg:flex-row lg:items-end lg:justify-between"
        initial="hidden"
        animate={bottomControls}
      >
        {/* Feature Cluster */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl"
        >
          <Feature
            i={0}
            title="Actionable Tutorials"
            body="Concise, copy‑ready walkthroughs for real production scenarios: authentication, caching, CI/CD, containerization."
          />
          <Feature
            i={1}
            title="Architecture Patterns"
            body="Event-driven, domain-driven, micro frontends, edge rendering & messaging—explained with diagrams."
          />
          <Feature
            i={2}
            title="Performance & Reliability"
            body="Profiling, observability, scaling, queues and resilient deployments you can drop into your stack."
          />
          <Feature
            i={3}
            title="Career & Growth"
            body="Code review mindset, system design prep, leadership transition and communication strategies."
          />
        </motion.div>

        {/* Narrow Arrow */}
        <motion.div
          variants={reveal}
          custom={0.5}
          className="hidden lg:flex w-24 h-48 items-center justify-center"
          aria-hidden="true"
        >
          <StraightArrow />
        </motion.div>

        {/* Right Title / Prompt */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="w-full max-w-md text-center lg:text-left"
        >
          <h3 className="font-extrabold text-3xl sm:text-4xl md:text-5xl text-slate-800">
            What You Can Do Here
          </h3>
          <div className="mt-6 text-slate-600 leading-relaxed space-y-3">
            <p>
              Ask questions, explore focused roadmaps and iterate faster with
              curated resources.
            </p>
            <div className="italic text-violet-700/80">
              <p>e.g. "Optimize React hydration for large tables"</p>
              <p>e.g. "PostgreSQL indexing strategy for high write load"</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* Small feature card */
function Feature({ title, body, i }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={0.15 + i * 0.12}
      className="group relative rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-xl px-5 py-5 shadow-[0_4px_18px_-8px_rgba(30,41,59,0.15)] overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10" />
      <h4 className="relative z-10 font-semibold text-slate-800 mb-2 tracking-tight">
        {title}
      </h4>
      <p className="relative z-10 text-sm leading-relaxed text-slate-600">
        {body}
      </p>
      <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse" />
    </motion.div>
  );
}

/* Inline SVG arrows (no external assets required) */
function CurveArrow() {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      className="text-violet-500/70"
    >
      <path
        d="M15 120C46 40 94 34 125 20"
        stroke="url(#grad1)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="6 14"
      />
      <path
        d="M104 18l26 4-14 22"
        stroke="url(#grad1)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient
          id="grad1"
          x1="15"
          y1="120"
          x2="130"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StraightArrow() {
  return (
    <svg
      width="70"
      height="180"
      viewBox="0 0 70 180"
      fill="none"
      className="text-violet-500/70"
    >
      <path
        d="M35 170V20"
        stroke="url(#grad2)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="6 14"
      />
      <path
        d="M18 40l17-24 17 24"
        stroke="url(#grad2)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient
          id="grad2"
          x1="35"
          y1="170"
          x2="35"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
