import http from 'k6/http';
import { sleep } from 'k6';

function gerarStringNumericaAleatoria() { //método de tempo de execução baixíssima que portanto não afeta os testes de carga. Usado para gerar cada dado dummy de uma requisiçãotestada
  const numeros = '0123456789';
  let resultado = '';
  for (let i = 0; i < 5; i++) {
    const indice = Math.floor(Math.random() * numeros.length);
    resultado += numeros.charAt(indice);
  }
  return resultado;
}

export let options = {
  stages: [
    // Concorrência baixa/inicial
    { duration: '45s', target: 10 },
    { duration: '30s', target: 25 },

    // Concorrência Média/realista
    { duration: '45s', target: 35 },
    { duration: '30s', target: 50 },

    // Concorrência Alta/de estresse
    { duration: '1m', target: 75 },
    { duration: '1m', target: 100 },

    // Concorrência Descendente/final
    { duration: '45s', target: 75 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 0 }
  ]
};

export default function () { //digite no terminal para rodar e cique no link que o terminal gerará para ver os gráficos em tempo real (só funciona enquanto o terminal estiver rodando). Garanta que não haja nenhum outro link aberto antes de rodar: $env:K6_WEB_DASHBOARD="true"; k6 run tests/teste2.js -o cloud
  const dadosSugestao = JSON.stringify({
    titulo: gerarStringNumericaAleatoria(),
    artista: gerarStringNumericaAleatoria(),
    album: gerarStringNumericaAleatoria(),
    genero: gerarStringNumericaAleatoria(),
    ano: parseInt(gerarStringNumericaAleatoria())
  });

  http.post('http://localhost:3000/musicas/sugestao-musica', dadosSugestao);
  sleep(1);
}
