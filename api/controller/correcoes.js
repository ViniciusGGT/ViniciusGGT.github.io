const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getConnection = require("../model/connection");
const router = express.Router();
const config = require('../config/config.js');
const auth = require('../auth/auth.js');

//pedir correção 
router.post("/", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ titulo = t, artista = ar, album = al, genero = g, ano = a, idMusica = idM, idUsuario = idU });
    //http.post('http://localhost:3000/musicas/correcao-musica', dadosRequisicao);

    const titulo = req.body.titulo;
    const artista = req.body.artista;
    const album = req.body.album;
    const genero = req.body.genero;
    const ano = parseInt(req.body.ano);
    const idMusica = req.body.idMusica;
    
    const claims = auth.verifyToken(req, res);
    if (!claims) //usuario não se cadastrou
        return res.status(401).json({ message: "Cadastre-se para poder solicitar correções." });

    // Validações básicas
    if (!titulo?.trim())
        return res.status(400).json({ message: "Não foi fornecido o título da música." });
    if (!artista?.trim())
        return res.status(400).json({ message: "Não foi fornecido pelo menos um artista." });
    if (!album?.trim())
        return res.status(400).json({ message: "Não foi fornecido o nome do álbum." });
    if (!genero?.trim())
        return res.status(400).json({ message: "Não foi fornecido o gênero da música." });
    if (!ano || isNaN(ano))
        return res.status(400).json({ message: "Não foi fornecido um ano válido." });
    if (!idMusica || isNaN(idMusica))
        return res.status(400).json({ message: "Música inválida para correção." });

    const connection = await getConnection();
    try {
        await connection.query(
            `
            INSERT INTO correcao_musica 
            (titulo, artista, album, genero, ano, fk_usuario_idUsuario, fk_musica_idMusica)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [titulo, artista, album, genero, ano, claims.userId, idMusica]
        );

        res.json({ message: "Correção registrada com sucesso." });
    } catch (err) {
        console.error("Erro ao registrar correção:", err);
        res.status(500).json({ message: "Erro no servidor ao registrar a correção." });
    } finally {
        await connection.release();
    }
});

//entrar correção
router.get("/", async function (req, res) {
    //
    //http.post('http://localhost:3000/musicas/entrar-correcao');

    const connection = await getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT idCorrecao, titulo, artista FROM correcao_musica
            ORDER BY data_correcao DESC
        `);

        res.status(200).json(rows);
    } catch (err) {
        console.error("Erro ao acessar correções:", err);
        res.status(500).json({ message: "Erro ao acessar as correções de música." });
    } finally {
        if (connection) connection.release();
    }
});

//expandir correção
router.get("/expandir", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idMusica = idM });
    //http.get('http://localhost:3000/musicas/expandir-musica', dadosRequisicao);

    const idCorrecao = req.query.idCorrecao; // Vindo pela URL, ex: /expandir-musica?idMusica=1

    if (!idCorrecao) {
        return res.status(400).json({ message: "O ID da correção não foi fornecido." });
    }

    const connection = await getConnection();
    try {
        const [resultados] = await connection.query(
            `
            SELECT titulo, artista, album, ano, genero FROM correcao_musica
            WHERE (idCorrecao = ?);
            `,
            [idCorrecao]
        );

        await connection.release();

        if (resultados.length === 0) {
            return res.status(404).json({ message: "Sugestão não encontrada." });
        }

        res.json(resultados[0]);
    } catch (err) {
        await connection.release();
        console.error("Erro ao expandir sugestão:", err);
        res.status(500).json({ message: "Erro interno ao expandir a sugestão." });
    }
});

