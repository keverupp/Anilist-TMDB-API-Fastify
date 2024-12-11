# 📜 Documentação das Rotas

## Sumário

- [Rotas de Autenticação e Gestão de Tokens](#-rotas-de-autenticação-e-gestão-de-tokens)

  - [Registro](#1-registro)
  - [Login](#2-login)
  - [Logout](#3-logout)
  - [Renovação de Token](#4-renovação-de-token)
  - [Middleware de Autenticação](#middleware-de-autenticação)

- [Rotas de Animes e Episódios](#-rotas-de-animes-e-episódios)

  - [Seguir/Deixar de Seguir um Anime](#1-seguirdeixar-de-seguir-um-anime)
  - [Informações de um Anime](#2-informações-de-um-anime)
  - [Listar Episódios de um Anime](#3-importar-episódios-de-um-anime)
  - [Episódios Recentes](#4-listar-episódios-de-um-anime-com-paginação)
  - [Atualizar Episódios com Runtime Nulo](#5-atualizar-episódios-com-runtime-nulo)
  - [Adicionar Vídeos de um Anime](#6-adicionar-vídeos-de-um-anime)
  - [Consultar Vídeos](#7-consultar-vídeos)

- [Rotas de Comentários](#-rotas-de-comentários)

  - [Criar Comentário](#1-criar-comentário)
  - [Responder a Comentário](#2-responder-a-comentário)
  - [Listar Comentários](#3-listar-comentários)
  - [Excluir Comentário](#4-excluir-comentário)

- [Rotas de Reações](#-rotas-de-reações)

  - [Adicionar/Atualizar/Remover Reação](#1-adicionaratualizarremover-reação)

- [Rotas de Busca](#-rotas-de-busca)

  - [Buscar Títulos de Animes](#1-buscar-títulos-de-animes)
  - [Buscar e Inserir Animes na Base Local](#2-buscar-e-inserir-animes-na-base-local)

- [Rotas de Recuperação de Senha](#-rotas-de-recuperação-de-senha)

  - [Esqueci Minha Senha (Solicitar Redefinição)](#1-esqueci-minha-senha-solicitar-redefinição)
  - [Redefinir Senha](#2-redefinir-senha)

- [Rotas de Usuário](#-rotas-de-usuário)

  - [Atualizar Avatar do Usuário](#1-atualizar-avatar-do-usuário)
  - [Buscar Detalhes do Usuário](#2-buscar-detalhes-do-usuário)
  - [Atualizar Informações do Usuário](#3-atualizar-informações-do-usuário)
  - [Atualizar Senha do Usuário](#4-atualizar-senha-do-usuário)

- [Observações](#observações)

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

## 🍿 Rotas de Animes e Episódios

### 1. Seguir/Deixar de Seguir um Anime

- **Endpoint**: `POST /anime/follow`
- **Descrição**: Altera o status de seguir um anime pelo usuário autenticado.
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
    "anime_id": 171018
  }
  ```

---

### 2. Informações de um Anime

- **Endpoint**: `GET /anime/:id`
- **Descrição**: Retorna informações detalhadas sobre um anime.
- **Autenticação**: Não necessária (ajuste se necessário).
- **Parâmetros de Rota**:
  - `id`: ID do anime.

---

### 3. Importar Episódios de um Anime

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

### 4. Listar Episódios de um Anime com Paginação

- **Endpoint**: `GET /anime/:animeId/episodes`
- **Descrição**: Retorna os episódios de um anime previamente importados, com suporte a paginação.
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
      "episodes": [
        {
          "id": 1,
          "name": "Episódio 1",
          "episode_number": 1,
          "overview": "Introdução ao anime.",
          "air_date": "2024-01-01",
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
  - **Código 500** (em caso de erro):
    ```json
    {
      "error": "Erro ao listar episódios."
    }
    ```

- **Observação**:

  - Os episódios são retornados em ordem crescente de número do episódio (`episode_number`).
  - O total de episódios e o número de páginas são incluídos na resposta para auxiliar na paginação.

---

  ### 5. Atualizar Episódios com Runtime Nulo

- **Endpoint**: `PUT /episodes/update-runtime`
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
  - Certifique-se de que o banco de dados possui a coluna `updated_at` para rastrear atualizações.
  - A rota utiliza a API do TMDB. Verifique os limites de requisição para evitar bloqueios.

---

### 6. Adicionar Vídeos de um Anime

- **Endpoint**: `POST /tv/:series_id/videos`
- **Descrição**: Busca os vídeos de um Anime na API do TMDB e os armazena na base de dados. Evita duplicação utilizando a chave `key` como referência única.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Rota**:
  - **series_id** (obrigatório): O ID do anime na API do TMDB.
    - Tipo: `integer`
    - Exemplo: `/tv/240411/videos`

- **Respostas**:
  - **Código 201 (Sucesso)**:
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
  - **Código 404 (Nenhum vídeo encontrado)**:
    ```json
    {
      "message": "Nenhum vídeo encontrado para esta série."
    }
    ```
  - **Código 400 (Nenhum vídeo válido)**:
    ```json
    {
      "message": "Nenhum vídeo válido encontrado para inserir."
    }
    ```
  - **Código 500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao buscar e inserir vídeos."
    }
    ```

- **Observação**:
  - Apenas vídeos oficiais e válidos são inseridos no banco.
  - Se o vídeo já existir no banco (baseado no campo `key`), ele será ignorado automaticamente.

---

### 7. Consultar Vídeos

- **Endpoint**: `GET /videos`
- **Descrição**: Retorna os vídeos armazenados no banco de dados. Permite filtrar por anime (`show_id`) e suporte à paginação.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Parâmetros da Query**:
  - **show_id** (opcional): ID da série para filtrar os vídeos.
    - Tipo: `integer`
    - Exemplo: `show_id=240411`
  - **page** (opcional): Página atual da consulta.
    - Tipo: `integer`
    - Valor padrão: `1`
    - Exemplo: `page=2`
  - **limit** (opcional): Quantidade de vídeos por página.
    - Tipo: `integer`
    - Valor padrão: `10`
    - Exemplo: `limit=5`

- **Respostas**:
  - **Código 200 (Sucesso)**:
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
  - **Código 500 (Erro Interno)**:
    ```json
    {
      "error": "Erro ao buscar vídeos."
    }
    ```

- **Observação**:
  - Se `show_id` não for fornecido, retorna todos os vídeos disponíveis.
  - A resposta inclui metadados de paginação (`total`, `totalPages`, `currentPage`, `perPage`).

---

## 💬 Rotas de Comentários

### 1. Criar Comentário

- **Endpoint**: `POST /comments`
- **Descrição**: Cria um novo comentário em um anime ou episódio.
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
    "anime_id": 1,
    "episode_id": 2,
    "content": "Gostei muito do episódio!"
  }
  ```

---

### 2. Responder a Comentário

- **Endpoint**: `POST /comments/:id`
- **Descrição**: Cria uma resposta a um comentário existente.
- **Autenticação**: Necessária.
- **Parâmetros de Rota**:
  - `id`: ID do comentário a ser respondido.
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
    "anime_id": 1,
    "episode_id": 2,
    "content": "Concordo com você!"
  }
  ```

---

### 3. Listar Comentários

- **Endpoint**: `GET /comments`
- **Descrição**: Lista comentários de um anime ou episódio, com respostas aninhadas.
- **Autenticação**: Conforme a lógica da sua aplicação.
- **Headers** (se exigir autenticação):
  ```json
  {
    "Authorization": "Bearer <seu_token>"
  }
  ```
- **Query Parameters**:
  - `anime_id` (obrigatório): ID do anime.
  - `episode_id` (opcional): ID do episódio.
  - `page` (opcional): Página de resultados (ex: `?page=1`).
  - `limit` (opcional): Limite de resultados por página (ex: `?limit=20`).

Exemplo:

```
GET /comments?anime_id=171018&page=1&limit=1
```

---

### 4. Excluir Comentário

- **Endpoint**: `DELETE /comments/:id`
- **Descrição**: Exclui um comentário ou resposta.
- **Autenticação**: Necessária.
- **Parâmetros de Rota**:
  - `id`: ID do comentário a ser excluído.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu_token>"
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

## 👤 Rotas de Recuperação de Senha

### 1. Esqueci Minha Senha (Solicitar Redefinição)

- **Endpoint**: `POST /forgotPassword`
- **Descrição**: Gera um token de redefinição de senha e envia um email para o endereço fornecido, caso o email esteja cadastrado.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:
  ```json
  {
    "email": "usuario@example.com"
  }
  ```
- **Observação**: Mesmo se o email não existir, a resposta será genérica.

---

### 2. Redefinir Senha

- **Endpoint**: `POST /resetPassword`
- **Descrição**: Redefine a senha do usuário usando um token de redefinição válido e não expirado.
- **Autenticação**: Não necessária.
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:
  ```json
  {
    "token": "token-de-redefinicao",
    "new_password": "NovaSenhaSegura123"
  }
  ```
- **Observação**: Se o token for inválido ou expirado, retornará erro. Caso contrário, a senha é atualizada e o token removido.

## 🔑 Rotas de Informações do Usuario

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

---

## 📌 Observações

- Tokens expirados devem ser removidos da tabela `tokens` periodicamente.
- O registro e login incluem validações básicas para `username`, `email` e `password`.
- Autenticação pode ser adicionada ou removida em rotas conforme a necessidade do projeto.
- Paginação está disponível em `/comments` via parâmetros `page` e `limit`.
- Ajuste descrições de rotas conforme a lógica de negócio da sua aplicação.

---
