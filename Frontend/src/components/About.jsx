import React from "react";
import GlassGadget from "./three/GlassGadget";

export default function About() {
  return (
    <section id="about" className="bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-14">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            About
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            TechPath is an independent IT knowledge hub. We share practical
            tutorials, engineering best practices, and hands‑on guides across
            software, cloud, data, and AI. Join the community, publish your
            insights, and level up together.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
          <div className="md:pl-8 lg:pl-14 md:mt-20">
            <h2 className="text-2xl font-semibold text-slate-900 mt-2">
              What we focus on
            </h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li>
                • Deep-dive articles with runnable code and clear diagrams
              </li>
              <li>
                • Frontend, Backend, Cloud, DevOps, AI/ML, and Data Engineering
              </li>
              <li>• Community-driven discussions and constructive feedback</li>
              <li>
                • Open collaboration: contribute via GitHub and help improve the
                site
              </li>
            </ul>

            <div className="mt-6">
              <a
                href="https://github.sydney.edu.au/2025S2-INTERNET-SOFTWARE-PLATFORM/Thu-13-16-7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl px-5 py-3 text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
              >
                Contribute on GitHub
              </a>
            </div>
          </div>

          {/* Keep 3D size fixed; reduce its top margin to pull section height down */}
          <div className="h-[520px] sm:h-[550px] shrink-0 rounded-2xl overflow-visible mt-2 md:mt-0">
            <GlassGadget />
          </div>
        </div>
      </div>
    </section>
  );
}
