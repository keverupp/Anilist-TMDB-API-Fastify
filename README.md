# **OtakuDiscuss v2**

Este projeto é uma API construída com **Fastify** que utiliza a API do AniList para buscar informações sobre animes, episódios e temporadas. Ele também utiliza **Knex.js** para gerenciar o banco de dados e **DeepL** para traduzir informações.

## **Índice**
1. [Visão Geral](#visão-geral)
2. [Tecnologias Usadas](#tecnologias-usadas)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Rotas](#rotas)
7. [Banco de Dados](#banco-de-dados)
8. [Contribuindo](#contribuindo)
9. [Licença](#licença)

---

## **Visão Geral**

Este projeto visa integrar informações da API AniList para construção de funcionalidades como:
- Busca de animes, episódios e temporadas.
- Tradução automática de títulos e descrições.
- Armazenamento e gerenciamento de dados em um banco de dados relacional.

Este projeto tem como objetivo final ser uma plataforma completa de animes em Portugues(BR).

---

## **Tecnologias Usadas**

- **Fastify**: Framework web para Node.js utilizado para construção da API.
- **Knex.js**: Query builder para interagir com o banco de dados relacional.
- **PostgreSQL**: Banco de dados relacional usado para persistência de dados.
- **Axios**: Cliente HTTP usado para requisições, como à API AniList.
- **DeepL**: API de tradução utilizada para traduzir títulos e descrições.
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

### **Banco de Dados**

---

1. **Tabela `activity_logs`**
   - `id` (integer, primary): Identificador único do log de atividade.
   - `action` (string): Ação realizada pelo usuário.
   - `created_at` (timestamp with time zone): Data e hora da criação do log.
   - `ip_address` (string): Endereço IP do usuário.
   - `user_id` (integer, foreign): Identificador do usuário associado ao log.

2. **Tabela `anime_follows`**
   - `id` (integer, primary): Identificador único do registro.
   - `anime_id` (integer, foreign): Identificador do anime seguido.
   - `user_id` (integer, foreign): Identificador do usuário que segue o anime.

3. **Tabela `anime_genres`**
   - `anime_id` (integer, foreign): Identificador do anime.
   - `genre_id` (integer, foreign): Identificador do gênero associado.

4. **Tabela `animes`**
   - `id` (integer, primary): Identificador único do anime.
   - `title` (string): Título do anime.
   - `description` (text): Descrição do anime.
   - `episodes_count` (integer): Número de episódios.
   - `genres` (string): Gêneros associados ao anime.
   - `banner_image_url` (string): URL da imagem de banner.
   - `cover_image_url` (string): URL da imagem de capa.
   - `release_date` (date): Data de lançamento.
   - `season` (string): Temporada (FALL, WINTER, SPRING, SUMMER).
   - `season_year` (integer): Ano da temporada.
   - `is_current_season` (boolean): Indica se pertence à temporada atual.
   - `created_at` (timestamp with time zone): Data de criação.
   - `updated_at` (timestamp with time zone): Data da última atualização.

5. **Tabela `comments`**
   - `id` (integer, primary): Identificador único do comentário.
   - `anime_id` (integer, foreign): Identificador do anime.
   - `episode_id` (integer, foreign): Identificador do episódio.
   - `user_id` (integer, foreign): Identificador do usuário.
   - `parent_id` (integer): Comentário pai (se for uma resposta).
   - `content` (text): Conteúdo do comentário.
   - `created_at` (timestamp with time zone): Data de criação.
   - `updated_at` (timestamp with time zone): Data da última atualização.

6. **Tabela `episodes`**
   - `id` (integer, primary): Identificador único do episódio.
   - `anime_id` (integer, foreign): Identificador do anime.
   - `episode_number` (integer): Número do episódio.
   - `title_english` (string): Título em inglês.
   - `title_translated` (string): Título traduzido.
   - `site` (string): Site de exibição.
   - `url` (text): URL do episódio.
   - `image_url` (string): URL da imagem do episódio.
   - `created_at` (timestamp with time zone): Data de criação.

7. **Tabela `genres`**
   - `id` (integer, primary): Identificador único do gênero.
   - `name_en` (string): Nome do gênero em inglês.
   - `name_pt` (string): Nome do gênero em português.

8. **Tabela `notifications`**
   - `id` (integer, primary): Identificador único da notificação.
   - `type` (string): Tipo de notificação.
   - `related_id` (integer): Identificador do item relacionado.
   - `user_id` (integer, foreign): Identificador do usuário.
   - `read` (boolean): Indica se a notificação foi lida.
   - `created_at` (timestamp with time zone): Data de criação.

9. **Tabela `password_resets`**
   - `id` (integer, primary): Identificador único do registro.
   - `user_id` (integer, foreign): Identificador do usuário.
   - `token` (string): Token de redefinição.
   - `expires_at` (timestamp with time zone): Data de expiração do token.
   - `created_at` (timestamp with time zone): Data de criação.

10. **Tabela `reactions`**
    - `id` (integer, primary): Identificador único da reação.
    - `user_id` (integer, foreign): Identificador do usuário.
    - `comment_id` (integer, foreign): Identificador do comentário.
    - `type` (text): Tipo de reação.
    - `created_at` (timestamp with time zone): Data de criação.

11. **Tabela `titles`**
    - `id` (integer, primary): Identificador único do título.
    - `english_title` (string): Título em inglês.
    - `native_title` (string): Título no idioma nativo.
    - `romanji_title` (string): Título transliterado para Romanji.
    - `created_at` (timestamp with time zone): Data de criação.
    - `updated_at` (timestamp with time zone): Data de atualização.

12. **Tabela `tokens`**
    - `id` (integer, primary): Identificador único do token.
    - `user_id` (integer, foreign): Identificador do usuário.
    - `token` (string): Token de autenticação.
    - `expires_at` (timestamp with time zone): Data de expiração do token.
    - `created_at` (timestamp with time zone): Data de criação.

13. **Tabela `user_preferences`**
    - `id` (integer, primary): Identificador único das preferências.
    - `user_id` (integer, foreign): Identificador do usuário.
    - `notify_new_comments` (boolean): Notificar novos comentários.
    - `notify_new_episodes` (boolean): Notificar novos episódios.
    - `notify_reactions` (boolean): Notificar reações.
    - `notify_replies` (boolean): Notificar respostas.

14. **Tabela `users`**
    - `id` (integer, primary): Identificador único do usuário.
    - `username` (string): Nome de usuário.
    - `name` (string): Nome completo.
    - `email` (string): Endereço de e-mail.
    - `password` (string): Senha do usuário.
    - `avatar` (string): URL do avatar.
    - `is_active` (boolean): Indica se a conta está ativa.
    - `created_at` (timestamp with time zone): Data de criação.
    - `updated_at` (timestamp with time zone): Data de atualização.

---

## **Contribuindo**

Contribuições são bem-vindas! Para contribuir:

1. Crie um fork do repositório.
2. Crie uma branch para sua feature ou correção de bug.
3. Envie um pull request com suas alterações.

---

## **Licença**

Este projeto está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