//filtro/subfiltro correção /*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/
/*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/

//aceitar correção (tira do BD correções e põe no BD do catálogo)
router.post("/aceitar", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idMusica = idM, titulo = t, idArtista = idAr, artista = ar, idAlbum = idAl, album = al, idGenero = idG, genero = g, ano = a, duracao = d, idCorrecao = idC });
    //http.post('http://localhost:3000/musicas/aceitar-correcao', dadosRequisicao);

    const idMusica = req.body.idMusica;
    const titulo = req.body.titulo;
    const ano = parseInt(req.body.ano);

    const idArtista = req.body.idArtista;
    const artista = req.body.artista;

    const idAlbum = req.body.idAlbum;
    const album = req.body.album;

    const idGenero = req.body.idGenero;
    const genero = req.body.genero;

    const idCorrecao = req.body.idCorrecao; //usado para facilitar na deleção

    if (!titulo || titulo.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o título da música." });
    if (!ano || genero.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o ano da música." });   

    if (!artista || artista.trim() === "")
        return res
            .status(400)
            .json({ message: "Não foi fornecido pelo menos um artista da música" });
    if (!album || album.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o álbum da música." });

    if (!genero || genero.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o gênero da música." });

     const connection = await getConnection();

    try {
        await connection.beginTransaction();

        // Atualizar dados
        await connection.query(
            `UPDATE musica SET titulo = ?, ano = ? WHERE idMusica = ?`,
            [titulo, ano, idMusica]
        );

        await connection.query(
            `UPDATE artista SET nome = ? WHERE idArtista = ?`,
            [artista, idArtista]
        );

        await connection.query(
            `UPDATE album SET nome = ? WHERE idAlbum = ?`,
            [album, idAlbum]
        );

        await connection.query(
            `UPDATE genero SET nome = ? WHERE idGenero = ?`,
            [genero, idGenero]
        );

        // Remover sugestão de correção
        await connection.query(
            `DELETE FROM correcao_musica WHERE idCorrecao = ?`,
            [idCorrecao]
        );

        await connection.commit();
        res.status(200).json({ message: "Correção registrada com sucesso." });
    } catch (err) {
        await connection.rollback();
        console.error("Erro ao aceitar correção:", err);
        res.status(500).json({ message: "Erro no servidor ao registrar a correção." });
    } finally {
        connection.release();
    }
});

//remover correção (tira do BD correções)
router.delete("/", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idCorrecao = idC });
    //http.delete('http://localhost:3000/musicas/remover-correcao', dadosRequisicao);
    
    const idCorrecao = req.body.idCorrecao; //usado para facilitar na deleção    

    const connection = await getConnection();
    try {
        const [result] = await connection.query(
            `DELETE FROM correcao_musica WHERE idCorrecao = ?`,
            [idCorrecao]
        );

        await connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Correção não encontrada." });
        }

        res.json({ message: "Correção deletada com sucesso." });
    } catch (err) {
        await connection.release();
        console.error("Erro ao deletar correção:", err);
        res.status(500).json({ message: "Erro no servidor ao deletar a correção." });
    }
});

//editar correção 
router.put("/editar", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ titulo = t, artista = ar, album = al, genero = g, ano = a, idCorrecao = idC });
    //http.delete('http://localhost:3000/musicas/editar-correcao', dadosRequisicao);
    const titulo = req.body.titulo;
    const artista = req.body.artista;
    const album = req.body.album;
    const genero = req.body.genero;
    const ano = parseInt(req.body.ano);
    const idCorrecao = req.body.idCorrecao; //usado para facilitar na deleção

    if (!titulo || titulo.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o título da música." });
    if (!artista || artista.trim() === "")
        return res
            .status(400)
            .json({ message: "Não foi fornecido pelo menos um artista da música" });
    if (!album || album.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o álbum da música." });

    if (!genero || genero.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o gênero da música." });

    if (!ano || genero.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o ano da música." });   

     const connection = await getConnection();
    try {
        const [result] = await connection.query(
            `
            UPDATE correcao_musica 
            SET titulo = ?, artista = ?, album = ?, genero = ?, ano = ?
            WHERE idCorrecao = ?;
            `,
            [titulo, artista, album, genero, ano, idCorrecao]
        );

        await connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Correção não encontrada para edição." });
        }

        res.json({ message: "Correção editada com sucesso." });
    } catch (err) {
        await connection.release();
        console.error("Erro ao editar correção:", err);
        res.status(500).json({ message: "Erro no servidor ao editar a correção." });
    }
});

module.exports = router;
