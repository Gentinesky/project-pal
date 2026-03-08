import { Link } from "react-router-dom";
import { Search, MapPin, Shield, Clock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const { isLoggedIn } = useAuth();
  const { approvedListings } = useListings();
  const featured = approvedListings.filter((p) => p.available).slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Nairobi cityscape"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="mb-4 animate-fade-in-up font-display text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl">
            Find Your Perfect Home
          </h1>
          <p className="mx-auto mb-8 max-w-2xl animate-fade-in-up text-lg text-primary-foreground/80 [animation-delay:0.2s]">
            HUNT simplifies house hunting in Kenya. Browse verified listings with real-time availability, utility details, and direct landlord contacts.
          </p>
          <div className="flex animate-fade-in-up justify-center gap-4 [animation-delay:0.4s]">
            {isLoggedIn ? (
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link to="/listings">
                    <Search className="h-4 w-4" />
                    Browse Listings
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20">
                  <Link to="/dashboard">List Your Property</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link to="/signup">
                    <UserPlus className="h-4 w-4" />
                    Sign Up to Browse
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20">
                  <Link to="/login">I Have an Account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">
            Why Use HUNT?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: MapPin, title: "Location-Based Search", desc: "Find houses in your preferred neighborhood with detailed location info." },
              { icon: Clock, title: "Real-Time Availability", desc: "See which units are vacant right now — no more wasted trips." },
              { icon: Shield, title: "Verified Details", desc: "Utility costs, billing methods, and landlord contacts all in one place." },
            ].map((f) => (
              <div key={f.title} className="card-elevated rounded-xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings — only for logged-in users */}
      {isLoggedIn ? (
        <section className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-3xl font-bold">Featured Listings</h2>
              <Link to="/listings" className="text-sm font-medium text-primary hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold">Ready to Find Your Home?</h2>
            <p className="mb-6 text-muted-foreground">Create a free account to browse all verified listings.</p>
            <Button asChild size="lg">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
