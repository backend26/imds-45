import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import { ThemeManager } from "@/components/ThemeManager";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import { EventsManagement } from "./pages/admin/EventsManagement";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailConfirmation from "./pages/EmailConfirmation";
import Account from "./pages/Account";
import PublicProfile from "./pages/PublicProfile";
import CookiePolicy from "./pages/CookiePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

import CalcioPage from "./pages/sports/Calcio";
import TennisPage from "./pages/sports/Tennis";
import F1Page from "./pages/sports/F1";
import NFLPage from "./pages/sports/NFL";
import BasketPage from "./pages/sports/Basket";
import NotFound from "./pages/NotFound";
import NewPostPage from "./pages/editor/new";
import EditPostPage from "./pages/editor/[postId]/edit";
import AdminGuide from "./pages/AdminGuide";
import ChiSiamo from "./pages/ChiSiamo";
import Contatti from "./pages/Contatti";
import ResetPassword from "./pages/ResetPassword";
import Post from "./pages/Post";
import Search from "./pages/Search";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeManager />
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrati" element={<Register />} />
            <Route path="/register" element={<Register />} /> {/* Compatibility fallback */}
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/account" element={<Account />} />
            <Route path="/@:username" element={<PublicProfile />} />
            <Route path="/editor/new" element={<NewPostPage />} />
            <Route path="/editor/:postId/edit" element={<EditPostPage />} />
            <Route path="/post/:postId" element={<Post />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['administrator']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/guide" element={<ProtectedRoute allowedRoles={['administrator']}><AdminGuide /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['administrator', 'editor']}><EventsManagement /></ProtectedRoute>} />
            <Route path="/chi-siamo" element={<ChiSiamo />} />
            <Route path="/contatti" element={<Contatti />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            
            {/* Sport Pages */}
            <Route path="/calcio" element={<CalcioPage />} />
            <Route path="/tennis" element={<TennisPage />} />
            <Route path="/f1" element={<F1Page />} />
            <Route path="/nfl" element={<NFLPage />} />
            <Route path="/basket" element={<BasketPage />} />
            <Route path="/search" element={<Search />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsentBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
