import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { 
  Receipt, 
  ShoppingBag, 
  ChevronRight, 
  RotateCcw,
  UtensilsCrossed,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  menu_item_id: string | null;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderHistoryProps {
  onReorder?: (items: { menu_item_id: string; quantity: number }[]) => void;
}

const OrderHistory = ({ onReorder }: OrderHistoryProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        notes,
        created_at,
        order_items (
          id,
          item_name,
          item_price,
          quantity,
          menu_item_id
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading orders:', error);
    } else {
      setOrders((data as Order[]) || []);
    }
    setLoading(false);
  };

  const handleReorder = (order: Order) => {
    const reorderItems = order.order_items
      .filter(item => item.menu_item_id)
      .map(item => ({
        menu_item_id: item.menu_item_id!,
        quantity: item.quantity,
      }));

    if (reorderItems.length === 0) {
      toast.error('Some items from this order are no longer available');
      return;
    }

    if (onReorder) {
      onReorder(reorderItems);
      toast.success('Items added for reorder!');
    } else {
      toast.info('Reorder functionality coming soon!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No orders yet</p>
            <p className="text-sm mt-1">Your order history will appear here after your visits</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Dialog key={order.id}>
                <DialogTrigger asChild>
                  <div 
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UtensilsCrossed className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {format(new Date(order.created_at), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.order_items.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold flex items-center">
                          <IndianRupee className="h-4 w-4" />
                          {order.total_amount.toFixed(2)}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(order.status)} text-white text-xs`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary" />
                      Order Details
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span>{format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(order.status)} text-white`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <p className="font-medium mb-3">Items Ordered</p>
                      <ScrollArea className="max-h-[200px]">
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex justify-between items-center py-2 border-b border-border last:border-0"
                            >
                              <div>
                                <p className="font-medium">{item.item_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-medium flex items-center">
                                <IndianRupee className="h-3 w-3" />
                                {(item.item_price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="border-t border-border pt-4 flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {order.total_amount.toFixed(2)}
                      </span>
                    </div>

                    {order.notes && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {order.notes}
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => handleReorder(order)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reorder These Items
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
