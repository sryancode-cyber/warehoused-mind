import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Activity as ActivityIcon, Package, Receipt } from "lucide-react";

const Activity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchActivities();
    };

    checkAuth();
  }, [navigate]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action === "INSERT") return <Badge className="bg-success">Created</Badge>;
    if (action === "UPDATE") return <Badge className="bg-warning">Updated</Badge>;
    if (action === "DELETE") return <Badge variant="destructive">Deleted</Badge>;
    return <Badge>{action}</Badge>;
  };

  const getEntityIcon = (entityType: string) => {
    if (entityType === "products") return <Package className="h-4 w-4" />;
    if (entityType === "transactions") return <Receipt className="h-4 w-4" />;
    return <ActivityIcon className="h-4 w-4" />;
  };

  const formatEntityType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1, -1);
  };

  const getActivityDescription = (activity: any) => {
    const entityType = formatEntityType(activity.entity_type);
    
    if (activity.action === "INSERT") {
      const details = activity.details;
      if (activity.entity_type === "products") {
        return `Created product: ${details.name} (${details.sku})`;
      }
      if (activity.entity_type === "transactions") {
        return `Recorded ${details.type} transaction`;
      }
    }
    
    if (activity.action === "UPDATE") {
      const details = activity.details;
      if (details?.new?.name) {
        return `Updated product: ${details.new.name}`;
      }
      return `Updated ${entityType.toLowerCase()}`;
    }
    
    if (activity.action === "DELETE") {
      const details = activity.details;
      if (details?.name) {
        return `Deleted product: ${details.name}`;
      }
      return `Deleted ${entityType.toLowerCase()}`;
    }
    
    return `${activity.action} on ${entityType.toLowerCase()}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">Complete audit trail of all system activities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="mt-1 rounded-full bg-muted p-2">
                      {getEntityIcon(activity.entity_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {getActionBadge(activity.action)}
                        <span className="text-sm text-muted-foreground">
                          {formatEntityType(activity.entity_type)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Activity;
