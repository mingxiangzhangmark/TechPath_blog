import React from "react";
import { Link } from "react-router-dom";

export default function MyFooter() {
  return (
    <footer
      className="relative border-t border-slate-200/70 bg-white/90 backdrop-blur-xl dark:bg-slate-900 dark:border-slate-800/70"
      aria-labelledby="site-footer-title"
    >
      {/* Gradient top border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-12 pb-2">
        <div className="flex flex-col md:flex-row items-start gap-10">
          {/* Brand section */}
          <div className="md:w-2/5">
            <h2
              id="site-footer-title"
              className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 mb-3"
            >
              TechPath Blog
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Insights, tutorials and industry trends to help you expand your
              tech horizons.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              <a
                aria-label="GitHub"
                className="group inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-slate-200/70 dark:ring-slate-700/70 bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 hover:from-indigo-100 hover:to-pink-100 dark:hover:from-slate-700 dark:hover:to-slate-700 transition hover:ring-violet-400/40"
                href="https://github.sydney.edu.au/2025S2-INTERNET-SOFTWARE-PLATFORM/Thu-13-16-7"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition"
                  fill="currentColor"
                >
                  <path d="M12 .49a12 12 0 00-3.792 23.392c.6.112.816-.256.816-.576 0-.288-.016-1.248-.016-2.272-3.008.56-3.792-.736-4.032-1.408-.136-.352-.72-1.408-1.232-1.696-.416-.224-1.008-.768-.016-.784.936-.016 1.6.864 1.824 1.216 1.072 1.808 2.784 1.296 3.456.976.112-.784.416-1.296.76-1.6-2.664-.304-5.464-1.344-5.464-5.968 0-1.312.464-2.384 1.216-3.232-.12-.304-.536-1.536.112-3.2 0 0 1.008-.32 3.296 1.232a11.33 11.33 0 013.008-.4c1.024 0 2.048.136 3.008.4 2.288-1.568 3.296-1.232 3.296-1.232.648 1.664.232 2.896.112 3.2.752.848 1.216 1.904 1.216 3.232 0 4.64-2.816 5.664-5.488 5.968.432.368.816 1.072.816 2.176 0 1.6-.016 2.88-.016 3.264 0 .32.216.704.832.576A12 12 0 0012 .49z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation links - Simplified and balanced */}
          <nav className="flex-1 grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-3">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Navigation</p>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/#about" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Resources</p>
              <ul className="space-y-3">
                <li>
                  <Link to="/posts/search" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Search Posts
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        
        {/* Gradient divider */}
        <div className="mt-4 h-[2px] bg-gradient-to-r  via-slate-200 dark:via-slate-900 to-transparent" />
        
        {/* Copyright */}
        <div className="mt-2 flex justify-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} TechPath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
