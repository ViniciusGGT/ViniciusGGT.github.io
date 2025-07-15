const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getConnection = require("../model/connection");
const router = express.Router();
const config = require('../config/config.js');
const auth = require('../auth/auth.js');


// Listar playlists do usuário
router.get("/", async function (req, res) {
  const claims = auth.verifyToken(req, res);
  if (!claims) {
        return res.status(401).json({ message: "Usuário inválido." });
    }

  const connection = await getConnection();

  try {
    const query = `
      SELECT
        p.idPlaylist,
        p.nome AS nomePlaylist,
        COUNT(pm.fk_musica_idMusica) AS quantidadeMusicas
      FROM playlist p
      LEFT JOIN playlist_musica pm ON p.idPlaylist = pm.fk_playlist_idPlaylist
      WHERE p.fk_usuario_idUsuario = ?
      GROUP BY p.idPlaylist, p.nome
      ORDER BY p.nome ASC
    `;

    const [rows] = await connection.query(query, [claims.userId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Erro ao acessar playlists:", err);
    res.status(500).json({ message: "Erro ao acessar as playlists." });
  } finally {
    if (connection) connection.release();
  }
});

//criar playlist
router.post("/", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ nome = n, idUsuario = idU });
    //http.post('http://localhost:3000/musicas/criar-playlist', dadosRequisicao);

    const nome = req.body.nome;
    const claims = auth.verifyToken(req, res);

    if (!nome || nome.trim() === "") {
        return res.status(400).json({ message: "Não foi fornecido o nome da playlist." });
    }

    if (!claims) {
        return res.status(401).json({ message: "Usuário inválido." });
    }

    const connection = await getConnection();
    try {
        await connection.query(
            `
            INSERT INTO playlist (nome, fk_usuario_idUsuario)
            VALUES (?, ?)
            `,
            [nome.trim(), claims.userId]
        );

        res.json({ message: "Playlist criada com sucesso." });
    } catch (err) {
        console.error("Erro ao criar playlist:", err);
        res.status(500).json({ message: "Erro no servidor ao criar a playlist." });
    } finally {
        await connection.release();
    }
});

//adentrar playlist NÃO SEI SE O QUERY ESTÁ CERTO
router.get("/adentrar", async function (req, res) {
    const idPlaylist = req.query.idPlaylist; // Correct for GET

    if (!idPlaylist || isNaN(idPlaylist)) {
        return res.status(400).json({ message: "ID da playlist inválido." });
    }

    const connection = await getConnection();
    try {
        const [musicas] = await connection.query(
            `
            SELECT
                m.idMusica AS idMusica,
                m.titulo AS titulo_musica,
                GROUP_CONCAT(DISTINCT a.nome ORDER BY a.nome SEPARATOR ', ') AS artistas,
                m.duracao
            FROM playlist p
            INNER JOIN playlist_musica pm ON p.idPlaylist = pm.fk_playlist_idPlaylist
            INNER JOIN musica m ON m.idMusica = pm.fk_musica_idMusica
            LEFT JOIN musica_artista ma ON m.idMusica = ma.fk_musica_idMusica
            LEFT JOIN artista a ON a.idArtista = ma.fk_artista_idArtista
            WHERE p.idPlaylist = ?
            GROUP BY m.idMusica, m.titulo, m.duracao
            `,
            [idPlaylist]
        );

        res.json(musicas);
    } catch (err) {
        console.error("Erro ao acessar playlist:", err);
        res.status(500).json({ message: "Ocorreu um erro no servidor ao acessar a playlist." });
    } finally {
        await connection.release();
    }
});



