import { Interaction, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } from 'discord.js';
import { storeService } from '../services/storeService';
import { dbService } from '../services/supabaseService';
import { handleCategorySelect, handleSizeSelect } from './boreasHandler';
import { handleModal } from './modalHandler';
import { InteractionUtils } from '../lib/interactionUtils';
import { MESSAGES } from '../lib/constants';

export async function handleComponent(interaction: Interaction, client: Client) {
    try {
        if (interaction.isModalSubmit()) return handleModal(interaction);

        if (interaction.isStringSelectMenu()) {
            const { customId } = interaction;
            if (customId === 'menu_category') await handleCategorySelect(interaction);
            else if (customId.startsWith('menu_size_')) await handleSizeSelect(interaction);
        } 
        else if (interaction.isButton()) {
            const { customId } = interaction;
            
            if (InteractionUtils.checkCooldown(interaction.user.id, customId)) {
                return interaction.reply({ content: MESSAGES.ERROR_COOLDOWN, ephemeral: true });
            }

            if (customId.startsWith('buy_')) await handleBuy(interaction);
            else if (customId.startsWith('checkout_')) await handleCheckout(interaction);
        }
    } catch (error) {
        InteractionUtils.sendError(interaction as any, MESSAGES.ERROR_GENERIC);
    }
}

async function handleBuy(interaction: ButtonInteraction) {
    const productId = interaction.customId.split('_')[1];
    await interaction.deferReply({ ephemeral: true });

    if (!storeService.addToCart(interaction.user.id, productId)) {
        return InteractionUtils.sendError(interaction, MESSAGES.NO_STOCK);
    }
    
    const p = storeService.getProduct(productId);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('checkout_pix').setLabel('Pagar PIX').setStyle(ButtonStyle.Success)
    );

    await interaction.editReply({ content: `✅ **${p?.name}** ${MESSAGES.ADDED_TO_CART}` });
    
    try { 
        await interaction.user.send({ content: `${MESSAGES.CHECKOUT_TITLE}: **${p?.name}**`, components: [row] }); 
    } catch {
        await interaction.followUp({ content: '⚠️ Abra suas DMs para receber o link.', ephemeral: true });
    }
}

async function handleCheckout(interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const cart = storeService.getCart(interaction.user.id);
    const total = storeService.calculateTotal(interaction.user.id);
    await dbService.registerSale({
        user_id: interaction.user.id, total, payment_method: 'pix', status: 'pending', items: cart
    });
    storeService.clearCart(interaction.user.id);
    await interaction.editReply({ content: '✅ Pedido gerado com sucesso!' });
}