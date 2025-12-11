import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuInteraction } from 'discord.js';
import { storeService } from '../services/storeService';
import { MESSAGES } from '../lib/constants';
import { InteractionUtils } from '../lib/interactionUtils';

const BOREAS_IMG = 'https://i.imgur.com/4WhJjJc.png'; 

export async function handleBoreasStart(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('🐲 O Empório de Boreas')
        .setDescription(MESSAGES.BOREAS_WELCOME)
        .setColor(0xFFD700)
        .setThumbnail(BOREAS_IMG);

    const select = new StringSelectMenuBuilder()
        .setCustomId('menu_category')
        .setPlaceholder('🗺️ Categoria')
        .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('Quests').setValue('quest').setEmoji('⚔️'),
            new StringSelectMenuOptionBuilder().setLabel('Hunts').setValue('hunt').setEmoji('🏹'),
            new StringSelectMenuOptionBuilder().setLabel('Salas').setValue('sala').setEmoji('🔮'),
            new StringSelectMenuOptionBuilder().setLabel('Cidades').setValue('cidade').setEmoji('🏰'),
        );

    await InteractionUtils.safeReply(interaction, { embeds: [embed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)] });
}

export async function handleCategorySelect(interaction: StringSelectMenuInteraction) {
    const category = interaction.values[0];
    const embed = new EmbedBuilder().setTitle(`Categoria: ${category}`).setColor(0xFFD700).setThumbnail(BOREAS_IMG);
    const select = new StringSelectMenuBuilder()
        .setCustomId(`menu_size_${category}`)
        .setPlaceholder('📏 Tamanho')
        .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('Pequeno').setValue('pequeno'),
            new StringSelectMenuOptionBuilder().setLabel('Médio').setValue('medio'),
            new StringSelectMenuOptionBuilder().setLabel('Grande').setValue('grande'),
        );
    await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)] });
}

export async function handleSizeSelect(interaction: StringSelectMenuInteraction) {
    const category = interaction.customId.split('_')[2]; 
    const size = interaction.values[0];
    const products = storeService.filterProducts(category, size);

    if (products.length === 0) return interaction.update({ content: MESSAGES.NO_STOCK, embeds: [], components: [] });

    const embed = new EmbedBuilder().setTitle(`Estoque`).setDescription(`**${products.length}** mapas encontrados.`).setColor(0x00FF00).setThumbnail(BOREAS_IMG);
    const buttons = products.slice(0, 5).map(p => new ButtonBuilder().setCustomId(`buy_${p.id}`).setLabel(`${p.name} - R$${p.price}`).setStyle(ButtonStyle.Success));
    await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)] });
}