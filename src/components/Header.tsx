import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Plus, Menu, X, LogIn, LogOut, Shield, User, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const links = [
    { to: "/", label: "Home", icon: Home, show: true },
    { to: "/listings", label: "Find a House", icon: Search, show: true },
    { to: "/tenant", label: "My Dashboard", icon: User, show: isLoggedIn && user?.role === "user" },
    { to: "/dashboard", label: "List Property", icon: Plus, show: isLoggedIn && user?.role === "landlord" },
    { to: "/admin", label: "Admin Panel", icon: Shield, show: isAdmin },
  ].filter((l) => l.show);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
            H
          </div>
          <span className="font-display text-xl font-bold text-foreground">HUNT</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                <User className="h-3.5 w-3.5" />
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-muted-foreground">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-1">
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/login"><LogIn className="h-4 w-4" /> Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-border bg-background px-4 py-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                location.pathname === link.to ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground">
              <LogOut className="h-4 w-4" /> Logout ({user?.name})
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground">
                <LogIn className="h-4 w-4" /> Login
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-primary">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
