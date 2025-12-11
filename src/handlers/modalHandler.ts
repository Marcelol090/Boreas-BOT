import { ModalSubmitInteraction } from 'discord.js';
import { dbService } from '../services/supabaseService';
import { stateManager } from '../lib/stateManager';
import { productModalSchema } from '../lib/validators';
import { ZodError } from 'zod';
import { InteractionUtils } from '../lib/interactionUtils';
import { logger } from '../lib/logger';

export async function handleModal(interaction: ModalSubmitInteraction) {
    if (interaction.customId.startsWith('modal_add_')) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const stateKey = interaction.customId.split('_')[2];
            const state = stateManager.getState(stateKey);

            if (!state) return InteractionUtils.sendError(interaction, 'Sessão expirada. Comece novamente.');

            const rawData = {
                name: interaction.fields.getTextInputValue('input_name'),
                price: interaction.fields.getTextInputValue('input_price'),
                description: interaction.fields.getTextInputValue('input_desc'),
                download_link: interaction.fields.getTextInputValue('input_link')
            };

            const validatedData = productModalSchema.parse(rawData);
            
            let imageUrl = '';
            try {
                imageUrl = await dbService.uploadImageFromUrl('https://via.placeholder.com/150', state.id); // Placeholder caso falhe
            } catch (imgError) {
                logger.warn('Falha ao recuperar URL da imagem', 'ModalHandler');
            }
            
            await dbService.addProduct({
                id: state.id,
                name: validatedData.name,
                price: validatedData.price,
                description: validatedData.description,
                download_link: validatedData.download_link,
                image_url: imageUrl,
                stock: 999,
                category: state.category as any,
                size: state.size as any
            });

            stateManager.deleteState(stateKey);
            await interaction.editReply(`✅ **${validatedData.name}** cadastrado com sucesso!`);

        } catch (error: any) {
            if (error instanceof ZodError) {
                const errorMsg = error.errors.map(e => `• ${e.message}`).join('\n');
                await InteractionUtils.sendError(interaction, `Dados Inválidos:\n${errorMsg}`);
            } else {
                logger.error('Erro ao salvar produto', error, 'ModalHandler');
                await InteractionUtils.sendError(interaction, `Erro interno: ${error.message}`);
            }
        }
    }
}