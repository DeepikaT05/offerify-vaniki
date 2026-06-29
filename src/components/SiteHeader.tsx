import { Link } from "@tanstack/react-router";
import logo from "@/assets/vaniki-logo.png";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Vaniki Crop Science"
            width={40}
            height={40}
            loading="lazy"
            className="h-10 w-10 object-contain"
          />
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold text-brand">VANIKI</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Offer Letter Generator
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-foreground" }}
          >
            Dashboard
          </Link>
          <Button asChild size="sm">
            <Link to="/new">
              <Plus className="mr-1 h-4 w-4" /> New Letter
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
