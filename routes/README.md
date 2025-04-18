# 📜 Documentação das Rotas

## Sumário

- [Rotas de Autenticação e Gestão de Tokens](#-rotas-de-autenticação-e-gestão-de-tokens)

- [Registro](#1-registro)
- [Login](#2-login)
- [Logout](#3-logout)
- [Renovação de Token](#4-renovação-de-token)
- [Recuperação de Senha](#5-recuperação-de-senha)
  - [Solicitação de Redefinição de Senha](#51-solicitação-de-redefinição-de-senha)
  - [Redefinição de Senha](#52-redefinição-de-senha)
- [Middleware de Autenticação](#middleware-de-autenticação)

---
- [Rotas de Busca](#-rotas-de-busca) 

  - [Buscar Títulos de Animes](#1-buscar-títulos-de-animes)
  - [Buscar e Inserir Animes na Base Local](#2-buscar-e-inserir-animes-na-base-local)

---
- [Rotas de Animes](#-rotas-de-animes)

  - [Gerenciar Anime Seguido](#1-gerenciar-anime-seguido)
  - [Listar Animes Seguidos](#2-listar-animes-seguidos)
  - [Informações de um Anime](#3-informações-de-um-anime)
  - [Listar Todos os Animes](#4-listar-todos-os-animes)
  - [Listar Animes com Status `Returning Series`](#5-listar-animes-com-status-returning-series)
  - [Listar Temporadas de um Anime](#6-listar-temporadas-de-um-anime)

---
- [Rotas de Episódios](#-rotas-de-episódios)

  - [Importar Episódios de um Anime](#1-importar-episódios-de-um-anime)
  - [Listar Episódios de um Anime com Paginação e Filtro de Temporada](#2-listar-episódios-de-um-anime-com-paginação-e-filtro-de-temporada)
  - [Atualizar Episódios com Runtime Nulo](#3-atualizar-episódios-com-runtime-nulo)

---
- [Rotas de Vídeos](#-rotas-de-vídeos)

  - [Adicionar Vídeos de um Anime](#1-adicionar-vídeos-de-um-anime)
  - [Consultar Vídeos](#2-consultar-vídeos)

---
- [Rotas de Comentários](#-rotas-de-comentários)

  - [Criar Comentário](#1-criar-comentário)
  - [Responder a Comentário](#2-responder-comentário)
  - [Listar Comentários](#3-listar-comentários)
  - [Editar Comentário](#4-editar-comentário)
  - [Excluir Comentário](#5-excluir-comentário)

---
- [Rotas de Reações](#-rotas-de-reações)

  - [Adicionar/Atualizar/Remover Reação](#1-adicionar-atualizar-remover-reação)

---
- [Rotas de Usuário](#-rotas-de-usuário)

  - [Atualizar Avatar do Usuário](#1-atualizar-avatar-do-usuário)
  - [Buscar Detalhes do Usuário](#2-buscar-detalhes-do-usuário)
  - [Atualizar Informações do Usuário](#3-atualizar-informações-do-usuário)
  - [Atualizar Senha do Usuário](#4-atualizar-senha-do-usuário)
  - [Listar Preferências do Usuário](#5-listar-preferências-do-usuário)
  - [Atualizar Preferências do Usuário](#6-atualizar-preferências-do-usuário)

---
- [Rotas de Notificações](#-rotas-de-notificações)
  - [Listar Notificações](#1-listar-notificações)
  - [Marcar Notificação como Lida](#2-marcar-notificação-como-lida)

---

## 🔒 Rotas de Autenticação e Gestão de Tokens

### 1. Registro

- **Endpoint**: `POST /register`
- **Descrição**: Registra um novo usuário.
- **Corpo da Requisição**:
  ```json
  {
    "username": "usuario123",
    "email": "usuario@example.com",
    "password": "senhaSegura123"
  }
  ```

---

### 2. Login

- **Endpoint**: `POST /login`
- **Descrição**: Autentica o usuário e retorna um token JWT.
- **Corpo da Requisição**:
  ```json
  {
    "email": "usuario@example.com",
    "password": "senhaSegura123"
  }
  ```

---

### 3. Logout

- **Endpoint**: `POST /logout`
- **Descrição**: Invalida o token JWT do usuário.
- **Corpo da Requisição**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

---

### 4. Renovação de Token

- **Endpoint**: `POST /refreshToken`
- **Descrição**: Gera um novo token JWT se o token atual for válido.
- **Corpo da Requisição**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

---

### 5. Recuperação de Senha

#### 5.1 Solicitação de Redefinição de Senha

- **Endpoint**: `POST /forgotpassword`
- **Descrição**: Envia um e-mail com um link para redefinir a senha.
- **Corpo da Requisição**:
  ```json
  {
    "email": "usuario@example.com"
  }
  ```
- **Resposta** (sempre a mesma, independentemente do e-mail estar cadastrado ou não, por segurança):
  ```json
  {
    "message": "Se este email estiver cadastrado, um email de redefinição será enviado."
  }
  ```
- **E-mail enviado**:

  ```
  Você solicitou a redefinição de sua senha.

  Clique no link para redefinir:
  http://localhost:5173/reset-password?token=e15497940b7fcf0d89...

  Se não foi você, ignore este email.
  ```

---

#### 5.2 Redefinição de Senha

- **Endpoint**: `POST /resetpassword`
- **Descrição**: Redefine a senha do usuário usando um token de recuperação válido.
- **Corpo da Requisição**:
  ```json
  {
    "token": "e15497940b7fcf0d89...",
    "new_password": "NovaSenhaForte123"
  }
  ```
- **Respostas**:
  - **Sucesso**:
    ```json
    {
      "message": "Senha redefinida com sucesso."
    }
    ```
  - **Erros**:
    - **Campos ausentes**:
      ```json
      {
        "error": "Bad Request",
        "message": "Token e nova senha são obrigatórios."
      }
      ```
    - **Erro interno**:
      ```json
      {
        "error": "Erro interno",
        "message": "Não foi possível redefinir a senha."
      }
      ```
- **Observação**: Se o token for inválido ou expirado, retornará erro. Caso contrário, a senha é atualizada e o token removido.

---

### Middleware de Autenticação

- **Arquivo**: `authMiddleware.js`
- **Descrição**: Middleware para rotas que requerem autenticação.
- **Funcionamento**:
  - Valida o token JWT no cabeçalho `Authorization`.
  - Verifica se o token está na tabela `tokens` e não expirou.
  - Anexa `req.user` se o token for válido.
- **Resposta em caso de falha**:
  - **401 Unauthorized**: Token ausente, inválido ou expirado.

---

## 🔎 Rotas de Busca

### 1. Buscar Títulos de Animes

- **Endpoint**: `GET /search`
- **Descrição**: Busca títulos de animes na base de dados local. A busca verifica os títulos principais e os alternativos para retornar informações sobre os animes encontrados. Permite a personalização da resposta especificando os campos desejados.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Query**:

  - **query** (obrigatório): A palavra-chave usada para buscar os títulos.
    - Tipo: `string`
    - Exemplo: `query=sousou`
  - **fields** (opcional): Lista separada por vírgulas dos campos a serem retornados.
    - Tipo: `string`
    - Campos permitidos:
      - `id`
      - `english_title`
      - `pt_title`
      - `native_title`
    - Exemplo: `fields=english_title`

- **Observação**:
  - Quando `fields` não for informado, todos os campos padrão serão retornados.
  - A busca em `query` é insensível a maiúsculas e minúsculas.

---

### 2. Buscar e Inserir Animes na Base Local

- **Endpoint**: `GET /search-api`
- **Descrição**: Busca animes na API do The Movie Database (TMDB) com base em um termo de consulta, insere os títulos principais e alternativos encontrados no banco de dados local e retorna os dados processados.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Query**:

  - **query** (obrigatório): A palavra-chave usada para buscar os animes na API.
    - Tipo: `string`
    - Exemplo: `query=naruto`

- **Observação**:
  - A busca é limitada ao gênero Animation (ID 16) no TMDB.
  - Para cada anime encontrado, o título em português do Brasil (`pt-BR`) e os títulos alternativos são buscados.
  - Apenas resultados válidos são inseridos no banco de dados.

---

### Exemplo de Respostas

#### **1. Buscar Títulos de Animes**

**Request**:

```http
GET /search?query=sousou&fields=english_title
```

**Response (200 OK)**:

```json
[
  {
    "english_title": "Frieren: Beyond Journey's End"
  }
]
```

---

#### **2. Buscar e Inserir Animes na Base Local**

**Request**:

```http
GET /search-api?query=naruto
```

**Response (200 OK)**:

```json
{
  "message": "Animes e títulos alternativos processados com sucesso!",
  "titles": [
    {
      "id": 20,
      "english_title": "Naruto",
      "native_title": "ナルト",
      "pt_title": "Naruto"
    }
  ],
  "alternative_titles": [
    {
      "anime_id": 20,
      "iso_3166_1": "JP",
      "title": "ナルト",
      "type": null,
      "created_at": "2024-12-08T17:30:00.000Z",
      "updated_at": "2024-12-08T17:30:00.000Z"
    }
  ]
}
```

---

## 🍿 Rotas de Animes

### 1. Gerenciar Anime Seguido

- **Endpoint**: `POST /anime/follow`
- **Descrição**: Alterna entre seguir e deixar de seguir um anime. Se o anime já está sendo seguido, a rota cancela o "seguir". Caso contrário, o anime será seguido.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>",
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:

  ```json
  {
    "anime_id": 123
  }
  ```

  - **anime_id** (obrigatório): ID do anime que o usuário deseja seguir ou deixar de seguir.

- **Respostas**:
  - **201 (Sucesso ao seguir)**:
    ```json
    {
      "message": "Anime seguido com sucesso."
    }
    ```
  - **200 (Sucesso ao deixar de seguir)**:
    ```json
    {
      "message": "Você parou de seguir o anime."
    }
    ```
  - **400 (Erro de Validação)**:
    ```json
    {
      "error": "Bad Request",
      "message": "ID do anime é obrigatório."
    }
    ```
  - **404 (Anime Não Encontrado)**:
    ```json
    {
      "error": "Not Found",
      "message": "O anime não foi encontrado."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao alternar o estado de seguir anime."
    }
    ```

---

### 2. Listar Animes Seguidos

- **Endpoint**: `GET /anime/followed`
- **Descrição**: Retorna a lista de animes que o usuário está seguindo.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
      "message": "Lista de animes seguidos.",
      "animes": [
        {
          "id": 1,
          "name": "Naruto",
          "poster_path": "https://example.com/naruto.jpg"
        },
        {
          "id": 2,
          "name": "One Piece",
          "poster_path": "https://example.com/one_piece.jpg"
        }
      ]
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao listar animes seguidos."
    }
    ```

---

### 3. Informações de um Anime

- **Endpoint**: `GET /anime/:id`
- **Descrição**: Retorna informações detalhadas sobre um anime.
- **Autenticação**: Não necessária (ajuste se necessário).
- **Parâmetros de Rota**:
  - `id`: ID do anime.

---

### 4. **Listar Todos os Animes**

- **Endpoint**: `GET /animes`
- **Descrição**: Lista todos os animes no banco de dados com suporte a filtros, paginação, campos personalizados, gêneros e ordenação. A busca inclui nomes alternativos.
- **Autenticação**: Não necessária.

#### **Query Parameters**:

| Parâmetro    | Tipo     | Obrigatório | Descrição                                                                                     | Exemplo                      |
| ------------ | -------- | ----------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| `page`       | `number` | Não         | Número da página para paginação. Valor padrão: `1`.                                           | `?page=2`                    |
| `limit`      | `number` | Não         | Quantidade de registros por página. Valor padrão: `10`.                                       | `?limit=5`                   |
| `name`       | `string` | Não         | Nome parcial ou completo do anime ou de títulos alternativos para filtrar resultados.         | `?name=sousou`               |
| `status`     | `string` | Não         | Status do anime para filtrar resultados (`Finalizado`, `Continuando`, etc.).                  | `?status=Finalizado`         |
| `fields`     | `string` | Não         | Campos a serem retornados, separados por vírgulas. Caso não seja especificado, retorna todos. | `?fields=id,name`            |
| `genres`     | `string` | Não         | Lista de gêneros separados por vírgulas para filtrar animes.                                  | `?genres=Drama,Fantasia`     |
| `keywords`   | `string` | Não         | Lista de palavras-chave separadas por vírgulas para filtrar animes.                           | `?keywords=escola,magia`     |
| `sort_by`    | `string` | Não         | Campo pelo qual ordenar os resultados. Valor padrão: `name`.                                  | `?sort_by=popularity`        |
| `sort_order` | `string` | Não         | Direção da ordenação: `asc` (ascendente) ou `desc` (descendente). Valor padrão: `asc`.        | `?sort_order=desc`           |

#### **Respostas**:

**200 (Sucesso)**:

```json
{
  "pagination": {
    "total": 100,
    "totalPages": 10,
    "currentPage": 1,
    "perPage": 10
  },
  "sort": {
    "field": "name",
    "order": "asc"
  },
  "data": [
    {
      "id": 1,
      "name": "Naruto",
      "overview": "A história de um ninja...",
      "poster_path": "/naruto-poster.jpg",
      "backdrop_path": "/naruto-backdrop.jpg",
      "banner_path": "/naruto-banner.jpg",
      "first_air_date": "2002-10-03",
      "is_current_season": false,
      "episodes_count": 220,
      "adult": false,
      "in_production": false,
      "homepage": "https://www.naruto.com",
      "vote_average": 8.5,
      "vote_count": 1234,
      "original_name": "ナルト",
      "original_language": "ja",
      "number_of_seasons": 5,
      "number_of_episodes": 220,
      "popularity": 100.0,
      "status": "Finalizado",
      "episode_run_time": 25,
      "type": "Anime"
    }
  ]
}
```

**404 (Não Encontrado)**:

```json
{
  "error": "Nenhum gênero correspondente foi encontrado."
}
```

**500 (Erro Interno)**:

```json
{
  "error": "Erro ao buscar animes."
}
```

#### **Observações**:

- **Busca por Nome**:
  - O parâmetro `name` busca pelo nome do anime (`animes.name`) e também por títulos alternativos (`alternative_titles.title`).
  - Caso não encontre resultados em nenhum dos campos, a resposta será uma lista vazia.

- **Busca por Gêneros**:
  - O parâmetro `genres` filtra os animes que pertencem a todos os gêneros listados (condição AND).
  - Os gêneros são comparados com base no campo `name_pt` da tabela `genres`.
  - Caso nenhum gênero correspondente seja encontrado, a resposta será um erro 404.

- **Busca por Keywords**:
  - O parâmetro `keywords` filtra os animes que têm todas as palavras-chave listadas (condição AND).
  - Caso nenhuma keyword correspondente seja encontrada, a resposta será um erro 404.

- **Campos Personalizados**:
  - Quando `fields` é usado, apenas os campos especificados são retornados, desde que sejam válidos e existam na tabela `animes`.
  - Exemplo: `?fields=id,name` retorna somente `id` e `name`.

- **Ordenação**:
  - Os resultados podem ser ordenados pelo campo especificado em `sort_by` e na direção especificada em `sort_order`.
  - Campos válidos para ordenação: `name`, `popularity`, `vote_average`, `first_air_date`, `episodes_count`, `number_of_seasons`.
  - Se um campo inválido for fornecido, o padrão `name` será utilizado.
  - Direções válidas: `asc` (ascendente, A-Z, menor para maior) e `desc` (descendente, Z-A, maior para menor).
  - Exemplo: `?sort_by=vote_average&sort_order=desc` ordena os animes da maior para a menor nota.

- **Evitar Ambiguidade**:
  - Todos os campos selecionados são explicitamente associados à tabela correspondente para evitar erros de ambiguidade em consultas SQL.

- **Paginação**:
  - O resultado padrão é paginado com base nos parâmetros `page` e `limit`. Caso não sejam fornecidos, `page=1` e `limit=10` serão usados como padrão.

- **Estrutura da Resposta**:
  - A resposta inclui informações de paginação, detalhes de ordenação aplicada e os dados dos animes.

---

### 5. Listar Animes com Status `Returning Series`

- **Endpoint**: `GET /animes/returning-series`
- **Descrição**: Retorna uma lista de animes com status `Returning Series` da tabela `animes`. Suporta opções para limitar o número de resultados, selecionar campos específicos e paginação.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:

  - `limit` (opcional): Número máximo de resultados por página. Padrão: `10`. Exemplo: `limit=5`.
  - `page` (opcional): Número da página a ser retornada. Padrão: `1`. Exemplo: `page=2`.
  - `fields` (opcional): Lista de campos a serem retornados, separados por vírgula. Exemplo: `fields=id,name,overview`.

- **Resposta**:

  - **Código 200**:

    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Anime Exemplo",
          "overview": "Uma descrição do anime exemplo.",
          "banner_path": "/path/to/banner.jpg",
          "poster_path": "/path/to/poster.jpg"
        },
        {
          "id": 2,
          "name": "Outro Anime",
          "overview": "Descrição de outro anime.",
          "banner_path": "/path/to/another-banner.jpg",
          "poster_path": "/path/to/another-poster.jpg"
        }
      ],
      "meta": {
        "limit": 5,
        "page": 1,
        "count": 2
      }
    }
    ```

    - **`data`**: Lista de animes conforme os filtros e paginação.
    - **`meta`**: Informações sobre a paginação:
      - `limit`: Número máximo de itens por página.
      - `page`: Página atual.
      - `count`: Número de itens retornados na página.

  - **Código 500** (em caso de erro interno):
    ```json
    {
      "error": "Erro ao listar animes."
    }
    ```

- **Exemplos de uso**:

  - **Retornar os campos padrão com no máximo 5 resultados na página 1**:
    ```
    GET /animes/returning-series?limit=5&page=1
    ```
  - **Retornar apenas os campos `id` e `name` na página 2 com 10 resultados por página**:
    ```
    GET /animes/returning-series?fields=id,name&limit=10&page=2
    ```
  - **Retornar todos os campos padrão para a página 3 com limite de 8 resultados por página**:
    ```
    GET /animes/returning-series?limit=8&page=3
    ```

- **Observações**:
  - Se `fields` não for fornecido, os campos padrão serão retornados:
    - `id`, `name`, `original_name`, `overview`, `poster_path`, `banner_path`, `backdrop_path`.
  - Se `limit` não for fornecido, o padrão será 10.
  - Se `page` não for fornecido, o padrão será 1.
  - A resposta incluirá metadados úteis para navegação paginada.

---

### 6. **Listar Temporadas de um Anime**

- **Endpoint**: `GET /animes/:anime_id/seasons`
- **Descrição**: Lista todas as temporadas de um anime específico com suporte a paginação.
- **Autenticação**: Não necessária.

#### **Parâmetros da Rota**:

| Parâmetro  | Tipo     | Obrigatório | Descrição                                    | Exemplo     |
| ---------- | -------- | ----------- | -------------------------------------------- | ----------- |
| `anime_id` | `number` | Sim         | ID do anime cujas temporadas serão listadas. | `/animes/1` |

#### **Query Parameters**:

| Parâmetro | Tipo     | Obrigatório | Descrição                                               | Exemplo    |
| --------- | -------- | ----------- | ------------------------------------------------------- | ---------- |
| `page`    | `number` | Não         | Número da página para paginação. Valor padrão: `1`.     | `?page=2`  |
| `limit`   | `number` | Não         | Quantidade de registros por página. Valor padrão: `10`. | `?limit=5` |

#### **Respostas**:

**200 (Sucesso)**:

```json
{
  "seasons": [
    {
      "id": 1,
      "name": "Demon Slayer - Entertainment District Arc",
      "season": "Winter",
      "year": 2023,
      "air_date": "2023-01-08",
      "created_at": "2022-12-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Demon Slayer - Swordsmith Village Arc",
      "season": "Spring",
      "year": 2023,
      "air_date": "2023-04-09",
      "created_at": "2023-01-15T00:00:00.000Z",
      "updated_at": "2023-04-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 20,
    "totalPages": 2,
    "currentPage": 1,
    "perPage": 10
  }
}
```

**400 (Erro de Validação)**:

```json
{
  "error": "Parâmetro inválido",
  "message": "O ID do anime deve ser um número válido e positivo."
}
```

**404 (Nenhuma Temporada Encontrada)**:

```json
{
  "message": "Nenhuma temporada encontrada para este anime."
}
```

**500 (Erro Interno)**:

```json
{
  "error": "Erro ao buscar temporadas."
}
```

---

## 🎥 Rotas de Episódios

### 1. Importar Episódios de um Anime

- **Endpoint**: `POST /anime/:animeId/episodes`
- **Descrição**: Importa os episódios de um anime da API do TMDB e os salva na base de dados local, associando-os às temporadas previamente cadastradas.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Rota**:

  - **animeId** (obrigatório): O ID do anime registrado na API do TMDB.
    - Tipo: `integer`
    - Exemplo: `/anime/240411/episodes`

- **Resposta**:

  - **Código 201**:
    ```json
    {
      "message": "Episódios importados com sucesso!"
    }
    ```
  - **Código 500** (em caso de erro):
    ```json
    {
      "error": "Erro ao importar episódios."
    }
    ```

- **Observação**:
  - O anime e suas temporadas devem estar previamente registrados na base de dados.
  - Apenas episódios ainda não cadastrados serão importados.

---

### 2. Listar Episódios de um Anime com Paginação e Filtro de Temporada

- **Endpoint**: `GET /anime/:animeId/episodes`
- **Descrição**: Retorna os episódios de um anime previamente importados, com suporte a paginação e filtro de temporada.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Rota**:

  - **animeId** (obrigatório): O ID do anime registrado no banco de dados.
    - Tipo: `integer`
    - Exemplo: `/anime/240411/episodes`

- **Parâmetros da Query**:

  - **season** (opcional): Número da temporada do anime.
    - Tipo: `integer`
    - Exemplo: `season=2`
  - **year** (opcional): Ano de lançamento da temporada.
    - Tipo: `integer`
    - Exemplo: `year=2022`
  - **page** (opcional): O número da página que deseja visualizar.
    - Tipo: `integer`
    - Valor padrão: `1`
    - Exemplo: `page=2`
  - **limit** (opcional): O número de episódios a serem retornados por página.
    - Tipo: `integer`
    - Valor padrão: `10`
    - Exemplo: `limit=5`

- **Resposta**:

  - **Código 200**:
    ```json
    {
      "animeId": 240411,
      "season": 2,
      "year": 2022,
      "episodes": [
        {
          "id": 1,
          "name": "Episódio 1",
          "episode_number": 1,
          "overview": "Introdução ao anime.",
          "air_date": "2022-01-01",
          "vote_average": 8.5,
          "vote_count": 100,
          "still_path": "/image.jpg",
          "runtime": 24,
          "tmdb_id": 98765
        }
      ],
      "pagination": {
        "total": 100,
        "totalPages": 20,
        "currentPage": 1,
        "perPage": 10
      }
    }
    ```
  - **Código 404** (quando a temporada não é encontrada):
    ```json
    {
      "error": "Temporada não encontrada."
    }
    ```
  - **Código 500** (em caso de erro interno):
    ```json
    {
      "error": "Erro ao listar episódios."
    }
    ```

- **Observações**:

  - É possível filtrar os episódios por temporada usando os parâmetros `season` (número da temporada) e `year` (ano de lançamento).
  - Caso nenhum filtro de temporada seja fornecido, retorna os episódios da primeira temporada encontrada no banco de dados.
  - Os episódios são retornados em ordem crescente de número do episódio (`episode_number`).
  - A resposta inclui informações de paginação, como total de episódios (`total`), total de páginas (`totalPages`), página atual (`currentPage`), e número de itens por página (`perPage`).

---

### 3. Atualizar Episódios com Runtime Nulo

- **Endpoint**: `PUT /episodes/update-pending`
- **Descrição**: Busca todos os episódios com a coluna `runtime` como `null` na base de dados, consulta a API do TMDB para obter informações completas sobre esses episódios e atualiza as informações no banco de dados.
- **Autenticação**: Não necessária.
- **Headers**:

  ```json
  {
    "Content-Type": "application/json"
  }
  ```

- **Comportamento da Rota**:

  1. Verifica os episódios na base de dados com `runtime` como `null`.
  2. Para cada episódio encontrado:
     - Busca as informações na API do TMDB usando o endpoint:
       ```
       https://api.themoviedb.org/3/tv/{show_id}/season/{season_number}/episode/{episode_number}
       ```
     - Atualiza as seguintes colunas no banco de dados:
       - `name`: Nome do episódio.
       - `overview`: Descrição.
       - `still_path`: Caminho para a imagem.
       - `air_date`: Data de exibição.
       - `vote_average`: Nota média de votação.
       - `vote_count`: Número de votos.
       - `runtime`: Duração do episódio (em minutos).
       - `production_code`: Código de produção.
       - `episode_type`: Tipo de episódio.
       - `updated_at`: Hora da última atualização.

- **Resposta**:

  - **Código 200 (Sucesso)**:
    ```json
    {
      "message": "Episódios atualizados com sucesso!"
    }
    ```
  - **Código 500 (Erro)**:
    ```json
    {
      "error": "Erro ao atualizar episódios."
    }
    ```

- **Observação**:
  - Episódios já atualizados ou com informações completas serão ignorados.

---

## 📺 Rotas de Vídeos

### 1. Adicionar Vídeos de um Anime

- **Endpoint**: `POST /tv/:anime_id/videos`
- **Descrição**: Busca vídeos de um anime na API do TMDB e os salva no banco de dados. Utiliza a chave `key` para evitar duplicação.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Rota**:

  - **anime_id** (obrigatório): ID do anime na API do TMDB.
    - Tipo: `integer`
    - Exemplo: `/tv/240411/videos`

- **Respostas**:

  - **201 (Criado)**:
    ```json
    {
      "message": "Vídeos inseridos com sucesso!",
      "videos": [
        {
          "show_id": 240411,
          "name": "Trailer Oficial",
          "key": "oy-XD_gGbcE",
          "site": "YouTube",
          "size": 1080,
          "type": "Trailer",
          "official": true,
          "published_at": "2024-03-10T17:00:27.000Z"
        }
      ]
    }
    ```
  - **404 (Não Encontrado)**:
    ```json
    {
      "message": "Nenhum vídeo encontrado para esta série."
    }
    ```
  - **400 (Nenhum Vídeo Válido)**:
    ```json
    {
      "message": "Nenhum vídeo válido encontrado para inserir."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao buscar e inserir vídeos."
    }
    ```

- **Observações**:
  - Apenas vídeos válidos e oficiais serão armazenados.
  - Vídeos duplicados (baseados na chave `key`) serão ignorados automaticamente.

---

### 2. Consultar Vídeos

- **Endpoint**: `GET /anime/videos`
- **Descrição**: Recupera vídeos armazenados no banco de dados, com suporte a filtros e paginação.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros de Query**:

  - **show_id** (opcional): Filtra vídeos de um anime específico.
    - Tipo: `integer`
    - Exemplo: `show_id=240411`
  - **page** (opcional): Página atual para paginação.
    - Tipo: `integer`
    - Padrão: `1`
    - Exemplo: `page=2`
  - **limit** (opcional): Quantidade de vídeos por página.
    - Tipo: `integer`
    - Padrão: `10`
    - Exemplo: `limit=5`

- **Respostas**:

  - **200 (Sucesso)**:
    ```json
    {
      "videos": [
        {
          "id": 1,
          "show_id": 240411,
          "name": "Trailer Oficial",
          "key": "oy-XD_gGbcE",
          "site": "YouTube",
          "size": 1080,
          "type": "Trailer",
          "official": true,
          "published_at": "2024-03-10T17:00:27.000Z"
        }
      ],
      "pagination": {
        "total": 10,
        "totalPages": 2,
        "currentPage": 1,
        "perPage": 5
      }
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao buscar vídeos."
    }
    ```

- **Observações**:
  - Caso `show_id` não seja especificado, retorna todos os vídeos disponíveis.
  - A resposta inclui informações de paginação: `total`, `totalPages`, `currentPage`, `perPage`.

---

## 💬 Rotas de Comentários

### 1. Criar Comentário

- **Endpoint**: `POST /comments`
- **Descrição**: Cria um novo comentário em um anime ou episódio.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>",
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:

  ```json
  {
    "anime_id": 123,
    "episode_id": 1,
    "content": "Este é um comentário."
  }
  ```

  - **anime_id** (obrigatório): ID do anime associado ao comentário.
  - **episode_id** (opcional): ID do episódio, se o comentário for específico para um episódio.
  - **content** (obrigatório): O texto do comentário.

- **Respostas**:
  - **201 (Criado)**:
    ```json
    {
      "message": "Comentário criado com sucesso.",
      "commentId": 1
    }
    ```
  - **400 (Erro de Validação)**:
    ```json
    {
      "error": "Bad Request",
      "message": "Anime ID e conteúdo são obrigatórios."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro interno ao criar comentário."
    }
    ```

---

### 2. Responder Comentário

- **Endpoint**: `POST /comments/:id`
- **Descrição**: Cria uma resposta a um comentário existente.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>",
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Rota**:

  - **id** (obrigatório): ID do comentário pai.

- **Corpo da Requisição**:

  ```json
  {
    "content": "Esta é uma resposta ao comentário."
  }
  ```

- **Respostas**:
  - **201 (Criado)**:
    ```json
    {
      "message": "Resposta criada com sucesso.",
      "commentId": 2
    }
    ```
  - **404 (Comentário Pai Não Encontrado)**:
    ```json
    {
      "error": "Not Found",
      "message": "Comentário pai não encontrado."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro interno ao criar comentário."
    }
    ```

---

### 3. Listar Comentários

- **Endpoint**: `GET /comments`
- **Descrição**: Retorna os comentários de um anime ou episódio, com respostas aninhadas e suporte à paginação.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Query**:

  - **anime_id** (obrigatório): ID do anime.
    - Tipo: `integer`
  - **episode_id** (opcional): ID do episódio.
    - Tipo: `integer`
  - **page** (opcional): Número da página.
    - Tipo: `integer`
    - Valor padrão: `1`
  - **limit** (opcional): Limite de comentários por página.
    - Tipo: `integer`
    - Valor padrão: `20`

- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
      "page": 1,
      "limit": 20,
      "total": 5,
      "total_pages": 1,
      "comments": [
        {
          "id": 1,
          "content": "Este é um comentário.",
          "replies": [
            {
              "id": 2,
              "content": "Esta é uma resposta ao comentário."
            }
          ]
        }
      ]
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro interno ao listar comentários."
    }
    ```

---

### 4. Excluir Comentário

- **Endpoint**: `DELETE /comments/:id`
- **Descrição**: Exclui um comentário ou resposta. Apenas o criador do comentário ou um administrador pode excluir.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>"
  }
  ```
- **Parâmetros da Rota**:

  - **id** (obrigatório): ID do comentário a ser excluído.

- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
      "message": "Comentário excluído com sucesso."
    }
    ```
  - **403 (Sem Permissão)**:
    ```json
    {
      "error": "Forbidden",
      "message": "Você não tem permissão para excluir este comentário."
    }
    ```
  - **404 (Comentário Não Encontrado)**:
    ```json
    {
      "error": "Not Found",
      "message": "Comentário não encontrado."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro interno ao excluir comentário."
    }
    ```

---

### 5. Editar Comentário

- **Endpoint**: `PUT /comments/:id`
- **Descrição**: Edita um comentário. Apenas o criador do comentário ou um administrador pode editar.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>",
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Rota**:

  - **id** (obrigatório): ID do comentário a ser editado.

- **Corpo da Requisição**:

  ```json
  {
    "content": "Conteúdo atualizado do comentário."
  }
  ```

- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
      "message": "Comentário atualizado com sucesso."
    }
    ```
  - **403 (Sem Permissão)**:
    ```json
    {
      "error": "Forbidden",
      "message": "Você não tem permissão para editar este comentário."
    }
    ```
  - **404 (Comentário Não Encontrado)**:
    ```json
    {
      "error": "Not Found",
      "message": "Comentário não encontrado."
    }
    ```
  - **400 (Erro de Validação)**:
    ```json
    {
      "error": "Bad Request",
      "message": "O conteúdo do comentário não pode estar vazio."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro interno ao editar comentário."
    }
    ```

---

## 👍 Rotas de Reações

### 1. Adicionar/Atualizar/Remover Reação

- **Endpoint**: `POST /reactions`
- **Descrição**: Adiciona, atualiza ou remove uma reação (`like` ou `dislike`) a um comentário.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu_token>",
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:
  ```json
  {
    "comment_id": 1,
    "type": "like"
  }
  ```

---

## 👤 Rotas de Usuário

### 1. Atualizar Avatar do Usuário

- **Endpoint**: `POST /user/avatar`
- **Descrição**: Permite ao usuário atualizar sua imagem de avatar. A imagem enviada será carregada no Cloudinary, e o URL será salvo no banco de dados.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu-token>",
    "Content-Type": "multipart/form-data"
  }
  ```
- **Corpo da Requisição**:

  - Tipo: `form-data`
  - Campos:
    - **file**: O arquivo de imagem que será usado como avatar. Deve ser um dos tipos permitidos (`image/jpeg`, `image/png`, `image/gif`).

- **Observação**:
  - O arquivo não pode exceder 5 MB.
  - Formatos não suportados serão rejeitados com uma mensagem de erro.
  - Caso o upload para o Cloudinary falhe, a imagem não será atualizada.

---

### 2. Buscar Detalhes do Usuário

- **Endpoint**: `GET /user/:id`
- **Descrição**: Retorna informações públicas do usuário, como nome, avatar e descrição, com base no ID fornecido.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**: Não aplicável.

- **Resposta de Exemplo**:

  ```json
  {
    "id": 1,
    "username": "usuario_exemplo",
    "avatar": "https://res.cloudinary.com/<seu-cloud-name>/image/upload/v1234567890/avatars/avatar_1.jpg",
    "description": "Descrição do usuário."
  }
  ```

- **Observação**:
  - Apenas informações públicas são retornadas.
  - Caso o ID do usuário não exista, será retornado um erro 404.

---

### 3. Atualizar Informações do Usuário

- **Endpoint**: `PUT /user`
- **Descrição**: Permite ao usuário atualizar informações de perfil, como nome, descrição ou outros campos permitidos.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu-token>",
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:
  ```json
  {
    "username": "novo_nome"
  }
  ```
  ***

### 4. Atualizar Senha do Usuário

- **Endpoint**: `PUT /user/password`
- **Descrição**: Permite ao usuário atualizar senha.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu-token>",
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:
  ```json
  {
    "currentPassword": "987654321",
    "newPassword": "123456789"
  }
  ```

### 5. Listar Preferências do Usuário

- **Endpoint**: `GET /user/preferences`
- **Descrição**: Retorna as preferências de notificação configuradas pelo usuário autenticado.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
      "message": "Preferências do usuário recuperadas com sucesso.",
      "preferences": {
        "notify_replies": true,
        "notify_reactions": true,
        "notify_new_comments": false,
        "notify_new_episodes": false
      }
    }
    ```
  - **404 (Não Encontrado)**:
    ```json
    {
      "error": "Not Found",
      "message": "Preferências do usuário não encontradas."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao listar preferências do usuário."
    }
    ```

---

### 6. Atualizar Preferências do Usuário

- **Endpoint**: `PUT /user/preferences`
- **Descrição**: Atualiza as preferências de notificação do usuário autenticado.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>",
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:

  - Envie apenas os campos que deseja atualizar.

  ```json
  {
    "notify_replies": true,
    "notify_reactions": false,
    "notify_new_comments": true,
    "notify_new_episodes": false
  }
  ```

  - **notify_replies** (opcional): Receber notificações de respostas.
    - Tipo: `boolean`
    - Valor padrão: `true`
  - **notify_reactions** (opcional): Receber notificações de reações.
    - Tipo: `boolean`
    - Valor padrão: `true`
  - **notify_new_comments** (opcional): Receber notificações de novos comentários.
    - Tipo: `boolean`
    - Valor padrão: `false`
  - **notify_new_episodes** (opcional): Receber notificações de novos episódios.
    - Tipo: `boolean`
    - Valor padrão: `false`

- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
      "message": "Preferências do usuário atualizadas com sucesso."
    }
    ```
  - **404 (Não Encontrado)**:
    ```json
    {
      "error": "Not Found",
      "message": "Preferências do usuário não encontradas."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao atualizar preferências do usuário."
    }
    ```

---

## 🔔 Rotas de Notificações

### 1. Listar Notificações

- **Endpoint**: `GET /notifications`
- **Descrição**: Retorna as notificações do usuário autenticado, incluindo informações relacionadas ao comentário (como `anime_id` ou `episode_id`).
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
      "message": "Notificações recuperadas com sucesso.",
      "notifications": [
        {
          "id": 36,
          "user_id": 9,
          "type": "new_comment",
          "related_id": 63,
          "read": true,
          "created_at": "2024-12-12T13:42:53.715Z",
          "anime_id": 123,
          "episode_id": null
        }
      ]
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao listar notificações."
    }
    ```

---

### 2. Marcar Notificação como Lida

- **Endpoint**: `PUT /notifications/:id/read`
- **Descrição**: Marca uma notificação específica como lida.
- **Autenticação**: Obrigatória.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <token_do_usuario>"
  }
  ```
- **Parâmetros da Rota**:

  - **id** (obrigatório): ID da notificação que será marcada como lida.

- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
      "message": "Notificação marcada como lida com sucesso."
    }
    ```
  - **404 (Não Encontrado)**:
    ```json
    {
      "error": "Not Found",
      "message": "Notificação não encontrada ou você não tem permissão."
    }
    ```
  - **500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao marcar notificação como lida."
    }
    ```

---

### Exemplos de Uso no Frontend

1. **Redirecionar para o Anime**:

   - Caso `anime_id` esteja presente:
     ```javascript
     const redirectUrl = `/anime/${notification.anime_id}#comment-${notification.related_id}`;
     ```

2. **Redirecionar para o Episódio**:
   - Caso `episode_id` também esteja presente:
     ```javascript
     const redirectUrl = `/anime/${notification.anime_id}/episode/${notification.episode_id}#comment-${notification.related_id}`;
     ```

---
