import { z } from 'zod';
export const productModalSchema = z.object({
    name: z.string().min(3).max(100).regex(/^[^`]+$/),
    price: z.coerce.number().positive().max(10000),
    description: z.string().min(10).max(1000),
    download_link: z.string().url()
});