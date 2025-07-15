# Catálogo de Músicas

Para rodar a aplicação, é necessário instalar o Node.js.


## Relatório dos testes de carga

#### Documento com relatório
```sh
https://docs.google.com/document/d/1x3SK8t1UJyrLFR6HRwfe4gXVqo8l-RqKdgWZSEag6MU/edit?tab=t.0
```

#### Ferramenta utilizada
```sh
https://github.com/grafana/k6-studio/releases
```

## Como rodar o back-end da aplicação
### Pré-requisitos
[Node.JS](https://nodejs.org/en) e [MySQL](https://dev.mysql.com/downloads/mysql/)
### IDE Recomendada
[VSCode](https://code.visualstudio.com/)
### Passos
#### 1. Clonar o repositório
#### 2. Criar um banco de dados MySQL seguindo as configurações especificadas no arquivo **config.js**, localizada em:
```sh
catalogo-musicas/api/config/config.js
```
#### 3. Rodar os seguintes scripts sql no banco recém criado:
```sh
catalogo-musicas/sql/criacao_tabelas.sql #Criar as tabelas
catalogo-musicas/sql/carga_inicial.sql #Inserções
```
#### 4. Abrir um terminal **dentro da pasta 'api'**, localizada em catalogo-musicas/api, e rodar os seguintes comandos:
```sh
#Instalar as dependências utilizadas no back-end
npm install
```

```sh
#Executar o servidor
npx nodemon
```

