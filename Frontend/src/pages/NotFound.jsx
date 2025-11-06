import React from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[89vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-violet-100 to-pink-50">
      {/* background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-violet-300/30 to-pink-300/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-pink-300/30 to-indigo-300/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl px-8 text-center"
      >
        <div className="inline-flex mb-8 rounded-3xl p-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 shadow-[0_4px_26px_-8px_rgba(139,92,246,0.35)]">
          <div className="w-full h-full rounded-3xl bg-white/80 backdrop-blur-md px-10 py-12">
            {/* Small Logo 404 + Friendly Title */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3"
            >
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-medium px-3 py-1 tracking-wide shadow-sm">
                404
              </span>
              <span className="text-sm font-medium text-slate-500">
                Page not found
              </span>
            </motion.div>

            <motion.h1
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.45 }}
              className="mt-6 font-extrabold text-4xl md:text-5xl tracking-tight text-slate-800"
            >
              Oops, we couldn’t find that page
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto"
            >
              The link may be incorrect or the page may have moved. Try one of
              the options below.
            </motion.p>

            {/* buttom */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => navigate(-1)}
                className="h-11 px-6 rounded-xl text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-violet-400/50 transition"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate("/")}
                className="h-11 px-7 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="h-11 px-6 rounded-xl text-sm font-medium text-violet-600 bg-white/70 border border-violet-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition"
              >
                Dashboard
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
