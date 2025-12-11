import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { env } from './lib/env';
import chalk from 'chalk';

const commands = [
    new SlashCommandBuilder().setName('mapas').setDescription('Iniciar RPG Boreas'),
    new SlashCommandBuilder().setName('vincular').setDescription('🔗 Conectar conta'),
    new SlashCommandBuilder().setName('buscar').setDescription('Busca rápida').addStringOption(o => o.setName('produto').setDescription('Nome').setAutocomplete(true).setRequired(true)),
    new SlashCommandBuilder().setName('adicionar-produto').setDescription('Admin: Adicionar Produto').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(o => o.setName('id_unico').setDescription('ID').setRequired(true))
        .addStringOption(o => o.setName('categoria').setDescription('Cat').setRequired(true).addChoices({ name: 'Quest', value: 'quest' }, { name: 'Hunt', value: 'hunt' }, { name: 'Sala', value: 'sala' }, { name: 'Cidade', value: 'cidade' }))
        .addStringOption(o => o.setName('tamanho').setDescription('Tam').setRequired(true).addChoices({ name: 'Pequeno', value: 'pequeno' }, { name: 'Médio', value: 'medio' }, { name: 'Grande', value: 'grande' }))
        .addAttachmentOption(o => o.setName('imagem_vitrine').setDescription('Img').setRequired(true))
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(chalk.yellow(`🔄 Iniciando refresh de ${commands.length} comandos...`));
        if (process.env.NODE_ENV === 'test') {
             console.log(chalk.green(`✅ [MOCK] Comandos registrados!`));
             return;
        }
        const data: any = await rest.put(Routes.applicationGuildCommands(env.APPLICATION_ID, env.GUILD_ID), { body: commands });
        console.log(chalk.green(`✅ Sucesso! ${data.length} comandos registrados.`));
    } catch (error) {
        console.error(chalk.red('❌ Erro no deploy:'), error);
    }
})();