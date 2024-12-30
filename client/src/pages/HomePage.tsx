import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wind, Brain, User } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function HomePage() {
  const { user, logout } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const navigationCards = [
    {
      title: "Breathwork Sessions",
      description: "Start a guided breathing exercise session",
      icon: Wind,
      href: "/breathwork",
    },
    {
      title: "Guided Trance",
      description: "Begin a meditation journey",
      icon: Brain,
      href: "/trance",
    },
    {
      title: "User Profile",
      description: "View your progress and achievements",
      icon: User,
      href: "/profile",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Patterns Breathwork</h1>
          <button 
            onClick={() => logout()}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Logout
          </button>
        </header>

        <h2 className="text-xl text-muted-foreground mt-6">Welcome, {user.firstName}!</h2>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {navigationCards.map((card, index) => (
            <Link key={card.href} href={card.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="cursor-pointer h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <card.icon className="h-6 w-6 text-primary" />
                      <CardTitle>{card.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}