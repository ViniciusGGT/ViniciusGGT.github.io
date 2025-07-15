import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    // Concorrência baixa/inicial
    { duration: '45s', target: 10 },
    { duration: '30s', target: 25 },

    // Concorrência Média/realista
    { duration: '45s', target: 35 },
    { duration: '30s', target: 50 },

    // Concorrência Alta/de estresse
    { duration: '1m', target: 74 },
    { duration: '1m', target: 100 },

    // Concorrência Descendente/final
    { duration: '45s', target: 75 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 0 }
  ]
};


export default function () { //digite no terminal para rodar e cique no link que o terminal gerará para ver os gráficos em tempo real (só funciona enquanto o terminal estiver rodando). Garanta que não haja nenhum outro link aberto antes de rodar: $env:K6_WEB_DASHBOARD="true"; k6 run tests/teste1.js -o cloud
  http.post('http://localhost:3000/musicas?sort=titulo,genero&genero=rock,mpb');
  sleep(1);
}
