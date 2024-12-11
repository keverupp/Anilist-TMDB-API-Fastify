<p align="center">
  <img src="./assets/banner_readme.png" alt="Banner do Projeto">
</p>

Este projeto é uma API construída com **Fastify** que utiliza a API do AniList para buscar informações sobre animes, episódios e temporadas. Ele também utiliza **Knex.js** para gerenciar o banco de dados e **DeepL** para traduzir informações.

## **Índice**
1.  [Visão Geral](#visão-geral)
2.  [Tecnologias Usadas](#tecnologias-usadas)
3.  [Pré-requisitos](#pré-requisitos)
4.  [Instalação](#instalação)
5.  [Estrutura do Projeto](#estrutura-do-projeto)
6.  [Rotas](#rotas)
7.  [Banco de Dados](#banco-de-dados) *documentação do banco em construção*
8.  [Lógica no Front-end](#lógica-no-front-end)
9.  [Contribuindo](#contribuindo)
10. [Licença](#licença)

# To-Do List

- [x] **Rotas Inserção Títulos via API**
  - Implementar endpoints para inserir títulos utilizando a API.

- [x] **Rotas Inserção Animes (descrição, temporadas, etc.) via ID na API**
  - Implementar rotas para busca e inserção de detalhes de animes utilizando o ID fornecido pela API.

- [ ] **Permissões de Usuários e Middleware**
  - Criar middleware para controle de permissões.
  - Configurar diferentes níveis de acesso baseados em funções.

- [x] **Seeds para Permissões**
  - Adicionar seeds para popular o banco de dados com permissões padrão.

- [ ] **Rotas de Configuração de Preferências**
  - Criar endpoints para permitir que usuários personalizem suas preferências.

- [ ] **Rotas Editar Comentários**
  - Implementar funcionalidades para que usuários possam editar seus comentários.

- [ ] **Rota Listar Animes Seguidos**
  - Criar rota para listar todos os animes seguidos pelo usuário.

- [ ] **Rota Marcar Solicitação como Lida**
  - Permitir que administradores ou usuários responsáveis possam marcar solicitações como lidas.

- [ ] **Rota de Reportar (qualquer conteúdo)**
  - Implementar sistema de reporte para conteúdos inadequados ou suspeitos.

---

### Progresso Atual
- Itens concluídos: 2/8
- Itens pendentes: 6/8

---

## **Visão Geral**

Este projeto visa integrar informações da API AniList junto da API TMDB para construção de funcionalidades como:
- Busca de animes, episódios e temporadas.
- Armazenamento e gerenciamento de dados em um banco de dados relacional.

Este projeto tem como objetivo final ser uma plataforma completa para discussão sobre animes em Portugues(BR). (não havera como assistir, pelo menos ate o momento sem planos)

---

## **Tecnologias Usadas**

- **Fastify**: Framework web para Node.js utilizado para construção da API.
- **Knex.js**: Query builder para interagir com o banco de dados relacional.
- **PostgreSQL**: Banco de dados relacional usado para persistência de dados.
- **Axios**: Cliente HTTP usado para requisições, como à API AniList.
- **GraphQL Request**: Cliente leve para realizar requisições GraphQL.
- **Argon2**: Biblioteca para hashing de senhas.
- **jsonwebtoken**: Utilizado para autenticação baseada em tokens JWT.
- **dotenv**: Gerenciamento de variáveis de ambiente.
- **Nodemon**: Ferramenta para reiniciar automaticamente o servidor em desenvolvimento.
- **Node.js**: Ambiente de execução JavaScript.
- **pg**: Driver para conectar ao PostgreSQL.

--- 

## **Pré-requisitos**

Certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (v16 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (v12 ou superior)

Além disso, configure um arquivo `.env` seguindo o `.env.example`
---

## **Instalação**

1. Clone este repositório:
   ```bash
   git clone https://github.com/polixter/anilist-api-fastify.git
   cd anilist-api-fastify
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o banco de dados:
   - Crie o banco:
     ```bash
     createdb anilist_db
     ```
   - Execute as migrations:
     ```bash
     npx knex migrate:latest
     ```
   - Execute as seeds:
     ```bash
     npx knex seed:latest
     ```

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

---

## **Estrutura do Projeto**

```plaintext
├── knexfile.js          # Configurações do Knex
├── controllers/         # Controladores da API
├── middlewares/         # Middlewares da aplicação
├── migrations/          # Arquivos de migração do banco de dados
├── routes/              # Definição das rotas da API
├── services/            # Serviços auxiliares
├── package.json         # Dependências do projeto
├── README.md            # Documentação do projeto
└── .env                 # Configurações de ambiente
```

---

### **Rotas**

## Documentação de Rotas

A documentação detalhada das rotas foi movida para o [README de `routes`](./routes/README.md) para manter a organização do projeto. Acesse o link para conferir todas as informações sobre as rotas disponíveis.

---

## **Lógica no Front-end**

A lógica no front-end segue uma série de etapas. Antes de começar, é fundamental rodar as **migrations** e **seeds**, como descrito na seção de [instalação](#instalação).

### Etapas iniciais

1. **Popular animes iniciais**  
   Primeiramente, devemos popular a base com os animes mais famosos e lançamentos atuais (através das rotas). Isso garantirá uma página inicial adequada para começar. Após essa etapa, a população da base de animes será feita pelos próprios usuários, também utilizando as rotas disponíveis.

2. **Busca e inserção de títulos**
   - O sistema contará com uma barra de pesquisa na navbar ou na página inicial.  
   - Quando o usuário realizar uma busca, utilizaremos inicialmente a [rota de busca local](./routes/readme.md#1-buscar-títulos-de-animes) para listar os títulos disponíveis na base local.  
   - Caso o título desejado não esteja presente, aparecerá a opção **"carregar mais"**, que acionará a [rota de busca na API](./routes/readme.md#2-buscar-e-inserir-animes-na-base-local). Essa rota buscará o título na API e o inserirá na base local para consultas futuras.  
   - Dessa forma, a base local será enriquecida gradualmente com os títulos buscados, reduzindo a necessidade de futuras consultas na API. Este processo será similar para animes.

3. **Detalhes do anime**  
   - Ao selecionar um título, usaremos seu ID para consultar as informações detalhadas do anime através da [rota de informações de um anime](./routes/readme.md#2-informações-de-um-anime).  
   - Essa rota verificará inicialmente se as informações já estão na base local. Caso contrário, fará uma busca na API.  
   - Durante essa etapa, além das informações básicas do anime, também serão inseridas as temporadas e a quantidade de episódios disponíveis.

4. **Vídeos do anime**  
   - Na página do anime, utilizaremos a [rota de vídeos](./routes/readme.md#7-consultar-vídeos) para exibir conteúdos adicionais, como aberturas, encerramentos e outros vídeos oficiais.

### Fluxo principal

As etapas fundamentais incluem:  
- Busca de títulos na base local ou na API.  
- Consulta de informações detalhadas do anime usando o ID.  

Essas ações são essenciais para inserir temporadas e IDs necessários para o funcionamento das rotas subsequentes.

---

## **Contribuindo**

Contribuições são bem-vindas! Para contribuir:

1. Crie um fork do repositório.
2. Crie uma branch para sua feature ou correção de bug.
3. Envie um pull request com suas alterações.

---

## **Licença**

Este projeto está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
