import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          }
        />
        <Route
          path="/auth"
          element={
            <PageTransition>
              <Auth />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          }
        />
        <Route
          path="/admin/*"
          element={
            <PageTransition>
              <Admin />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
