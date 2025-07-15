const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getConnection = require("../model/connection");
const router = express.Router();
const config = require('../config/config.js');
const auth = require('../auth/auth.js');

//ouvir música /*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/
/*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/
//pausar música /*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/
/*NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN*/

//expandir música catálogo
router.get("/expandir", async function (req, res) {
    //const dadosRequisicao = JSON.stringify({ idMusica = idM });
    //http.get('http://localhost:3000/musicas/expandir-musica', dadosRequisicao);

    const idMusica = req.query.idMusica; // Vindo pela URL, ex: /expandir-musica?idMusica=1

    if (!idMusica) {
        return res.status(400).json({ message: "O ID da música não foi fornecido." });
    }

    const connection = await getConnection();
    try {
        const [resultados] = await connection.query(
            `
            SELECT
                m.titulo,
                GROUP_CONCAT(DISTINCT a.nome SEPARATOR ', ') AS artistas,
                GROUP_CONCAT(DISTINCT al.nome SEPARATOR ', ') AS albuns,
                m.ano,
                GROUP_CONCAT(DISTINCT g.nome SEPARATOR ', ') AS generos,
                m.duracao
            FROM musica m
            LEFT JOIN musica_artista ma ON m.idMusica = ma.fk_musica_idMusica
            LEFT JOIN artista a ON a.idArtista = ma.fk_artista_idArtista
            LEFT JOIN album_musica am ON m.idMusica = am.fk_musica_idMusica
            LEFT JOIN album al ON al.idAlbum = am.fk_album_idAlbum
            LEFT JOIN genero_musica gm ON m.idMusica = gm.fk_musica_idMusica
            LEFT JOIN genero g ON g.idGenero = gm.fk_genero_idGenero
            WHERE m.idMusica = ?
            GROUP BY m.idMusica, m.titulo, m.ano, m.duracao
            `,
            [idMusica]
        );

        await connection.release();

        if (resultados.length === 0) {
            return res.status(404).json({ message: "Música não encontrada." });
        }

        res.json(resultados[0]);
    } catch (err) {
        await connection.release();
        console.error("Erro ao expandir música:", err);
        res.status(500).json({ message: "Erro interno ao expandir a música." });
    }
});

//pegar todos os artistas
router.get("/artistas", async function (req, res) {
    const idMusica = req.query.idMusica; // Vindo pela URL, ex: /artistas?idMusica=1

    if (!idMusica) {
        return res.status(400).json({ message: "O ID da música não foi fornecido." });
    }

    const connection = await getConnection();
    try {
        const [resultados] = await connection.query(
            `
            SELECT a.nome AS artista_nome
            FROM artista a
            JOIN musica_artista ma ON ma.fk_artista_idArtista = a.idArtista
            WHERE ma.fk_musica_idMusica = ?;
            `,
            [idMusica]
        );

        await connection.release();

        if (resultados.length === 0) {
            return res.status(404).json({ message: "Música não encontrada ou sem artistas." });
        }

        const nomesArtistas = resultados.map(r => r.artista_nome);

        res.json({ artistaNome: nomesArtistas });
    } catch (err) {
        await connection.release();
        console.error("Erro ao obter nomes", err);
        res.status(500).json({ message: "Erro interno ao obter nomes." });
    }
});

//pegar todos os generos
router.get("/generos", async function (req, res) {
    const idMusica = req.query.idMusica; // Vindo pela URL, ex: /generos?idMusica=1

    if (!idMusica) {
        return res.status(400).json({ message: "O ID da música não foi fornecido." });
    }

    const connection = await getConnection();
    try {
        const [resultados] = await connection.query(
            `
            SELECT g.nome AS genero_nome
            FROM genero g
            JOIN genero_musica mg ON mg.fk_genero_idGenero = g.idGenero
            WHERE mg.fk_musica_idMusica = ?;
            `,
            [idMusica]
        );

        await connection.release();

        if (resultados.length === 0) {
            return res.status(404).json({ message: "Gêneros não encontrados para essa música." });
        }

        const nomesGeneros = resultados.map(r => r.genero_nome);

        res.json({ generoNome: nomesGeneros });
    } catch (err) {
        await connection.release();
        console.error("Erro ao obter gêneros", err);
        res.status(500).json({ message: "Erro interno ao obter gêneros." });
    }
});


//filtro-subfiltro
router.get('/', async (req, res) => {
  const genero = req.query.genero; // Ex: ?genero=Rock,Pop
  const sort = req.query.sort;     // Ex: ?sort=ano,titulo
  const connection = await getConnection();
  const generoList = genero ? genero.split(',').map(g => g.trim()) : [];
  const colunasPermitidas = ['titulo', 'ano', 'duracao', 'genero', 'artista', 'album'];
  const ordenacoes = sort
    ? sort.split(',').map(col => col.trim()).filter(col => colunasPermitidas.includes(col))
    : [];
  const placeholders = generoList.map(() => '?').join(',');

  try {
    let query = `
      SELECT m.idMusica, m.titulo AS titulo, m.ano, TIME_FORMAT(SEC_TO_TIME(m.duracao),'%i:%s') AS duracao, g.nome AS genero, a.nome AS artista, al.nome AS album FROM musica m
      JOIN genero_musica gm ON m.idMusica = gm.fk_musica_idMusica
      JOIN genero g ON gm.fk_genero_idGenero = g.idGenero
      JOIN musica_artista ma ON m.idMusica = ma.fk_musica_idMusica 
      JOIN artista a ON ma.fk_artista_idArtista = a.idArtista
      JOIN album_musica am ON m.idMusica = am.fk_musica_idMusica
      JOIN album al ON am.fk_album_idAlbum = al.idAlbum
    `;

    const conditions = [];
    const params = [];

    if (generoList.length > 0) {
      conditions.push(`g.nome IN (${placeholders})`);
      params.push(...generoList);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    if (ordenacoes.length > 0) {
      const colunasOrdenadas = ordenacoes.map(col => {
        if (col === 'genero') return 'g.nome';
        if (col === 'artista') return 'a.nome';
        if (col === 'album') return 'al.nome';
        return `m.${col}`;
      });
      query += ` ORDER BY ${colunasOrdenadas.join(', ')} ASC`;
    } else {
      query += ' ORDER BY m.titulo ASC';
    }

    const [rows] = await connection.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar músicas' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
