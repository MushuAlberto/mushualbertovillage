
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { MissionProvider } from "./contexts/MissionContext";
import { EmotionProvider } from "./contexts/EmotionContext";
import { MushuProvider } from "./contexts/MushuContext";

import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainMenu from "./pages/MainMenu";
import EmotionCheck from "./pages/EmotionCheck";
import ChatBot from "./pages/ChatBot";
import Missions from "./pages/Missions";
import Achievements from "./pages/Achievements";
import Customization from "./pages/Customization";
import MiniGame from "./pages/MiniGame";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Gym from "./pages/Gym";
import Mindfulness from "./pages/Mindfulness";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <UserProvider>
          <EmotionProvider>
            <MushuProvider>
              <MissionProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/menu" element={<MainMenu />} />
                  <Route path="/emotion-check" element={<EmotionCheck />} />
                  <Route path="/chat" element={<ChatBot />} />
                  <Route path="/missions" element={<Missions />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customization" element={<Customization />} />
                  <Route path="/mini-game" element={<MiniGame />} />
                  <Route path="/gym" element={<Gym />} />
                  <Route path="/mindfulness" element={<Mindfulness />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MissionProvider>
            </MushuProvider>
          </EmotionProvider>
        </UserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
