const db = require('../db');

exports.consultaCpf = (req, res) => {
    const { cpf } = req.body;
    if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    // Verifica primeiro se o usuário está inativo
    const querySocio = `
        SELECT cod_soc, excluido_soc, nome_soc 
        FROM socio
        WHERE cpf_soc = ?
    `;

    db.query(querySocio, [cpf], (err, socioResults) => {
        if (err) {
            console.error('Erro na consulta de sócio:', err);
            return res.status(500).json({ error: 'Erro ao consultar CPF' });
        }

        if (socioResults.length === 0) {
            return res.status(404).json({ error: 'CPF não encontrado' });
        }

        const usuario = socioResults[0];

        if (usuario.excluido_soc === 'S') {
            return res.json({ message: 'Usuário não se encontra em situação ativa.' });
        }

        // Se for ativo, verifica anuidades pendentes
        const queryAnuidades = `
            SELECT anovigencia_par 
            FROM parcela 
            WHERE codsocio_par = ? AND quandopagamento_par IS NULL
        `;

        db.query(queryAnuidades, [usuario.cod_soc], (err, parcelaResults) => {
            if (err) {
                console.error('Erro na consulta de anuidades:', err);
                return res.status(500).json({ error: 'Erro ao consultar anuidades' });
            }

            if (parcelaResults.length === 0) {
                return res.json({ nome: usuario.nome_soc, mensagem: 'Não há anuidades pendentes.' });
            }

            const anosPendentes = parcelaResults.map(row => row.anovigencia_par);

            let mensagemAnos;
            if (anosPendentes.length === 1) {
                mensagemAnos = `Foi localizado que o ano ${anosPendentes[0]} está em pendência.`;
            } else {
                mensagemAnos = `Foi localizado que os seguintes anos estão em pendência:\n${anosPendentes.join("\n")}`;
            }

            return res.json({
                nome: usuario.nome_soc,
                anosPendentes: anosPendentes,
                mensagem: mensagemAnos + '\n' + "Por favor, entre em contato com a Abralin por email."
            });
        });
    });
};