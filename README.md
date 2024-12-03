# **AniList API Integration**

Este projeto é uma API construída com **Fastify** que utiliza a API do AniList para buscar informações sobre animes, episódios e temporadas. Ele também utiliza **Knex.js** para gerenciar o banco de dados e **DeepL** para traduzir informações.

## **Índice**
1. [Visão Geral](#visão-geral)
2. [Tecnologias Usadas](#tecnologias-usadas)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Rotas Disponíveis](#rotas-disponíveis)
   - [Rota `/search`](#rota-search)
   - [Rota `/searchApi`](#rota-search-api)
   - [Rota `/anime/:id`](#rota-animeid)
   - [Rota `/episodes/:id`](#rota-episodesid)
   - [Rota `/episodes/new`](#rota-episodesnew)
   - [Rota `/season`](#rota-season)
   - [Rota `/populate-genres`](#rota-populate-genres)
7. [Banco de Dados](#banco-de-dados)
8. [Contribuindo](#contribuindo)
9. [Licença](#licença)

---

## **Visão Geral**

Este projeto visa integrar informações da API AniList para construção de funcionalidades como:
- Busca de animes, episódios e temporadas.
- Tradução automática de títulos e descrições.
- Armazenamento e gerenciamento de dados em um banco de dados relacional.

---

## **Tecnologias Usadas**

- **Fastify**: Framework web para Node.js.
- **Knex.js**: ORM para interagir com o banco de dados.
- **PostgreSQL**: Banco de dados relacional utilizado.
- **Axios**: Cliente HTTP para requisições à API AniList.
- **DeepL**: API de tradução para traduzir títulos e descrições.
- **Node.js**: Ambiente de execução JavaScript.

---

## **Pré-requisitos**

Certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (v16 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (v12 ou superior)
- [Knex CLI](https://knexjs.org/)

Além disso, configure um arquivo `.env` com as seguintes variáveis:

```env
DEEPL_API_KEY=your_deepl_api_key
DATABASE_URL=postgres://user:password@localhost:5432/anilist_db
```

---

## **Instalação**

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
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
     knex migrate:latest
     ```

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

---

## **Estrutura do Projeto**

```plaintext
├── knexfile.js          # Configurações do Knex
├── migrations/          # Arquivos de migração do banco de dados
├── routes/              # Definição das rotas da API
│   ├── anime.js
│   ├── episodes.js
│   ├── episodes_new.js
│   ├── populate_genres.js
│   ├── search.js
│   └── searchApi.js
├── package.json         # Dependências do projeto
├── README.md            # Documentação do projeto
└── .env                 # Configurações de ambiente
```

---

## **Rotas Disponíveis**

### **Rota `/search`**

- **Descrição**: Realiza uma busca por títulos de animes no banco de dados com base na query fornecida.
- **Método**: `GET`
- **Parâmetros de Query**:
  - `query` (obrigatório): Termo a ser pesquisado.
- **Exemplo de Resposta**:
  ```json
  [
    {
      "id": 1,
      "english_title": "Example Title",
      "native_title": "例のタイトル",
      "romanji_title": "Rei no Taitoru"
    }
  ]
  ```
- **Notas**: A pesquisa é case-insensitive e busca em títulos em inglês, nativos e romanji.

---

### **Rota `/search-api`**

- **Descrição**: Busca por animes na API do Anilist, armazena os resultados no banco de dados e retorna os títulos encontrados.
- **Método**: `POST`
- **Body**:
  - `query` (obrigatório): Termo a ser pesquisado.
- **Exemplo de Resposta**:
  ```json
  [
    {
      "id": 1,
      "english_title": "Example Anime",
      "native_title": "例のアニメ",
      "romanji_title": "Rei no Anime"
    }
  ]
  ```
- **Notas**: Evita duplicatas no banco usando a cláusula `onConflict('id').ignore()`.

### **Rota `/anime/:id`**

- **Descrição**: Busca informações detalhadas de um anime pelo ID no banco local, caso não haja informações é feita a busca pela API Anilist, traduzido e salvo no banco para consultas futuras.
- **Método**: `GET`
- **Exemplo de Resposta**:
  ```json
  {
    "id": 123,
    "title": "Example Title",
    "description": "Descrição traduzida",
    "cover_image_url": "https://example.com/cover.jpg",
    "banner_image_url": "https://example.com/banner.jpg",
    "release_date": "2024-01-01",
    "season": "WINTER",
    "season_year": 2024,
    "episodes_count": 12
  }
  ```

---

### **Rota `/episodes/:id`**

- **Descrição**: Busca todos os episódios de um anime pelo ID no banco local, caso não haja informações é feita a busca pela API Anilist, traduzido e salvo no banco para consultas futuras.
- **Método**: `GET`
- **Exemplo de Resposta**:
  ```json
  [
    {
      "anime_id": 123,
      "episode_number": 1,
      "title_english": "Episode 1 - Title",
      "title_translated": "Episódio 1 - Título",
      "url": "https://example.com/episode1",
      "site": "Crunchyroll",
      "image_url": "https://example.com/image1.jpg"
    }
  ]
  ```

---

### **Rota `/episodes/new`**

- **Descrição**: Busca episódios mais recentes de animes da temporada atual.
- **Método**: `GET`
- **Exemplo de Resposta**:
  ```json
  {
    "message": "Processamento de episódios concluído.",
    "results": [
      {
        "anime_id": 123,
        "status": "episodes_added",
        "newEpisodes": [
          {
            "anime_id": 123,
            "episode_number": 1,
            "title_translated": "Episódio 1 - Título Traduzido"
          }
        ]
      }
    ]
  }
  ```

---

### **Rota `/season`**

- **Descrição**: Busca e salva no banco animes da temporada atual.
- **Método**: `GET`
- **Exemplo de Resposta**:
  ```json
  {
    "message": "Animes da temporada atual processados com sucesso.",
    "season": "WINTER",
    "year": 2024,
    "results": [
      { "id": 123, "status": "added" },
      { "id": 456, "status": "already_exists" }
    ]
  }
  ```

---

### **Rota `/populate-genres`**

- **Descrição**: Popula a tabela `genres` com gêneros disponíveis na AniList.
- **Método**: `POST`
- **Exemplo de Resposta**:
  ```json
  { "message": "Gêneros adicionados com sucesso." }
  ```

---

## **Banco de Dados**

### **Tabelas**

1. **Tabela `titles`**
   - `id` (integer, primary): Identificador único do título.
   - `english_title` (string, not nullable): Título em inglês.
   - `native_title` (string, not nullable): Título no idioma nativo.
   - `romanji_title` (string, not nullable): Título transliterado para Romanji.
   - `created_at` (timestamp): Data e hora de criação do registro (gerado automaticamente).
   - `updated_at` (timestamp): Data e hora da última atualização do registro (gerado automaticamente).

2. **Tabela `animes`**
   - `id`: Identificador único do anime.
   - `title`: Título do anime.
   - `description`: Descrição traduzida.
   - `episodes_count`: Número de episódios previstos.
   - `season`: Estação (FALL, WINTER, SPRING, SUMMER).
   - `season_year`: Ano da temporada.
   - `is_current_season`: Indica se o anime é da temporada atual.

3. **Tabela `episodes`**
   - `anime_id`: ID do anime relacionado.
   - `episode_number`: Número do episódio.
   - `title_english`: Título em inglês.
   - `title_translated`: Título traduzido.
   - `url`: URL do episódio.
   - `site`: Site onde o episódio está disponível.

4. **Tabela `genres`**
   - `id`: Identificador único do gênero.
   - `name_en`: Nome do gênero em inglês.
   - `name_pt`: Nome do gênero traduzido.

---

## **Contribuindo**

Contribuições são bem-vindas! Para contribuir:

1. Crie um fork do repositório.
2. Crie uma branch para sua feature ou correção de bug.
3. Envie um pull request com suas alterações.

---

## **Licença**

Este projeto está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
