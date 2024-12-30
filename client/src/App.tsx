import { Switch, Route } from "wouter";
import { Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import BreathPage from "./pages/BreathPage";
import ProfilePage from "./pages/ProfilePage";
import TrancePage from "./pages/TrancePage";
import { useUser } from "./hooks/use-user";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/breathwork" component={BreathPage} />
      <Route path="/trance" component={TrancePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route>
        {/* 404 page */}
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary">404</h1>
            <p className="mt-2 text-muted-foreground">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default App;