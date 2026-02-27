import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-secondary/50 py-10">
    <div className="container mx-auto px-4">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
              H
            </div>
            <span className="font-display text-lg font-bold">HUNT</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Simplifying the house-hunting process in Kenya with centralized, reliable rental information.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display font-semibold">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/listings" className="hover:text-primary transition-colors">Browse Listings</Link>
            <Link to="/dashboard" className="hover:text-primary transition-colors">List Your Property</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display font-semibold">Contact</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>info@hunt.co.ke</span>
            <span>+254 700 000 000</span>
            <span>Nairobi, Kenya</span>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        © 2026 HUNT — Centralized Digital House Hunting System
      </div>
    </div>
  </footer>
);

export default Footer;