//filtro/subfiltro playlist /*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/
/*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/

//renomear playlist
router.put("/renomear", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ nome = n, idPlaylist = idP });
    //http.post('http://localhost:3000/musicas/renomear-playlist', dadosRequisicao);

    const nome = req.body.nome;
    const idPlaylist = req.body.idPlaylist;

    if (!nome || nome.trim() === "") {
        return res.status(400).json({ message: "O novo nome da playlist não foi fornecido." });
    }

    if (!idPlaylist || isNaN(idPlaylist)) {
        return res.status(400).json({ message: "ID da playlist inválido." });
    }

    const connection = await getConnection();
    try {
        const [resultado] = await connection.query(
            `
            UPDATE playlist
            SET nome = ?
            WHERE idPlaylist = ?
            `,
            [nome.trim(), idPlaylist]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: "Playlist não encontrada." });
        }

        res.json({ message: "Playlist renomeada com sucesso." });
    } catch (err) {
        console.error("Erro ao renomear playlist:", err);
        res.status(500).json({ message: "Erro no servidor ao renomear a playlist." });
    } finally {
        await connection.release();
    }
});


//remover playlist
router.delete("/", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idPlaylist = idP });
    //http.delete('http://localhost:3000/musicas/remover-playlist', dadosRequisicao);

    const idPlaylist = req.body.idPlaylist;


    if (!idPlaylist || isNaN(idPlaylist)) {
        return res.status(400).json({ message: "ID da playlist inválido." });
    }

    const connection = await getConnection();
    try {
        await connection.beginTransaction();

        // Primeiro remove as músicas da playlist
        await connection.query(
            `DELETE FROM playlist_musica WHERE fk_playlist_idPlaylist = ?`,
            [idPlaylist]
        );

        // Depois remove a própria playlist
        const [resultado] = await connection.query(
            `DELETE FROM playlist WHERE idPlaylist = ?`,
            [idPlaylist]
        );

        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Playlist não encontrada." });
        }

        await connection.commit();
        res.json({ message: "A playlist foi removida com sucesso." });
    } catch (err) {
        await connection.rollback();
        console.error("Erro ao remover playlist:", err);
        res.status(500).json({ message: "Erro no servidor ao remover a playlist." });
    } finally {
        await connection.release();
    }
});


//inserir música na playlist
router.post("/musica", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idMusica = idM, idPlaylist = idP });
    //http.post('http://localhost:3000/musicas/inserir-musica-playlist', dadosRequisicao);

    const idMusica = req.body.idMusica; //idMusica é capturado quando o usuário clica na música desejada
    const idPlaylist = req.body.idPlaylist; //idUsuario é capturado quando você clica no botão "solicitar correção dessa música"


    const connection = await getConnection();

    try {
        await connection.query(
            `INSERT INTO playlist_musica (fk_playlist_idPlaylist, fk_musica_idMusica) VALUES (?, ?)`,
            [idPlaylist, idMusica]
        );

        res.status(201).json({ message: "A música foi adicionada à playlist com sucesso." });
    } catch (err) {
        // Verifica se o erro foi causado por chave primária duplicada
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ message: "Essa música já está na playlist." });
        } else {
            console.error("Erro ao inserir música na playlist:", err);
            res.status(500).json({ message: "Erro interno do servidor ao adicionar a música na playlist." });
        }
    } finally {
        if (connection) connection.release();
    }
});

//deletar música da playlist
router.delete("/musica", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idMusica = idM, idPlaylist = idP });
    //http.delete('http://localhost:3000/musicas/deletar-musica-playlist', dadosRequisicao);
    const idMusica = req.body.idMusica; //idMusica é capturado quando o usuário clica na música desejada
    const idPlaylist = req.body.idPlaylist; //idUsuario é capturado quando você clica no botão "solicitar correção dessa música"


     const connection = await getConnection();

    try {
        const [result] = await connection.query(
            `DELETE FROM playlist_musica WHERE fk_playlist_idPlaylist = ? AND fk_musica_idMusica = ?`,
            [idPlaylist, idMusica]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Música não encontrada na playlist." });
        }

        res.status(200).json({ message: "A música foi removida da playlist com sucesso." });
    } catch (err) {
        console.error("Erro ao deletar música da playlist:", err);
        res.status(500).json({ message: "Erro interno do servidor ao remover a música da playlist." });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
