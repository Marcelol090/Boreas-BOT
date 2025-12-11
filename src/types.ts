export interface Product {
    id: string; name: string; price: number; description: string;
    image_url: string | null; download_link: string; stock: number;
    category: 'quest' | 'hunt' | 'sala' | 'cidade'; size: 'pequeno' | 'medio' | 'grande';
}
export interface CartItem { productId: string; quantity: number; addedAt: number; }
export interface SaleRecord { user_id: string; total: number; payment_method: 'pix' | 'card'; status: string; items: CartItem[]; }
export interface PendingProductState { id: string; category: string; size: string; timestamp: number; }