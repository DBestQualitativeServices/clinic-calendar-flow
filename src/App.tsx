import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import FormsPage from "./pages/FormsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import { AppProvider } from "./store/appStore";
import TabletLayout from "./pages/tablet/TabletLayout";
import TabletLogin from "./pages/tablet/TabletLogin";
import TabletFormsList from "./pages/tablet/TabletFormsList";
import TabletFormView from "./pages/tablet/TabletFormView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Reception (desktop) — with sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/scheduling" element={<Index />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/patients" element={<PlaceholderPage />} />
            <Route path="/consultations" element={<PlaceholderPage />} />
            <Route path="/settings" element={<PlaceholderPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/scheduling" replace />} />

          {/* Tablet — separate layout, no sidebar */}
          <Route element={<AppProvider><TabletLayout /></AppProvider>}>
            <Route path="/tablet" element={<TabletLogin />} />
            <Route path="/tablet/forms" element={<TabletFormsList />} />
            <Route path="/tablet/form/:templateId" element={<TabletFormView />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
