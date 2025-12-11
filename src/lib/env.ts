import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const envSchema = z.object({
    DISCORD_TOKEN: z.string().min(1),
    APPLICATION_ID: z.string().min(1),
    GUILD_ID: z.string().min(1),
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string().min(1),
    ANNOUNCEMENT_CHANNEL_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    REDIRECT_URI: z.string().optional(),
});

let _env: any;
try {
    _env = envSchema.parse(process.env);
} catch (e) {
    if (isTest) {
        console.warn('⚠️ Test Mode: Usando variáveis Mock.');
        _env = {
            DISCORD_TOKEN: 'mock', APPLICATION_ID: '123', GUILD_ID: '123',
            SUPABASE_URL: 'https://mock.com', SUPABASE_KEY: 'mock'
        };
    } else {
        throw e;
    }
}
export const env = _env;