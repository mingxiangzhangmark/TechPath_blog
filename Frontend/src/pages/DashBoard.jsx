import React, { useEffect } from "react";
import SideBar from "../components/SideBar";
import Profile from "../components/Profile";
import MyComment from "../components/MyComment";

import { useLocation, Link } from "react-router-dom";
import AdminPanel from "../components/AdminPanel";
import MyPosts from "../components/MyPosts";

export default function DashBoard() {
  const location = useLocation();
  const pathname = location.pathname;
  const showProfile = pathname === "/profile";
  const showAdmin = pathname === "/admin";
  const showMyPosts = pathname.startsWith("/dashboard/posts");
  const showComments = pathname === "/comments";
  // Always start from top when entering Blog page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 text-slate-800">
      <SideBar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {showAdmin ? (
          <AdminPanel />
        ) : showProfile ? (
          <Profile />
        ) : showMyPosts ? ( 
          <MyPosts />
        ) : showComments ? ( 
          <MyComment />
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
            <div className="grid gap-6">
              <div className="p-6 rounded-xl bg-white shadow-sm border border-slate-200">
                <p className="text-slate-600">
                  Welcome back! Here is a quick overview of your dashboard.
                </p>
              </div>

              {/* Tech-styled square buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Create Post */}
                <Link
                  to="/posts/new"
                  className="cursor-pointer group relative rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 p-[2px] shadow-sm"
                >
                  <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full px-5 py-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-semibold text-lg tracking-wide">
                        Create New Post
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Here you can write and publish a brand new article.
                      </p>
                    </div>
                    <div className="mt-4 text-right">
                      <span className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition">
                        Start writing →
                      </span>
                    </div>
                  </div>
                </Link>

                {/* See My Profile */}
                <Link
                  to="/profile"
                  className="cursor-pointer group relative rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 p-[2px] shadow-sm"
                >
                  <div className="rounded-[10px] bg-white dark:bg-slate-900 h-full px-5 py-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-semibold text-lg tracking-wide">
                        See My Profile
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Here you can view and manage your profile details.
                      </p>
                    </div>
                    <div className="mt-4 text-right">
                      <span className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition">
                        Go to profile →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
