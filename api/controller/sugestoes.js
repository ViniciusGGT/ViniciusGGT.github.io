const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getConnection = require("../model/connection");
const router = express.Router();
const config = require('../config/config.js');
const auth = require('../auth/auth.js');

//pedir sugestão
router.post("/", async function (req, res) {

    const titulo = req.body.titulo;
    const artista = req.body.artista;
    const album = req.body.album;
    const genero = req.body.genero || null;
    const ano = parseInt(req.body.ano) || null;
    
    const claims = auth.verifyToken(req, res);

    if (!claims) //usuario não se cadastrou
        return res.status(401).json({ message: "Cadastre-se para poder fazer sugestões." });

    if (!titulo || titulo.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o título da música." });
    if (!artista || artista.trim() === "")
        return res
            .status(400)
            .json({ message: "Não foi fornecido pelo menos um artista da música" });
    if (!album || album.trim() === "")
        return res.status(400).json({ message: "Não foi fornecido o álbum da música." });
    

    

    const connection = await getConnection();
    try {
        //desfixei o id do usuario
        await connection.query(
            `
            INSERT INTO sugestao_musica(titulo, artista, album, genero, ano, fk_usuario_idUsuario) VALUES (?, ?, ?, ?, ?, ?)
            `,
            [titulo, artista, album, genero, ano, claims.userId],
        );

        await connection.release();
        res.json({ message: "Sugestão registrada com sucesso." });
    } catch (err) {
        await connection.release();
        console.log(err);
        res.status(500).json({ message: "Ocorreu um erro no servidor ao registrar a sugestão." });
    }
});

//entrar sugestão
router.get("/", async function (req, res) {
    //
    //http.post('http://localhost:3000/musicas/entrar-sugestao');

    const connection = await getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT idSugestao, titulo, artista FROM sugestao_musica
            ORDER BY data_sugestao DESC
        `);

        res.status(200).json(rows);
    } catch (err) {
        console.error("Erro ao acessar sugestões:", err);
        res.status(500).json({ message: "Erro ao acessar as sugestões de música." });
    } finally {
        if (connection) connection.release();
    }
});

//expandir sugestão
router.get("/expandir", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idMusica = idM });
    //http.get('http://localhost:3000/musicas/expandir-musica', dadosRequisicao);

    const idSugestao = req.query.idSugestao; // Vindo pela URL, ex: /expandir-musica?idMusica=1

    if (!idSugestao) {
        return res.status(400).json({ message: "O ID da sugestão não foi fornecido." });
    }

    const connection = await getConnection();
    try {
        const [resultados] = await connection.query(
            `
            SELECT titulo, artista, album, ano, genero FROM sugestao_musica
            WHERE (idSugestao = ?);
            `,
            [idSugestao],
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

//filtro/subfiltro sugestão /*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/
/*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/

//aceitar sugestão (tira do BD sugestões e põe no BD do catálogo)
router.post("/aceitar", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ titulo = t, artista = ar, album = al, genero = g, ano = a, duracao = d, idSugestao = idS });
    //http.post('http://localhost:3000/musicas/aceitar-sugestao', dadosRequisicao);
    const titulo = req.body.titulo;
    const artista = req.body.artista;
    const album = req.body.album;
    const genero = req.body.genero;
    const ano = parseInt(req.body.ano);
    const duracao = req.body.duracao; //duracao é um dado normalmente obtido por um método que recebe um MP3 como parâmetro e retorna sua duração, os demais atributos são obtidos por formulário
    const idSugestao = req.body.idSugestao; //usado para facilitar na deleção

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

    if (!duracao || duracao === -1) //(duracao === -1) => método que fornece a duração fracassou
        return res.status(400).json({ message: "Não foi fornecida a duração da música." });
    

    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        // 1. Inserir música
        const [musicaResult] = await connection.query(
            `INSERT INTO musica (duracao, titulo, ano) VALUES (?, ?, ?)`,
            [duracao, titulo, ano]
        );
        const idMusica = musicaResult.insertId;

        // 2. Inserir artista
        const [artistaResult] = await connection.query(
            `INSERT INTO artista (nome) VALUES (?)`,
            [artista]
        );
        const idArtista = artistaResult.insertId;

        // 3. Inserir álbum
        const [albumResult] = await connection.query(
            `INSERT INTO album (nome) VALUES (?)`,
            [album]
        );
        const idAlbum = albumResult.insertId;

        // 4. Inserir gênero
        const [generoResult] = await connection.query(
            `INSERT INTO genero (nome) VALUES (?)`,
            [genero]
        );
        const idGenero = generoResult.insertId;

        // 5. Relacionamentos
        await connection.query(
            `INSERT INTO album_musica (fk_album_idAlbum, fk_musica_idMusica) VALUES (?, ?)`,
            [idAlbum, idMusica]
        );

        await connection.query(
            `INSERT INTO musica_artista (fk_musica_idMusica, fk_artista_idArtista) VALUES (?, ?)`,
            [idMusica, idArtista]
        );

        await connection.query(
            `INSERT INTO genero_musica (fk_genero_idGenero, fk_musica_idMusica) VALUES (?, ?)`,
            [idGenero, idMusica]
        );

        // 6. Deletar sugestão
        await connection.query(
            `DELETE FROM sugestao_musica WHERE idSugestao = ?`,
            [idSugestao]
        );

        await connection.commit();
        res.status(200).json({ message: "Sugestão registrada com sucesso." });
    } catch (err) {
        await connection.rollback();
        console.error("Erro ao aceitar sugestão:", err);
        res.status(500).json({ message: "Erro no servidor ao registrar a sugestão." });
    } finally {
        if (connection) connection.release();
    }
});



//remover sugestão (tira do BD sugestões)
router.delete("/", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idSugestao = idS });
    //http.delete('http://localhost:3000/musicas/remover-sugestao', dadosRequisicao);
    const idSugestao = req.body.idSugestao; //usado para facilitar na deleção    

    const connection = await getConnection();
    try {
        const [result] = await connection.query(
            `DELETE FROM sugestao_musica WHERE idSugestao = ?`,
            [idSugestao]
        );

        await connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Sugestão não encontrada." });
        }

        res.json({ message: "Sugestão deletada com sucesso." });
    } catch (err) {
        await connection.release();
        console.error("Erro ao deletar sugestão:", err);
        res.status(500).json({ message: "Erro no servidor ao deletar a sugestão." });
    }
});

//editar sugestão 
router.put("/editar", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ titulo = t, artista = ar, album = al, genero = g, ano = a, idSugestao = idS });
    //http.delete('http://localhost:3000/musicas/editar-sugestao', dadosRequisicao);

    const titulo = req.body.titulo;
    const artista = req.body.artista;
    const album = req.body.album;
    const genero = req.body.genero;
    const ano = parseInt(req.body.ano);
    const idSugestao = req.body.idSugestao; //usado para facilitar na deleção

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
            UPDATE sugestao_musica 
            SET titulo = ?, artista = ?, album = ?, genero = ?, ano = ?
            WHERE idSugestao = ?;
            `,
            [titulo, artista, album, genero, ano, idSugestao]
        );

        await connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Sugestão não encontrada para edição." });
        }

        res.json({ message: "Sugestão editada com sucesso." });
    } catch (err) {
        await connection.release();
        console.error("Erro ao editar sugestão:", err);
        res.status(500).json({ message: "Erro no servidor ao editar a sugestão." });
    }
});

module.exports = router;
