import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastContainer } from "@/components/ToastNotification";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";
import Graph from "./pages/Graph";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Patterns from "./pages/Patterns";
import Benchmarks from "./pages/Benchmarks";
import Heatmap from "./pages/Heatmap";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          // Optionally unobserve after showing
          // observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Function to observe elements
    const observeElements = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((el) => observer.observe(el));
    };

    // Initial observation
    observeElements();

    // Re-observe on DOM changes (for SPA navigation)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ToastContainer />
          <BrowserRouter>
            <Routes>
              <Route path="/cryptoflow/" element={<Index />} />
              <Route path="/cryptoflow/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/cryptoflow/upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />
              <Route path="/cryptoflow/analysis" element={
                <ProtectedRoute>
                  <Analysis />
                </ProtectedRoute>
              } />
              <Route path="/cryptoflow/graph" element={
                <ProtectedRoute>
                  <Graph />
                </ProtectedRoute>
              } />
              <Route path="/cryptoflow/heatmap" element={
                <ProtectedRoute>
                  <Heatmap />
                </ProtectedRoute>
              } />
              <Route path="/cryptoflow/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/cryptoflow/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/cryptoflow/patterns" element={
                <ProtectedRoute>
                  <Patterns />
                </ProtectedRoute>
              } />
              <Route path="/cryptoflow/benchmarks" element={
                <ProtectedRoute>
                  <Benchmarks />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
