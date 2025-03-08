const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions' // Pasta onde as sessões serão armazenadas
    }),
    puppeteer: {
        headless: true, // Executar em modo headless (sem interface gráfica)
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code para conectar.');
});

client.on('ready', () => {
    console.log('Bot do WhatsApp está pronto!');
});

// Tentativa automática de reconexão
client.on('disconnected', async (reason) => {
    console.log('Bot desconectado:', reason);
    console.log('Tentando reconectar em 10 segundos...');

    setTimeout(async () => {
        try {
            await client.initialize();
            console.log('Bot reconectado com sucesso!');
        } catch (error) {
            console.error(' Erro ao tentar reconectar:', error);
        }
    }, 10000);
});

module.exports = client;