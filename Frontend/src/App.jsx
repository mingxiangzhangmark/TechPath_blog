// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import Hero from "./pages/Hero";
import Header from "./components/Header";
import MyFooter from "./components/MyFooter";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import DashBoard from "./pages/DashBoard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";
import AdminRoute from "./routes/AdminRoute";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import EditPost from "./pages/EditPost";
import Posts from "./pages/Posts";
import SearchPosts from "./pages/SearchPosts";
import Terms from "./pages/Terms";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ForgetPassword from "./pages/ForgetPassword";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={2000} />
        <Header />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/search" element={<SearchPosts />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />
          {/* My Articles List (Protected) */}
          <Route
            path="/dashboard/posts"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />
          {/* Edit my post (protected) */}
          <Route
            path="/dashboard/posts/:slug/edit"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />
          {/* Public details page */}
          <Route path="/posts/:slug" element={<PostDetail />} />
          {/* Creation (protected) */}
          <Route
            path="/posts/new"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashBoard /> {/* Reuse the layout and display the Profile at the discretion of the DashBoard. */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashBoard />{" "}
                {/* Reuse the layout and display AdminPanel by judgement within the DashBoard. */}
              </AdminRoute>
            }
          />
          <Route
            path="/comments"
            element={
              <ProtectedRoute>
                <DashBoard />{" "}
                {/* Reuse the layout to display MyComment as judged by the DashBoard. */}
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <MyFooter />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
