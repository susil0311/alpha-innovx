import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import ControlRoom from "./pages/ControlRoom";
import Replay from "./pages/Replay";
import FieldReports from "./pages/FieldReports";
import CommandPack from "./pages/CommandPack";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/control-room" component={ControlRoom} />
            <Route path="/replay" component={Replay} />
            <Route path="/field-reports" component={FieldReports} />
            <Route path="/command-pack" component={CommandPack} />
            <Route path="/profile" component={UserProfile} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
