import { productModalSchema } from '../../lib/validators';
describe('🛡️ SECURITY', () => {
    test('Rejeitar crase', () => expect(productModalSchema.safeParse({ name: '`Fail`', price: 10, description: 'ok', download_link: 'http://ok.com' }).success).toBe(false));
    test('Aceitar valido', () => expect(productModalSchema.safeParse({ name: 'Ok', price: 10, description: 'ok desc', download_link: 'http://ok.com' }).success).toBe(true));
});