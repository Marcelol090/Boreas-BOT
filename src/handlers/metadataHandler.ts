import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from 'discord.js';
import { env } from '../lib/env';
export async function handleLinkRole(interaction: ChatInputCommandInteraction) {
    if (!env.REDIRECT_URI) return interaction.reply({ content: '❌ REDIRECT_URI missing', ephemeral: true });
    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.set('client_id', env.APPLICATION_ID);
    url.searchParams.set('redirect_uri', env.REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'role_connections.write identify');
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel('Conectar Conta').setStyle(ButtonStyle.Link).setURL(url.toString()).setEmoji('🔗'));
    await interaction.reply({ content: `**Conecte sua conta para receber cargos automáticos!**`, components: [row], ephemeral: true });
}