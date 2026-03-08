import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      toast({ title: "Welcome back!", description: "You have logged in successfully." });
      navigate("/");
    } else {
      toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your HUNT account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>

          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium">Demo admin login:</p>
            <p>Email: admin@hunt.co.ke · Password: admin123</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
