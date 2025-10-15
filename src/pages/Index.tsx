import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, BarChart3, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Inventory Manager</span>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Modern Inventory Management
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Complete control over your inventory with real-time tracking, automated alerts,
            and comprehensive reporting.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Start Managing Inventory
          </Button>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Product Management</h3>
                <p className="text-sm text-muted-foreground">
                  Complete CRUD operations with SKU tracking and pricing
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <h3 className="mb-2 font-semibold">Transaction Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Track all buying, selling, and adjustments in real-time
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                  <Shield className="h-6 w-6 text-warning" />
                </div>
                <h3 className="mb-2 font-semibold">Low Stock Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Automated notifications when inventory reaches minimum levels
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold">Activity Audit Trail</h3>
                <p className="text-sm text-muted-foreground">
                  Complete logs of who did what and when
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Inventory Manager. Secure inventory tracking for your business.
        </div>
      </footer>
    </div>
  );
};

export default Index;
