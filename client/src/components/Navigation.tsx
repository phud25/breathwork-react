import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
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
    <header className="nav-header">
      <nav className="h-full flex items-center justify-between">
        <Link href="/">
          <a className="text-base md:text-lg font-semibold text-primary truncate logo">
            {getHeaderText(location)}
          </a>
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] bg-background border-l border-border">
            <nav className="flex flex-col space-y-4 mt-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`px-4 py-2 rounded-md transition-colors ${
                      location === item.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
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
    </header>
  );
}