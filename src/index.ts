import { Client, GatewayIntentBits } from 'discord.js';
import { env } from './lib/env';
import { handleCommand, handleAutocomplete } from './handlers/commandHandler';
import { handleComponent } from './handlers/componentHandler';
import { storeService } from './services/storeService';
import { logger } from './lib/logger';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]
});

client.once('ready', async () => {
    logger.success(`${client.user?.tag} - V15 Final Integration`, 'System');
    storeService.setClient(client);
    await storeService.loadProducts();
});

process.on('unhandledRejection', (error) => { logger.error('Unhandled Rejection', error, 'System'); });

client.on('interactionCreate', async i => {
    try {
        if (i.isChatInputCommand()) await handleCommand(i);
        else if (i.isAutocomplete()) await handleAutocomplete(i);
        else if (i.isMessageComponent() || i.isModalSubmit()) await handleComponent(i, client);
    } catch (e) { 
        logger.error('Erro crítico no Interaction Handler', e, 'System');
    }
});

if (process.env.NODE_ENV !== 'test') {
    client.login(env.DISCORD_TOKEN);
} else {
    console.log('🧪 Modo de Teste: Login ignorado.');
}