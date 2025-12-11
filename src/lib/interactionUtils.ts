import { RepliableInteraction, EmbedBuilder } from 'discord.js';
import { logger } from './logger';

const cooldowns = new Set<string>();

export class InteractionUtils {
    static checkCooldown(userId: string, key: string): boolean {
        const uniqueKey = `${userId}-${key}`;
        if (cooldowns.has(uniqueKey)) return true;
        cooldowns.add(uniqueKey);
        setTimeout(() => cooldowns.delete(uniqueKey), 2000); 
        return false;
    }

    static async safeReply(interaction: RepliableInteraction, content: any, ephemeral = true) {
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(content);
            } else {
                await interaction.reply({ ...content, ephemeral });
            }
        } catch (error) {
            logger.error('Falha ao responder interação', error, 'InteractionUtils');
        }
    }

    static async sendError(interaction: RepliableInteraction, message: string) {
        const embed = new EmbedBuilder().setTitle('❌ Ocorreu um erro').setDescription(message).setColor(0xFF0000);
        await this.safeReply(interaction, { embeds: [embed], components: [] }, true);
    }
}