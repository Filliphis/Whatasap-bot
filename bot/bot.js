require('dotenv').config(); // Carrega as variáveis de ambiente
const client = require('./clientConfig');
const { delay, DEFAULT_DELAY } = require('./delay');
const { handleCpfVerification, handleUserOptions } = require('./handlers');

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code para conectar.');
});

client.on('ready', () => {
    console.log('Bot do WhatsApp está pronto!');
});

let userState = {}; // Armazena o estado do usuário

client.on('message', async msg => {
    const chatId = msg.from;
    const text = msg.body.trim();

    if (!userState[chatId]) {
        userState[chatId] = { step: 0 };
        await delay(DEFAULT_DELAY);
        msg.reply("Para iniciar, por favor informe seu CPF no formato 000.000.000-00.");
        return;
    }

    if (userState[chatId].step === 0) {
        await handleCpfVerification(chatId, text, msg, userState);
        return;
    }

    if (userState[chatId].step === 1) {
        await handleUserOptions(chatId, text, msg, userState);
        return;
    }
});

client.initialize();