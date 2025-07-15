const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getConnection = require("../model/connection");
const router = express.Router();
const config = require('../config/config.js');
const auth = require('../auth/auth.js');

//cadastro
router.post('/cadastro', async function (req, res) {
    const email = req.body.email;
    const senha = req.body.senha;
    const senhaRepetida = req.body.senhaRepetida;
    const senha_hash = await bcrypt.hash(senha, 10);
    const connection = await getConnection();

    const usuarioEmail = await connection.query('SELECT email FROM usuario WHERE email = ?;', [email]);
    if (usuarioEmail[0].length > 0)
        return res.status(400).json({ message: 'Já existe um usuário registrado com este e-mail.' })

    if (!verificaEmailValido(email))
        return res.status(400).json({ message: 'Email inválido.' });

    if (!verificaSenhaValida(senha)) {
        return res
            .status(400)
            .json({ message: 'Senha inválida. Deve conter ao menos 8 caracteres alfanuméricos.' });
    }

    if (senha !== senhaRepetida)
        return res.status(400).json({ message: 'As senhas não coincidem.' });

    try {
        await connection.query(
            `
                INSERT INTO usuario (email, senha, tipoUsuario)
                VALUES (?, ?, ?);
            `,
            [email, senha_hash, 1],
        );
        res.json({ message: 'O usuário foi registrado.' });
        connection.release();
    } catch (err) {
        connection.release();
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor ao criar conta' });
    }
});

//Login
router.post('/login', async function (req, res) {
    console.log('Body:', req.body);
    const email = req.body.email;
    const senha = req.body.senha;

    if (!verificaEmailValido(email)) {
        return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    try {
        const connection = await getConnection();

        let usuario = await connection.query(
            `SELECT usuario.idUsuario, usuario.email, senha
            FROM usuario
            WHERE usuario.email = ?;`,
            [email],
        );
        usuario = usuario[0][0];
        if (!usuario)
            return res.status(400).json({message: 'Email ou senha incorretos.'});
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta)
            return res.status(400).json({ message: 'Email ou senha incorretos.'});

        const token = jwt.sign(
            { userId: usuario.idUsuario, email: usuario.email },
            config.auth.tokenKey,
            { expiresIn: '2h' },
        );
        connection.release();
        res.json({ message: 'Login bem sucedido', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor ao logar' });
    }
});


//Mudança de senha (quando Logado)
router.put('/editar-senha', async function (req, res) {
    var senhaAtual = req.body.senhaAtual;
    var novaSenha = req.body.novaSenha;

    // Verifica e decodifica o token
    const claims = auth.verifyToken(req, res);
    if (!claims || !claims.userId) {
        return res.status(401).json({ message: 'Token inválido ou ausente.' });
    }

    // Valida a nova senha
    if (!verificaSenhaValida(novaSenha)) {
        return res.status(400).json({
            message: 'Nova senha inválida. Deve conter ao menos 8 caracteres, letras e números.',
        });
    }

    try {
        const connection = await getConnection();

        const resultado = await connection.query(`SELECT senha FROM usuario WHERE idUsuario = ? LIMIT 1;`, 
            [claims.userId]);

        const usuario = resultado[0][0];
        if (!usuario) {
            await connection.release();
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const senhaConfere = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaConfere) {
            await connection.release();
            return res.status(400).json({ message: 'Senha atual incorreta.' });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        await connection.query(`UPDATE usuario SET senha = ? WHERE idUsuario = ?;`, [novaSenhaHash, claims.userId]);

        await connection.release();
        res.json({ message: 'Senha alterada.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor ao trocar senha.' });
    }
});

//sair conta

//deletar conta
router.delete("/", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ claims = c });
    //http.delete('http://localhost:3000/musicas/deletar-conta', dadosRequisicao);
    const claims = auth.verifyToken(req, res);
    console.log('claims:', claims.userId);

    if (!claims) {
        return res.status(401).json({ message: "Acesso não autorizado." });
    }

    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        // Apaga músicas das playlists do usuário
        await connection.query(`
            DELETE playlist_musica
            FROM playlist_musica
            INNER JOIN playlist ON playlist_musica.fk_playlist_idPlaylist = playlist.idPlaylist
            WHERE playlist.fk_usuario_idUsuario = ?
        `, 
        [claims.userId]);

        // Apaga playlists do usuário
        await connection.query(`
            DELETE FROM playlist USING playlist WHERE fk_usuario_idUsuario = ?
        `, [claims.userId]);

        // Apaga o próprio usuário
        await connection.query(`
            DELETE FROM usuario USING usuario WHERE idUsuario = ?
        `, [claims.userId]);

        await connection.commit();
        res.json({ message: "A conta foi removida com sucesso." });

    } catch (err) {
        await connection.rollback();
        console.error("Erro ao deletar conta:", err);
        res.status(500).json({ message: "Ocorreu um erro ao remover a conta." });

    } finally {
        connection.release();
    }
});



function verificaEmailValido(email) {
    if (!email) {
        return false;
    }

    return /^[A-Za-z0-9._%-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/.test(email);
}

function verificaSenhaValida(senha) {
    if (!senha) {
        return false;
    }

    if (senha.length < 8) {
        return false;
    }

    return /.*[a-zA-Z].*$/.test(senha) && /.*[0-9].*$/.test(senha);
}

module.exports = router;
