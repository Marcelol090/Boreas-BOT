import { Product, CartItem } from '../types';
import { dbService } from './supabaseService';
import { logger } from '../lib/logger';

class StoreService {
    public productsMap = new Map<string, Product>();
    public categoryIndex = new Map<string, Set<string>>();
    private carts = new Map<string, CartItem[]>();

    setClient(client: any) { }

    async loadProducts() {
        try {
            const products = await dbService.getProducts();
            this.productsMap.clear();
            this.categoryIndex.clear();
            products.forEach(p => this.cacheProduct(p));
            logger.success(`Cache: ${this.productsMap.size}`, 'StoreService');
        } catch (error) {
            logger.error('Falha load', error, 'StoreService');
        }
    }

    cacheProduct(p: Product) {
        this.productsMap.set(p.id, p);
        const indexKey = `${p.category}_${p.size}`;
        if (!this.categoryIndex.has(indexKey)) this.categoryIndex.set(indexKey, new Set());
        this.categoryIndex.get(indexKey)?.add(p.id);
    }

    filterProducts(category: string, size: string): Product[] {
        const indexKey = `${category}_${size}`;
        const ids = this.categoryIndex.get(indexKey);
        if (!ids) return [];
        return Array.from(ids).map(id => this.productsMap.get(id)!).filter(p => p && p.stock > 0);
    }

    searchProducts(query: string): Product[] {
        const lower = query.toLowerCase();
        return Array.from(this.productsMap.values())
            .filter(p => p.name.toLowerCase().includes(lower) && p.stock > 0)
            .slice(0, 25);
    }

    checkStock(id: string): boolean {
        const p = this.productsMap.get(id);
        return !!(p && p.stock > 0);
    }

    addToCart(userId: string, productId: string): boolean {
        if (!this.checkStock(productId)) return false;
        const cart = this.carts.get(userId) || [];
        const existing = cart.find(i => i.productId === productId);
        if (existing) existing.quantity++;
        else cart.push({ productId, quantity: 1, addedAt: Date.now() });
        this.carts.set(userId, cart);
        return true;
    }

    getCart(userId: string) { return this.carts.get(userId) || []; }
    clearCart(userId: string) { this.carts.delete(userId); }
    getProduct(id: string) { return this.productsMap.get(id); }
    calculateTotal(userId: string) {
        return this.getCart(userId).reduce((acc, item) => {
            const p = this.productsMap.get(item.productId);
            return acc + (p ? p.price * item.quantity : 0);
        }, 0);
    }
}
export const storeService = new StoreService();