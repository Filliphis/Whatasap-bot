const axios = require('axios');
const { delay, DEFAULT_DELAY } = require('../delay');

async function handleCpfVerification(chatId, text, msg, userState) {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(text)) {
        await delay(DEFAULT_DELAY);
        msg.reply("CPF inválido! Por favor, digite no formato 000.000.000-00.");
        return;
    }

    try {
        const response = await axios.post(`${process.env.API_URL}/consulta-cpf`, { cpf: text });
        const data = response.data;

        if (data.error) {
            await delay(DEFAULT_DELAY);
            msg.reply("CPF não encontrado no sistema.");
            delete userState[chatId];
            return;
        }

        if (data.message) {
            await delay(DEFAULT_DELAY);
            msg.reply("Você não é mais sócio da Abralin.");
            delete userState[chatId];
            return;
        }

        userState[chatId].step = 1;
        userState[chatId].nome = data.nome;
        userState[chatId].cpf = text;

        await delay(DEFAULT_DELAY);
        msg.reply(`Olá, ${data.nome}! Escolha uma opção:\n1️⃣ Anuidades\n2️⃣ Páginas da Abralin\n3️⃣ Contato\nDigite 'sair' para encerrar a sessão.`);
    } catch (error) {
        console.error('Erro ao consultar API:', error);
        await delay(DEFAULT_DELAY);
        msg.reply("Ocorreu um erro ao verificar seu CPF. Tente novamente mais tarde.");
    }
}

async function handleUserOptions(chatId, text, msg, userState) {
    if (text.toLowerCase() === "sair") {
        delete userState[chatId];
        await delay(DEFAULT_DELAY);
        msg.reply("Sessão encerrada. Envie qualquer mensagem para começar de novo.");
        return;
    }

    switch (text) {
        case "1":
            await handleAnuidades(chatId, msg, userState);
            break;
        case "2":
            await handleAbralinPages(msg);
            break;
        case "3":
            await handleContactInfo(msg);
            break;
        default:
            await handleInvalidOption(msg);
            break;
    }
}

async function handleAnuidades(chatId, msg, userState) {
    await delay(DEFAULT_DELAY);
    msg.reply("Consultando anuidades...");

    try {
        const response = await axios.post(`${process.env.API_URL}/consulta-cpf`, { cpf: userState[chatId].cpf });
        const data = response.data;

        if (data.error) {
            await delay(DEFAULT_DELAY);
            msg.reply("Não foi possível consultar as anuidades.");
            return;
        }

        if (data.anosPendentes && data.anosPendentes.length > 0) {
            await delay(DEFAULT_DELAY);
            msg.reply(`Os seguintes anos estão em pendência:\n${data.anosPendentes.join("\n")}\nPor favor, entre em contato com a Abralin para mais informações.`);
        } else {
            await delay(DEFAULT_DELAY);
            msg.reply("Não há anuidades pendentes.");
        }
    } catch (error) {
        console.error('Erro ao consultar anuidades:', error);
        await delay(DEFAULT_DELAY);
        msg.reply("Ocorreu um erro ao consultar as anuidades. Tente novamente mais tarde.");
    }
}

async function handleAbralinPages(msg) {
    await delay(DEFAULT_DELAY);
    msg.reply("Acesse as páginas da Abralin:\n" +
        "www.abralin.org\n" +
        "https://editora.abralin.org/\n" +
        "https://revista.abralin.org/index.php/abralin\n" +
        "www.roseta.org.br\n" +
        "https://cadernos.abralin.org\n" +
        "https://abralin.org/eventos");
}

async function handleContactInfo(msg) {
    await delay(DEFAULT_DELAY);
    msg.reply("Para mais informações, entre em contato:\n📧 abralin@abralin.org\n📞 81 99141-4543");
}

async function handleInvalidOption(msg) {
    await delay(DEFAULT_DELAY);
    msg.reply("Opção inválida. Escolha uma opção:\n1️⃣ Verificar anuidades\n2️⃣ Páginas da Abralin\n3️⃣ Contato\nDigite 'sair' para encerrar a sessão.");
}

module.exports = {
    handleCpfVerification,
    handleUserOptions
};