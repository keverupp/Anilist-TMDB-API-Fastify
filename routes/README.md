- [🔒 Rotas de Autenticação e Gestão de Tokens](#-rotas-de-autenticação-e-gestão-de-tokens)
  - [1. Registro](#1-registro)
  - [2. Login](#2-login)
  - [3. Logout](#3-logout)
  - [4. Renovação de Token](#4-renovação-de-token)
  - [5. Recuperação de Senha](#5-recuperação-de-senha)
    - [5.1 Solicitação de Redefinição de Senha](#51-solicitação-de-redefinição-de-senha)
    - [5.2 Redefinição de Senha](#52-redefinição-de-senha)
  - [Middleware de Autenticação](#middleware-de-autenticação)
- [🔎 Rotas de Busca](#-rotas-de-busca)
  - [1. Buscar Títulos de Animes](#1-buscar-títulos-de-animes)
  - [2. Buscar e Inserir Animes na Base Local](#2-buscar-e-inserir-animes-na-base-local)
  - [Exemplo de Respostas](#exemplo-de-respostas)
    - [**1. Buscar Títulos de Animes**](#1-buscar-títulos-de-animes-1)
    - [**2. Buscar e Inserir Animes na Base Local**](#2-buscar-e-inserir-animes-na-base-local-1)
- [🍿 Rotas de Animes](#-rotas-de-animes)
  - [1. Gerenciar Anime Seguido](#1-gerenciar-anime-seguido)
  - [2. Listar Animes Seguidos](#2-listar-animes-seguidos)
  - [3. Informações de um Anime](#3-informações-de-um-anime)
  - [4. Listar Todos os Animes](#4-listar-todos-os-animes)
  - [5. Listar Animes com Status `Returning Series`](#5-listar-animes-com-status-returning-series)
  - [6. Listar Temporadas de um Anime](#6-listar-temporadas-de-um-anime)
  - [7. Importar Episódios de um Anime](#7-importar-episódios-de-um-anime)
  - [8. Listar Episódios de um Anime](#8-listar-episódios-de-um-anime)
  - [9. Atualizar Episódios Pendentes](#9-atualizar-episódios-pendentes)
  - [10. Listar Últimos Episódios Atualizados (Apenas Returning Series)](#10-listar-últimos-episódios-atualizados-apenas-returning-series)
  - [11. Animes com Estreia Hoje (Cacheado)](#11-animes-com-estreia-hoje-cacheado)
  - [12. Sincronizar Animes com Estreia Hoje (Inserção no Banco)](#12-sincronizar-animes-com-estreia-hoje-inserção-no-banco)
- [📺 Rotas de Vídeos](#-rotas-de-vídeos)
  - [1. Adicionar Vídeos de um Anime](#1-adicionar-vídeos-de-um-anime)
  - [2. Consultar Vídeos](#2-consultar-vídeos)
- [💬 Rotas de Comentários](#-rotas-de-comentários)
  - [1. Criar Comentário](#1-criar-comentário)
  - [2. Responder Comentário](#2-responder-comentário)
  - [3. Listar Comentários](#3-listar-comentários)
  - [4. Excluir Comentário](#4-excluir-comentário)
  - [5. Editar Comentário](#5-editar-comentário)
- [👍 Rotas de Reações](#-rotas-de-reações)
  - [1. POST /reactions](#1-post-reactions)
- [👤 Rotas de Usuário](#-rotas-de-usuário)
  - [1. Atualizar Avatar do Usuário](#1-atualizar-avatar-do-usuário)
  - [2. Buscar Detalhes do Usuário](#2-buscar-detalhes-do-usuário)
  - [3. Atualizar Informações do Usuário](#3-atualizar-informações-do-usuário)
  - [4. Atualizar Senha do Usuário](#4-atualizar-senha-do-usuário)
  - [5. Listar Preferências do Usuário](#5-listar-preferências-do-usuário)
  - [6. Atualizar Preferências do Usuário](#6-atualizar-preferências-do-usuário)
- [🔔 Rotas de Notificações](#-rotas-de-notificações)
  - [1. Listar Notificações](#1-listar-notificações)
  - [2. Marcar Notificação como Lida](#2-marcar-notificação-como-lida)
  - [Exemplos de Uso no Frontend](#exemplos-de-uso-no-frontend)
- [📊 Rotas de Ranking](#-rotas-de-ranking)
  - [1. Obter Ranking de Animes](#1-obter-ranking-de-animes)
- [⭐ Rotas de Votação](#-rotas-de-votação)
  - [1. Avaliar um Anime com Estrelas](#1-avaliar-um-anime-com-estrelas)
  - [2. Escolher o Melhor Anime da Temporada](#2-escolher-o-melhor-anime-da-temporada)
  - [3. Visualizar Minhas Avaliações](#3-visualizar-minhas-avaliações)
- [🔄 Códigos de Erro Comuns](#-códigos-de-erro-comuns)
- [📆 Temporadas](#-temporadas)

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
- **Descrição**: Autentica o usuário e retorna um token JWT com expiração baseada no campo `rememberMe`.  
- **Corpo da Requisição**:

  ```json
  {
    "email": "usuario@example.com",
    "password": "senhaSegura123",
    "rememberMe": true
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Login realizado com sucesso.",
    "user": {
      "id": 1,
      "username": "usuario123",
      "email": "usuario@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- **Observação**:
  - O token **é retornado no corpo da resposta**, não via cookie.
  - O tempo de expiração do token é controlado dinamicamente:
    - `30 dias` se `rememberMe = true`
    - `3 dias` se `rememberMe = false` ou omitido
  - A validade do token também é armazenada no banco de dados (`tokens.expires_at`) e validada a cada requisição via middleware.

---

### 3. Logout

- **Endpoint**: `POST /logout`  
- **Descrição**: Invalida o token armazenado no cookie e remove o cookie do navegador.  
- **Requisição**:
  - Nenhum corpo necessário. O token é lido automaticamente do cookie.
- **Resposta**:

  ```json
  {
    "message": "Logout efetuado com sucesso."
  }
  ```

---

### 4. Renovação de Token

- **Endpoint**: `POST /refreshToken`  
- **Descrição**: Gera um novo token JWT se o token armazenado no cookie ainda for válido.  
- **Requisição**:
  - Nenhum corpo necessário. O token é lido automaticamente do cookie.
- **Resposta**:

  ```json
  {
    "message": "Token renovado com sucesso."
  }
  ```

- **Observação**:
  - Um novo token é emitido e atualizado no cookie com validade de 7 dias.

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
- **Descrição**: Alterna entre seguir ou deixar de seguir um anime.

**Autenticação**: Obrigatória  
**Headers**:

```json
{
  "Authorization": "Bearer <token_do_usuario>",
  "Content-Type": "application/json"
}
```

**Corpo da Requisição**:

```json
{ "anime_id": 123 }
```

**Respostas**:

- `201`:

```json
{ "message": "Anime seguido com sucesso." }
```

- `200`:

```json
{ "message": "Você parou de seguir o anime." }
```

- `400` / `404` / `500`: Retorna mensagens de erro conforme o caso.

---

### 2. Listar Animes Seguidos

- **Endpoint**: `GET /anime/followed`  
- **Descrição**: Retorna a lista de animes que o usuário está seguindo.

**Autenticação**: Obrigatória  
**Headers**:

```json
{ "Authorization": "Bearer <token_do_usuario>" }
```

**Resposta**:

```json
{
  "message": "Lista de animes seguidos.",
  "animes": [
    {
      "id": 1,
      "name": "Naruto",
      "poster_path": "https://example.com/naruto.jpg"
    }
  ]
}
```

---

### 3. Informações de um Anime

- **Endpoint**: `GET /anime/:id`  
- **Descrição**: Retorna informações detalhadas de um anime.

**Parâmetro**:  

- `id`: ID do anime.

---

### 4. Listar Todos os Animes

- **Endpoint**: `GET /animes`  
- **Descrição**: Lista animes com filtros (`name`, `genres`, `keywords`, `status`), ordenação e paginação.

**Query Parameters**:

- `name`, `genres`, `keywords`, `status`, `fields`, `page`, `limit`, `sort_by`, `sort_order`

**Resposta**:

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
      "poster_path": "/naruto-poster.jpg"
    }
  ]
}
```

---

### 5. Listar Animes com Status `Returning Series`

- **Endpoint**: `GET /animes/returning-series`  
- **Descrição**: Retorna animes com status `Returning Series`, com suporte a paginação e seleção de campos.

**Query Parameters**:

- `limit`, `page`, `fields`

**Resposta**:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Anime Exemplo",
      "poster_path": "/path.jpg"
    }
  ],
  "meta": {
    "limit": 5,
    "page": 1,
    "count": 1
  }
}
```

---

### 6. Listar Temporadas de um Anime

- **Endpoint**: `GET /animes/:anime_id/seasons`  
- **Descrição**: Lista as temporadas de um anime.

**Parâmetros**:

- `anime_id`: ID do anime  
- Query: `page`, `limit`

**Resposta**:

```json
{
  "seasons": [
    {
      "id": 1,
      "season": "Winter",
      "year": 2023
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

### 7. Importar Episódios de um Anime

- **Endpoint**: `POST /anime/:animeId/episodes`  
- **Descrição**: Importa episódios da API TMDB para um anime cadastrado.

**Parâmetro**:

- `animeId`: ID do anime

**Resposta**:

```json
{
  "message": "Episódios importados com sucesso!"
}
```

---

### 8. Listar Episódios de um Anime

- **Endpoint**: `GET /anime/:animeId/episodes`  
- **Descrição**: Lista episódios com filtros de temporada e paginação.

**Parâmetros**:

- `animeId`, `season`, `year`, `page`, `limit`

**Resposta**:

```json
{
  "animeId": 123,
  "episodes": [
    {
      "id": 1,
      "episode_number": 1,
      "overview": "Introdução ao anime."
    }
  ],
  "pagination": {
    "total": 12,
    "totalPages": 2,
    "currentPage": 1,
    "perPage": 10
  }
}
```

---

### 9. Atualizar Episódios Pendentes

- **Endpoint**: `PUT /episodes/update-pending`  
- **Descrição**: Atualiza episódios com `is_pending_update = true` se o `air_date` já passou. Se a sinopse continuar indisponível, o episódio permanece como pendente.

**Comportamento**:

- Busca na API TMDB usando `show_id`, `season`, `episode_number`
- Atualiza `overview`, `runtime`, `vote_average`, etc.

**Resposta**:

```json
{
  "message": "Episódios pendentes atualizados com sucesso!"
}
```

---

### 10. Listar Últimos Episódios Atualizados (Apenas Returning Series)

- **Endpoint**: `GET /episodes/recent-updates`  
- **Descrição**: Retorna o episódio mais recentemente atualizado de cada anime com status `Returning Series`. Apenas episódios lançados e com sinopse válida são retornados.

**Query Parameters**:

- `limit`, `page`

**Resposta**:

```json
{
  "data": [
    {
      "anime_id": 123,
      "anime_name": "Exemplo",
      "episode_number": 4,
      "overview": "O episódio mais recente com sinopse disponível."
    }
  ],
  "meta": {
    "limit": 10,
    "page": 1,
    "count": 1
  }
}
```

---

### 11. Animes com Estreia Hoje (Cacheado)

- **Endpoint**: `GET /animes/airing-today`  
- **Descrição**: Retorna os animes que estreiam na data atual utilizando cache armazenado no banco. Na primeira requisição do dia, consulta a API da TMDB e armazena a resposta processada. Nas próximas, retorna direto do banco.

**Resposta**:

```json
{
  "page": 1,
  "results": [
    {
      "id": 261091,
      "name": "The Shiunji Family Children",
      "poster_path": "https://image.tmdb.org/t/p/w500/iSSYooLNjjNvbGSqAxnL8LgtSMP.jpg",
      "backdrop_path": "https://image.tmdb.org/t/p/w1280/tjQrXMEWxAkA5Uo7261NDZfoyn1.jpg",
      "overview": "O amor entre irmão e irmã...",
      "first_air_date": "2025-04-08",
      "vote_average": 9.0,
      "vote_count": 1
    }
  ],
  "total_pages": 1,
  "total_results": 7
}
```

---

### 12. Sincronizar Animes com Estreia Hoje (Inserção no Banco)

- **Endpoint**: `GET /animes/airing-today/sync`  
- **Descrição**: Consulta a API da TMDB por animes com estreia na data atual (`first_air_date = today`), insere ou atualiza os títulos principais e títulos alternativos no banco de dados.

**Resposta**:

```json
{
  "message": "Sincronização concluída com sucesso.",
  "total_titles": 7,
  "total_alternative_titles": 15
}
```

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

### 1. POST /reactions

Adiciona ou altera uma reação (“upvote” ou “downvote”) a um comentário.

- **Endpoint**:
  `POST /reactions`
- **Descrição**:

  - Se o usuário ainda **não** reagiu ao comentário, cria um novo voto.
  - Se já houver reação **diferente**, atualiza para o novo tipo.
  - Se já houver reação **igual**, retorna erro 400 informando que o voto já existe.
    Após a operação bem-sucedida, sempre retorna o estado atualizado das contagens.
- **Autenticação**:
  Bearer Token (usuário logado)
- **Headers**:

  ```http
  Authorization: Bearer <seu_token>
  Content-Type: application/json
  ```

- **Corpo da Requisição**:

  ```json
  {
    "comment_id": 123,
    "type": "upvote"    // ou "downvote"
  }
  ```

- **Respostas**:

  - **200 OK**

    ```json
    {
      "upvotes": 10,           // total de upvotes no comentário
      "downvotes": 2,          // total de downvotes no comentário
      "score": 8,              // upvotes – downvotes
      "userReaction": "upvote" // reação atual do usuário
    }
    ```

  - **400 Bad Request**

    - Dados inválidos (faltando `comment_id` ou `type` incorreto):

      ```json
      { "error": "Dados inválidos." }
      ```

    - Reação já existente no mesmo tipo:

      ```json
      { "error": "Você já reagiu dessa forma a este comentário." }
      ```

  - **500 Internal Server Error**

    ```json
    { "error": "Erro interno ao processar a reação." }
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

## 📊 Rotas de Ranking

### 1. Obter Ranking de Animes

- **Endpoint**: `GET /anime/ranking`
- **Descrição**: Retorna o ranking de animes com base nos critérios especificados. Pode exibir tanto o ranking por estrelas (média de avaliações) quanto o ranking por escolha de melhor anime da temporada.
- **Autenticação**: Não necessária.
- **Headers**:

  ```json
  {
    "Content-Type": "application/json"
  }
  ```

- **Parâmetros da Query**:
  - `page` (opcional): Número da página para paginação (padrão: 1)
  - `limit` (opcional): Quantidade de itens por página (padrão: 10)
  - `season` (opcional): Temporada específica (verão, outono, inverno, primavera). Se não fornecido, usa a temporada atual.
  - `year` (opcional): Ano específico. Se não fornecido, usa o ano atual.
  - `genres` (opcional): Filtro por gêneros, separados por vírgula (ex: "ação,aventura,comédia")
  - `keywords` (opcional): Filtro por palavras-chave, separadas por vírgula
  - `ranking_type` (opcional): Tipo de ranking - "stars" para avaliações com estrelas (padrão) ou "best_pick" para melhores escolhidos
  - `sort_by` (opcional): Campo para ordenação - "stars" ou "vote_count" (padrão: "stars")
  - `sort_order` (opcional): Direção da ordenação - "asc" ou "desc" (padrão: "desc")

- **Resposta de Exemplo (Ranking por Estrelas)**:

  ```json
  {
    "pagination": {
      "total": 45,
      "totalPages": 5,
      "currentPage": 1,
      "perPage": 10
    },
    "sort": {
      "field": "stars",
      "order": "desc"
    },
    "filters": {
      "ranking_type": "stars",
      "season": "inverno",
      "year": 2025,
      "genres": ["ação", "aventura"],
      "keywords": []
    },
    "data": [
      {
        "position": 1,
        "anime_id": 123,
        "name": "Attack on Titan",
        "original_name": "進撃の巨人",
        "poster_path": "/path/to/image.jpg",
        "stars": 4.8,
        "vote_count": 352
      },
      {
        "position": 2,
        "anime_id": 456,
        "name": "Demon Slayer",
        "original_name": "鬼滅の刃",
        "poster_path": "/path/to/image.jpg",
        "stars": 4.7,
        "vote_count": 289
      }
      // Mais animes...
    ]
  }
  ```

- **Resposta de Exemplo (Ranking por Melhor da Temporada)**:

  ```json
  {
    "pagination": {
      "total": 45,
      "totalPages": 5,
      "currentPage": 1,
      "perPage": 10
    },
    "sort": {
      "field": "vote_count",
      "order": "desc"
    },
    "filters": {
      "ranking_type": "best_pick",
      "season": "inverno",
      "year": 2025,
      "genres": [],
      "keywords": []
    },
    "data": [
      {
        "position": 1,
        "anime_id": 123,
        "name": "Attack on Titan",
        "original_name": "進撃の巨人",
        "poster_path": "/path/to/image.jpg",
        "vote_count": 187
      },
      {
        "position": 2,
        "anime_id": 456,
        "name": "Demon Slayer",
        "original_name": "鬼滅の刃",
        "poster_path": "/path/to/image.jpg",
        "vote_count": 156
      }
      // Mais animes...
    ]
  }
  ```

- **Observação**:
  - Os animes são classificados por sua posição no ranking.
  - Para ranking tipo "stars", os resultados incluem a média de estrelas (0-5).
  - Para ranking tipo "best_pick", os resultados mostram apenas a contagem de votos.
  - A temporada é determinada automaticamente se não for especificada.

---

## ⭐ Rotas de Votação

### 1. Avaliar um Anime com Estrelas

- **Endpoint**: `POST /anime/rate`
- **Descrição**: Permite que um usuário avalie um anime com uma classificação de 0 a 5 estrelas (permitindo meias estrelas).
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
    "anime_id": 123,
    "stars": 4.5
  }
  ```

- **Resposta (Novo Voto)**:

  ```json
  {
    "message": "Avaliação para \"Attack on Titan\" registrada com sucesso.",
    "data": {
      "anime_id": 123,
      "stars": 4.5,
      "season": "inverno",
      "year": 2025
    }
  }
  ```

- **Resposta (Atualização de Voto)**:

  ```json
  {
    "message": "Avaliação para \"Attack on Titan\" atualizada com sucesso.",
    "data": {
      "anime_id": 123,
      "stars": 4.5,
      "season": "inverno",
      "year": 2025
    }
  }
  ```

- **Observação**:
  - Um usuário pode votar em múltiplos animes por temporada.
  - Os valores possíveis para `stars` são: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5 e 5.
  - A temporada é determinada automaticamente com base no status do anime:
    - Para animes marcados como `is_current_season = true`, usa a temporada atual
    - Para animes marcados como `is_current_season = false`, usa a temporada baseada em `first_air_date`

---

### 2. Escolher o Melhor Anime da Temporada

- **Endpoint**: `POST /anime/best-pick`
- **Descrição**: Permite que um usuário escolha qual anime considera o melhor da temporada.
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
    "anime_id": 456
  }
  ```

- **Resposta (Primeira Escolha)**:

  ```json
  {
    "message": "\"Demon Slayer\" foi escolhido como seu anime favorito da temporada.",
    "data": {
      "anime_id": 456,
      "season": "inverno",
      "year": 2025
    }
  }
  ```

- **Resposta (Mudança de Escolha)**:

  ```json
  {
    "message": "Sua escolha para o melhor anime da temporada foi alterada de \"Attack on Titan\" para \"Demon Slayer\".",
    "data": {
      "anime_id": 456,
      "previous_anime_id": 123,
      "season": "inverno",
      "year": 2025
    }
  }
  ```

- **Observação**:
  - Um usuário só pode escolher um único anime como o melhor da temporada.
  - Escolhas subsequentes substituirão a escolha anterior.
  - A temporada é determinada automaticamente com base no status do anime:
    - Para animes marcados como `is_current_season = true`, usa a temporada atual
    - Para animes marcados como `is_current_season = false`, usa a temporada baseada em `first_air_date`

---

### 3. Visualizar Minhas Avaliações

- **Endpoint**: `GET /anime/my-ratings`
- **Descrição**: Retorna todas as avaliações e a escolha do melhor anime feitas pelo usuário autenticado na temporada atual.
- **Autenticação**: Necessária.
- **Headers**:

  ```json
  {
    "Authorization": "Bearer <seu-token>",
    "Content-Type": "application/json"
  }
  ```

- **Resposta de Exemplo**:

  ```json
  {
    "season": "inverno",
    "year": 2025,
    "ratings": [
      {
        "anime_id": 123,
        "stars": 4.5,
        "updated_at": "2025-01-10T15:30:45Z",
        "name": "Attack on Titan",
        "poster_path": "/path/to/image.jpg"
      },
      {
        "anime_id": 456,
        "stars": 5.0,
        "updated_at": "2025-01-15T18:22:10Z",
        "name": "Demon Slayer",
        "poster_path": "/path/to/image.jpg"
      }
      // Mais avaliações...
    ],
    "best_pick": {
      "anime_id": 456,
      "name": "Demon Slayer",
      "poster_path": "/path/to/image.jpg"
    }
  }
  ```

- **Observação**:
  - A resposta inclui tanto as avaliações com estrelas quanto a escolha do melhor anime (se houver).
  - As avaliações são ordenadas por data de atualização (mais recentes primeiro).
  - Se o usuário não tiver escolhido um melhor anime, o campo `best_pick` será `null`.

---

## 🔄 Códigos de Erro Comuns

- **400 Bad Request**: Parâmetros inválidos ou ausentes
  - Anime ID ausente
  - Avaliação em estrelas fora do intervalo válido (0-5, com incrementos de 0.5)

- **401 Unauthorized**: Token de autenticação ausente ou inválido

- **404 Not Found**: Recurso não encontrado
  - Anime não encontrado
  - Gêneros ou keywords não encontrados

- **500 Internal Server Error**: Erro no servidor durante o processamento da requisição

---

## 📆 Temporadas

O sistema define automaticamente as temporadas com base nos meses:

- **Verão**: Dezembro, Janeiro, Fevereiro
- **Outono**: Março, Abril, Maio
- **Inverno**: Junho, Julho, Agosto
- **Primavera**: Setembro, Outubro, Novembro

Para animes em exibição atual (`is_current_season = true`), a temporada é determinada pela data atual.
Para animes antigos (`is_current_season = false`), a temporada é determinada pela data de lançamento (`first_air_date`).
