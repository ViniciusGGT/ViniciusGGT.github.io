CREATE TABLE album (
  idAlbum int NOT NULL AUTO_INCREMENT,
  nome varchar(100)  NOT NULL,
  CONSTRAINT album_pk PRIMARY KEY (idAlbum)
);
-- Table: album_musica
CREATE TABLE album_musica (
  fk_album_idAlbum int  NOT NULL,
  fk_musica_idMusica int  NOT NULL,
  CONSTRAINT album_musica_pk PRIMARY KEY (fk_album_idAlbum,fk_musica_idMusica)
);
-- Table: artista
CREATE TABLE artista (
  idArtista int  NOT NULL AUTO_INCREMENT,
  nome varchar(100)  NOT NULL,
  CONSTRAINT artista_pk PRIMARY KEY (idArtista)
);
-- Table: genero
CREATE TABLE genero (
  idGenero int NOT NULL AUTO_INCREMENT,
  nome varchar(25)  NOT NULL,
  CONSTRAINT genero_pk PRIMARY KEY (idGenero)
);
-- Table: genero_musica
CREATE TABLE genero_musica (
  fk_genero_idGenero int  NOT NULL,
  fk_musica_idMusica int  NOT NULL,
  CONSTRAINT genero_musica_pk PRIMARY KEY (fk_genero_idGenero,fk_musica_idMusica)
);
-- Table: musica
CREATE TABLE musica (
  idMusica int  NOT NULL AUTO_INCREMENT,
  duracao int  NOT NULL,
  titulo varchar(100)  NOT NULL,
  ano int  NULL,
  CONSTRAINT musica_pk PRIMARY KEY (idMusica)
);
-- Table: musica_artista
CREATE TABLE musica_artista (
  fk_musica_idMusica int  NOT NULL,
  fk_artista_idArtista int  NOT NULL,
  CONSTRAINT musica_artista_pk PRIMARY KEY (fk_musica_idMusica,fk_artista_idArtista)
);
-- Table: playlist
CREATE TABLE playlist (
  idPlaylist int  NOT NULL AUTO_INCREMENT,
  nome varchar(100)  NOT NULL,
  fk_usuario_idUsuario int  NOT NULL,
  CONSTRAINT playlist_pk PRIMARY KEY (idPlaylist)
);
-- Table: playlist_musica
CREATE TABLE playlist_musica (
  fk_playlist_idPlaylist int  NOT NULL,
  fk_musica_idMusica int  NOT NULL,
  CONSTRAINT playlist_musica_pk PRIMARY KEY (fk_playlist_idPlaylist,fk_musica_idMusica)
);
-- Table: usuario
CREATE TABLE usuario (
  idUsuario int  NOT NULL AUTO_INCREMENT,
  email varchar(100)  NOT NULL,
  senha varchar(255)  NOT NULL,
  tipoUsuario int  NOT NULL,
  CONSTRAINT usuario_pk PRIMARY KEY (idUsuario)
);
CREATE TABLE sugestao_musica (
   idSugestao INT NOT NULL AUTO_INCREMENT,
   fk_usuario_idUsuario INT, -- Quem fez a sugestão
   titulo VARCHAR(100) NOT NULL,
   artista VARCHAR(200) NOT NULL,
   album VARCHAR(100) NOT NULL,
   genero VARCHAR(50),        -- Opcional
   ano INT,                   -- Opcional
   data_sugestao DATETIME DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT sugestao_musica_pk PRIMARY KEY (idSugestao),
   CONSTRAINT sugestao_musica_usuario FOREIGN KEY (fk_usuario_idUsuario)
       REFERENCES usuario(idUsuario)
);
CREATE TABLE correcao_musica (
   idCorrecao INT NOT NULL AUTO_INCREMENT,  -- Renomeado para evitar conflito
   fk_usuario_idUsuario INT,                -- Quem fez a correção
   fk_musica_idMusica INT,                  -- A música de que se pediu correção
   titulo VARCHAR(100) NOT NULL,
   artista VARCHAR(200) NOT NULL,
   album VARCHAR(100) NOT NULL,
   genero VARCHAR(50) NOT NULL,       
   ano INT NOT NULL,                  
   data_correcao DATETIME DEFAULT CURRENT_TIMESTAMP,
  
   CONSTRAINT correcao_musica_pk PRIMARY KEY (idCorrecao),  -- Nome de PK corrigido
  
   CONSTRAINT correcao_musica_usuario FOREIGN KEY (fk_usuario_idUsuario)
       REFERENCES usuario(idUsuario),
  
   CONSTRAINT correcao_musica_musica FOREIGN KEY (fk_musica_idMusica)
       REFERENCES musica(idMusica)
);
-- foreign keys
-- Reference: album_musica_album (table: album_musica)
ALTER TABLE album_musica ADD CONSTRAINT album_musica_album FOREIGN KEY album_musica_album (fk_album_idAlbum)
  REFERENCES album (idAlbum);
-- Reference: album_musica_musica (table: album_musica)
ALTER TABLE album_musica ADD CONSTRAINT album_musica_musica FOREIGN KEY album_musica_musica (fk_musica_idMusica)
  REFERENCES musica (idMusica);
-- Reference: genero_musica_genero (table: genero_musica)
ALTER TABLE genero_musica ADD CONSTRAINT genero_musica_genero FOREIGN KEY genero_musica_genero (fk_genero_idGenero)
  REFERENCES genero (idGenero);
-- Reference: genero_musica_musica (table: genero_musica)
ALTER TABLE genero_musica ADD CONSTRAINT genero_musica_musica FOREIGN KEY genero_musica_musica (fk_musica_idMusica)
  REFERENCES musica (idMusica);
-- Reference: musica_artista_artista (table: musica_artista)
ALTER TABLE musica_artista ADD CONSTRAINT musica_artista_artista FOREIGN KEY musica_artista_artista (fk_artista_idArtista)
  REFERENCES artista (idArtista);
-- Reference: musica_artista_musica (table: musica_artista)
ALTER TABLE musica_artista ADD CONSTRAINT musica_artista_musica FOREIGN KEY musica_artista_musica (fk_musica_idMusica)
  REFERENCES musica (idMusica);
-- Reference: playlist_musica_musica (table: playlist_musica)
ALTER TABLE playlist_musica ADD CONSTRAINT playlist_musica_musica FOREIGN KEY playlist_musica_musica (fk_musica_idMusica)
  REFERENCES musica (idMusica);
-- Reference: playlist_musica_playlist (table: playlist_musica)
ALTER TABLE playlist_musica ADD CONSTRAINT playlist_musica_playlist FOREIGN KEY playlist_musica_playlist (fk_playlist_idPlaylist)
  REFERENCES playlist (idPlaylist);
-- Reference: playlist_usuario (table: playlist)
ALTER TABLE playlist ADD CONSTRAINT playlist_usuario FOREIGN KEY playlist_usuario (fk_usuario_idUsuario)
  REFERENCES usuario (idUsuario);
-- Índice para o título da música
CREATE INDEX idx_musica_titulo
ON musica (titulo);
-- Índice para o nome do álbum
CREATE INDEX idx_album_nome
ON album (nome);
-- Índice para o nome do gênero
CREATE INDEX idx_genero_nome
ON genero (nome);
