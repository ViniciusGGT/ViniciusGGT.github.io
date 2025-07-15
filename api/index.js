const express = require('express');
const app = express();

var cors = require('cors')
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const contas = require('./controller/contas.js');
app.use('/contas', contas);

const musicas = require('./controller/musicas.js')
app.use('/musicas', musicas);

const playlists = require('./controller/playlists.js')
app.use('/playlists', playlists);

const sugestoes = require('./controller/sugestoes.js')
app.use('/sugestoes', sugestoes);

const correcoes = require('./controller/correcoes.js')
app.use('/correcoes', correcoes);



app.listen(3000);


