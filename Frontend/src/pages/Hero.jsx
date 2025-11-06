import React, { useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import {
  easeOut,
  motion,
  useAnimation,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import HeroIconsShow from "../components/HeroIconsShow";
import WhyTechBlog from "../components/WhyTechBlog";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import About from "../components/About";

export default function Hero() {
  const navigate = useNavigate();
  const location = useLocation();
  const controls = useAnimation();

  // Get scroll progress of the window
  const { scrollYProgress } = useScroll();
  const circleY = useTransform(scrollYProgress, [0, 1], [0, -300]);

  useEffect(() => {
    const timer = setTimeout(() => {
      controls.start("visible");
    }, 400);

    return () => clearTimeout(timer);
  }, [controls]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Stats card animation with delay
  const createCardVariants = (delay) => ({
    hidden: {
      opacity: 0,
      scale: 0.7,
      y: 40,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 120,
        damping: 20,
      },
    },
  });

  const cardAnimationDuration = 0.7;
  const heroDelay = 1.8;
  const delays = [
    heroDelay,
    heroDelay + cardAnimationDuration,
    heroDelay + cardAnimationDuration * 2,
    heroDelay + cardAnimationDuration * 3,
  ];

  // Smooth scroll by id (used when routing state/hash in)
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    // Navigation from Header: state.scrollTo = 'about'
    if (location.state?.scrollTo === "about") {
      // Wait for a frame to ensure About is rendered
      requestAnimationFrame(() => scrollToId("about"));
      // Clean up the state to avoid double scrolling on return
      navigate(".", { replace: true, state: {} });
    }
    // Support Direct /#about
    if (location.hash === "#about") {
      requestAnimationFrame(() => scrollToId("about"));
    }
  }, [location.state, location.hash, navigate]);

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 to-violet-100 h-full relative overflow-hidden flex flex-col">
        {/* Background decoration */}
        {/* Diagonal element */}
        <motion.div
          transition={{ duration: 0.5, ease: easeOut }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute
        bg-gradient-to-r from-violet-300/40 to-pink-300/20 to-50%
        -skew-12
        origin-bottom-left
        bottom-8
        -left-36
        w-[150vw]
        h-[150vh]
        z-0
        
        md:left-[10%]
        md:bottom-0
        md:origin-bottom-left
        md:w-[200vw]
        md:h-[250vh]
        md:skew-3
        md:rotate-30
        "
        />

        {/* Circle element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.5, ease: easeOut }}
          style={{ y: circleY }}
          className="absolute
        bg-gradient-to-br from-pink-300 to-violet-400 blur-[1px]
        w-[220px]
        h-[220px]
        rounded-full
        origin-top-right
        -bottom-32
        -right-20
        z-0"
        />

        {/* Main content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="relative z-10 max-w-7xl flex-1 mx-auto px-6 flex flex-col min-h-[600px]"
        >
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center w-full flex flex-col">
              {/* Pill + title */}
              <div className="px-4 py-8 [@media(max-height:720px)]:py-2">
                <motion.div
                  variants={textVariants}
                  className="heading-1 text-gray-700 px-1 py-2 rounded-full text-sm font-medium inline-block"
                >
                  <span className="rounded-full text-white bg-gradient-to-r from-violet-500 to-pink-500 py-1 px-3 mx-1">
                    Welcome to TechPath
                  </span>
                  Your Source for IT Insights & Knowledge
                </motion.div>
              </div>

              {/* Heading */}
              <div className="px-4 py-4 flex-1 flex flex-col justify-center">
                {/* Main heading */}
                <motion.h1
                  variants={textVariants}
                  className="font-extrabold text-4xl lg:text-6xl text-slate-800 mb-4"
                >
                  Expand Your Tech Horizons
                </motion.h1>

                {/* Subheading */}
                <motion.p
                  variants={textVariants}
                  className="text-lg mb-8 max-w-[470px] mx-auto leading-relaxed line-clamp-3"
                >
                  Join our IT community and stay ahead with the latest tech
                  insights, tutorials, and industry trends. Sign up today to
                  unlock exclusive content!
                </motion.p>

                {/* CTA Button */}
                <motion.div variants={buttonVariants} className="mx-auto w-fit">
                  <button
                    onClick={() => navigate("/login")}
                    className="btn bg-gradient-to-r from-violet-500 to-pink-500 border-0 text-white hover:from-violet-600 hover:to-pink-600 px-8 py-2 rounded-xl"
                  >
                    Get Started
                  </button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div variants={cardVariants} className="w-full">
            <div className="max-w-6xl mx-auto px-2 sm:px-4 sm:mt-10 md:mt-0 flex flex-col items-center gap-8 sm:gap-10 pt-10 [@media(max-height:720px)]:pt-2 lg:pt-16 pb-8 md:pb-0">
              <div className="relative z-10 flex flex-col md:flex-row justify-center items-center md:items-end gap-5 w-full mx-auto overflow-visible">
                {/* First Card */}
                <motion.div
                  variants={createCardVariants(delays[0])}
                  initial="hidden"
                  animate="visible"
                  // Outer unified packagings
                  className="group relative w-full max-w-xs sm:max-w-sm md:w-[217px]"
                >
                  {/* Gradient Stroke + Glass Effect */}
                  <div className="rounded-2xl p-[1px] bg-gradient-to-br from-violet-400/40 via-fuchsia-400/30 to-pink-400/40 shadow-[0_4px_22px_-4px_rgba(139,92,246,0.25)]">
                    <div
                      className="rounded-2xl h-full w-full bg-white/90 backdrop-blur-md
                                  transition-colors duration-300 group-hover:bg-white
                                  flex items-center justify-center"
                    >
                      <div
                        className="flex flex-col w-full h-full min-h-[152px] p-5 justify-center items-start rounded-xl
                                    bg-[radial-gradient(circle_at_30%_25%,rgba(139,92,246,0.12),transparent_60%)]"
                      >
                        <span className="flex flex-row items-baseline text-[16px] font-semibold text-slate-700">
                          Articles
                          <motion.span
                            className="ml-1 text-[34px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-600"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              transition: {
                                delay: delays[0] + cardAnimationDuration * 0.7,
                                duration: 0.4,
                                ease: "easeOut",
                              },
                            }}
                          >
                            <CountUp
                              start={0}
                              end={100}
                              duration={1.2}
                              delay={delays[0] + cardAnimationDuration * 0.8}
                              suffix="+"
                              useEasing
                              enableScrollSpy={false}
                            />
                          </motion.span>
                        </span>
                        <span className="mt-2 text-[14px] leading-5 text-slate-600">
                          Comprehensive technical articles for all skill levels
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Second Card */}
                <motion.div
                  variants={createCardVariants(delays[1])}
                  initial="hidden"
                  animate="visible"
                  className="group relative w-full max-w-xs sm:max-w-sm md:w-[217px]"
                >
                  <div className="rounded-2xl p-[1px] bg-gradient-to-br from-pink-400/40 via-rose-400/30 to-fuchsia-400/40 shadow-[0_4px_22px_-4px_rgba(236,72,153,0.25)]">
                    <div className="rounded-2xl h-full w-full bg-white/90 backdrop-blur-md transition-colors group-hover:bg-white flex items-center justify-center">
                      <div className="flex flex-col w-full h-full min-h-[178px] p-5 justify-center rounded-xl bg-[radial-gradient(circle_at_30%_25%,rgba(236,72,153,0.12),transparent_60%)]">
                        <motion.span
                          className="text-[34px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600 mb-2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                              delay: delays[1] + cardAnimationDuration * 0.7,
                              duration: 0.4,
                              ease: "easeOut",
                            },
                          }}
                        >
                          <CountUp
                            start={0}
                            end={5000}
                            duration={1.2}
                            delay={delays[1] + cardAnimationDuration * 0.8}
                            suffix="+"
                            useEasing
                            enableScrollSpy={false}
                          />
                        </motion.span>
                        <span className="text-[14px] leading-5 text-slate-600">
                          Active community members sharing knowledge
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Third Card */}
                <motion.div
                  variants={createCardVariants(delays[2])}
                  initial="hidden"
                  animate="visible"
                  className="group relative w-full max-w-xs sm:max-w-sm md:w-[217px]"
                >
                  <div className="rounded-2xl p-[1px] bg-gradient-to-br from-indigo-400/40 via-violet-400/30 to-pink-400/40 shadow-[0_4px_22px_-4px_rgba(99,102,241,0.25)]">
                    <div className="rounded-2xl h-full w-full bg-white/90 backdrop-blur-md transition-colors group-hover:bg-white flex items-center justify-center">
                      <div className="flex flex-col w-full h-full min-h-[205px] p-5 justify-center rounded-xl bg-[radial-gradient(circle_at_30%_25%,rgba(99,102,241,0.12),transparent_60%)]">
                        <motion.span
                          className="text-[34px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 mb-3"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                              delay: delays[2] + cardAnimationDuration * 0.7,
                              duration: 0.4,
                              ease: "easeOut",
                            },
                          }}
                        >
                          <CountUp
                            start={0}
                            end={24}
                            duration={1.2}
                            delay={delays[2] + cardAnimationDuration * 0.8}
                            suffix="/7"
                            useEasing
                            enableScrollSpy={false}
                          />
                        </motion.span>
                        <span className="text-[14px] leading-5 text-slate-600">
                          Support and resources available around the clock
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Fourth Card */}
                <motion.div
                  variants={createCardVariants(delays[3])}
                  initial="hidden"
                  animate="visible"
                  className="group relative w-full max-w-xs sm:max-w-sm md:w-[217px]"
                >
                  <div className="rounded-2xl p-[1px] bg-gradient-to-br from-fuchsia-400/40 via-violet-400/30 to-indigo-400/40 shadow-[0_4px_22px_-4px_rgba(168,85,247,0.25)]">
                    <div className="rounded-2xl h-full w-full bg-white/90 backdrop-blur-md transition-colors group-hover:bg-white flex items-center justify-center">
                      <div className="flex flex-col w-full h-full min-h-[152px] p-5 justify-center rounded-xl bg-[radial-gradient(circle_at_30%_25%,rgba(168,85,247,0.14),transparent_65%)]">
                        <motion.span
                          className="text-[34px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-indigo-600 mb-2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                              delay: delays[3] + cardAnimationDuration * 0.7,
                              duration: 0.4,
                              ease: "easeOut",
                            },
                          }}
                        >
                          <CountUp
                            start={0}
                            end={98}
                            duration={1.2}
                            delay={delays[3] + cardAnimationDuration * 0.8}
                            suffix="%"
                            useEasing
                            enableScrollSpy={false}
                          />
                        </motion.span>
                        <span className="text-[14px] leading-5 text-slate-600">
                          Satisfaction rate from our community members
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      {/* New technologies marquee section */}
      <HeroIconsShow />
      <WhyTechBlog />
      <About />
      <Testimonials />
      <FAQ />
    </>
  );
}
