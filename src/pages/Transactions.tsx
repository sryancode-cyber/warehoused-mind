import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, TrendingDown, Settings } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Transactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    type: "buy",
    quantity: "",
    price_per_unit: "",
    notes: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchData();
    };

    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const { data: productsData } = await supabase.from("products").select("*");
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*, products(name, sku)")
        .order("created_at", { ascending: false });

      setProducts(productsData || []);
      setTransactions(transactionsData || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const quantity = parseInt(formData.quantity);
    const pricePerUnit = parseFloat(formData.price_per_unit);
    const totalAmount = quantity * pricePerUnit;

    try {
      // Insert transaction
      const { error: transactionError } = await supabase.from("transactions").insert([{
        product_id: formData.product_id,
        type: formData.type,
        quantity,
        price_per_unit: pricePerUnit,
        total_amount: totalAmount,
        notes: formData.notes,
        user_id: user.id,
      }]);

      if (transactionError) throw transactionError;

      // Update product quantity
      const product = products.find(p => p.id === formData.product_id);
      if (product) {
        let newQuantity = product.quantity;
        if (formData.type === "buy" || formData.type === "adjustment") {
          newQuantity += quantity;
        } else if (formData.type === "sell") {
          newQuantity -= quantity;
        }

        const { error: updateError } = await supabase
          .from("products")
          .update({ quantity: newQuantity })
          .eq("id", formData.product_id);

        if (updateError) throw updateError;
      }

      toast({ title: "Success", description: "Transaction recorded successfully" });
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      type: "buy",
      quantity: "",
      price_per_unit: "",
      notes: "",
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type === "buy") return <TrendingUp className="h-4 w-4 text-success" />;
    if (type === "sell") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Settings className="h-4 w-4 text-warning" />;
  };

  const getTransactionBadge = (type: string) => {
    if (type === "buy") return <Badge className="bg-success">Buy</Badge>;
    if (type === "sell") return <Badge variant="destructive">Sell</Badge>;
    return <Badge className="bg-warning">Adjustment</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">Track all buying and selling activities</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) => {
                      const product = products.find(p => p.id === value);
                      setFormData({
                        ...formData,
                        product_id: value,
                        price_per_unit: product?.price.toString() || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy (Add Stock)</SelectItem>
                      <SelectItem value="sell">Sell (Remove Stock)</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price/Unit</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price_per_unit}
                      onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes..."
                  />
                </div>
                <Button type="submit" className="w-full">
                  Record Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Record your first transaction to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.products?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.products?.sku}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          {getTransactionBadge(transaction.type)}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>${transaction.price_per_unit?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell className="font-medium">
                        ${transaction.total_amount?.toFixed(2) || "0.00"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;
