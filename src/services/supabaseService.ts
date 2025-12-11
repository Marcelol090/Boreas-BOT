import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env';
import { Product, SaleRecord } from '../types';
import { storeService } from './storeService';
import axios from 'axios';
import { logger } from '../lib/logger';

class SupabaseService {
    public client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    constructor() { 
        if(process.env.NODE_ENV !== 'test') this.initRealtime(); 
    }

    private initRealtime() {
        this.client.channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                storeService.loadProducts();
            })
            .subscribe();
    }

    async getProducts(): Promise<Product[]> {
        // Mock se for teste
        if (process.env.NODE_ENV === 'test') {
            return [{ id: '1', name: 'Mock', price: 50, description: 'Desc', image_url: '', download_link: '', stock: 10, category: 'quest', size: 'medio' }];
        }
        const { data, error } = await this.client.from('products').select('*');
        if (error) logger.error('DB Error', error);
        return (data as Product[]) || [];
    }

    async addProduct(product: Product) {
        if (process.env.NODE_ENV === 'test') return;
        const { error } = await this.client.from('products').insert([product]);
        if (error) throw new Error(error.message);
    }

    async uploadImageFromUrl(url: string, filename: string): Promise<string> {
        if (process.env.NODE_ENV === 'test') return 'http://mock.com/img.png';
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            const safeName = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
            await this.client.storage.from('vitrine').upload(`public/${safeName}.png`, buffer, { contentType: 'image/png', upsert: true });
            const { data } = this.client.storage.from('vitrine').getPublicUrl(`public/${safeName}.png`);
            return data.publicUrl;
        } catch (e) { throw new Error('Falha no upload'); }
    }

    async registerSale(sale: SaleRecord) {
        if (process.env.NODE_ENV === 'test') return { id: '123' };
        const { data } = await this.client.from('sales').insert([sale]).select().single();
        return data;
    }
}
export const dbService = new SupabaseService();