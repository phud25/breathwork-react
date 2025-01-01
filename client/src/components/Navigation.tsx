import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/breathwork", label: "Breathwork Sessions" },
  { href: "/trance", label: "Guided Trance" },
  { href: "/profile", label: "Profile" },
];

export function Navigation() {
  const [location] = useLocation();
  const { logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const getHeaderText = (path: string) => {
    switch (path) {
      case '/breathwork':
        return 'Breathwork Sessions';
      default:
        return 'Patterns Breathwork';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container px-4 mx-auto">
        <nav className="h-[80px] flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-xl font-semibold text-[rgb(167,139,250)] truncate p-0 hover:bg-transparent"
            onClick={() => window.location.href = '/'}
          >
            {getHeaderText(location)}
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] bg-background border-l border-border">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={`justify-start px-4 ${
                      location === item.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10"
                    }`}
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = item.href;
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="justify-start px-4 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                >
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}