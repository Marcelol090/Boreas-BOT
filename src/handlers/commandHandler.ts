import { ChatInputCommandInteraction, AutocompleteInteraction, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { handleBoreasStart } from './boreasHandler';
import { handleLinkRole } from './metadataHandler';
import { storeService } from '../services/storeService';
import { dbService } from '../services/supabaseService';
import { stateManager } from '../lib/stateManager';
import { InteractionUtils } from '../lib/interactionUtils';

export async function handleCommand(interaction: ChatInputCommandInteraction) {
    const { commandName } = interaction;
    if (commandName === 'mapas') await handleBoreasStart(interaction);
    else if (commandName === 'adicionar-produto') await handleAddProductModal(interaction);
    else if (commandName === 'vincular') await handleLinkRole(interaction);
    else if (commandName === 'buscar') {
        const productName = interaction.options.getString('produto');
        await interaction.reply({ content: `Busca: ${productName}`, ephemeral: true });
    }
}
export async function handleAutocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const results = storeService.searchProducts(focusedValue);
    await interaction.respond(results.map(p => ({ name: p.name, value: p.id })));
}
async function handleAddProductModal(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return interaction.reply('⛔');
    const id = interaction.options.getString('id_unico', true);
    const category = interaction.options.getString('categoria', true);
    const size = interaction.options.getString('tamanho', true);
    const image = interaction.options.getAttachment('imagem_vitrine', true);
    
    try { await dbService.uploadImageFromUrl(image.url, id); } 
    catch (e) { return InteractionUtils.sendError(interaction as any, 'Erro upload img'); }

    const stateKey = stateManager.createState({ id, category, size });
    const modal = new ModalBuilder().setCustomId(`modal_add_${stateKey}`).setTitle('Detalhes do Produto');
    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('input_name').setLabel('Nome').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('input_price').setLabel('Preço').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('input_link').setLabel('Link').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('input_desc').setLabel('Descrição').setStyle(TextInputStyle.Paragraph).setRequired(true))
    );
    await interaction.showModal(modal);
}