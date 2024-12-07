# 📜 Documentação da API

## Sumário

- [Rotas de Autenticação e Gestão de Tokens](#rotas-de-autenticação-e-gestão-de-tokens)
  - [Registro](#1-registro)
  - [Login](#2-login)
  - [Logout](#3-logout)
  - [Renovação de Token](#4-renovação-de-token)
  - [Middleware de Autenticação](#middleware-de-autenticação)
  
- [Rotas de Animes e Episódios](#rotas-de-animes-e-episódios)
  - [Popular Gêneros](#1-popular-gêneros)
  - [Seguir/Deixar de Seguir um Anime](#2-seguirdeixar-de-seguir-um-anime)
  - [Informações de um Anime](#3-informações-de-um-anime)
  - [Listar Episódios de um Anime](#4-listar-episódios-de-um-anime)
  - [Episódios Recentes](#5-episódios-recentes)
  - [Listar Animes da Temporada](#6-listar-animes-da-temporada)
  
- [Rotas de Comentários](#rotas-de-comentários)
  - [Criar Comentário](#1-criar-comentário)
  - [Responder a Comentário](#2-responder-a-comentário)
  - [Listar Comentários](#3-listar-comentários)
  - [Excluir Comentário](#4-excluir-comentário)
  
- [Rotas de Reações](#rotas-de-reações)
  - [Adicionar/Atualizar/Remover Reação](#1-adicionaratualizarremover-reação)
  
- [Rotas de Busca](#rotas-de-busca)
  - [Busca Local por Títulos](#1-busca-local-por-títulos)
  - [Busca na API Externa](#2-busca-na-api-externa)

- [Observações](#observações)

---

## Rotas de Autenticação e Gestão de Tokens 🗂️

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

## Rotas de Animes e Episódios

### 1. Popular Gêneros
- **Endpoint**: `POST /populate-genres`
- **Descrição**: Popula a base de dados com gêneros de anime.
- **Autenticação**: Não necessária (ajuste se necessário).
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**: *(não exigido no exemplo)*

---

### 2. Seguir/Deixar de Seguir um Anime
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

### 3. Informações de um Anime
- **Endpoint**: `GET /anime/:id`
- **Descrição**: Retorna informações detalhadas sobre um anime.
- **Autenticação**: Não necessária (ajuste se necessário).
- **Parâmetros de Rota**:
  - `id`: ID do anime.

---

### 4. Listar Episódios de um Anime
- **Endpoint**: `GET /episodes/:id`
- **Descrição**: Retorna a lista de episódios de um anime específico.
- **Autenticação**: Não necessária (ajuste se necessário).
- **Parâmetros de Rota**:
  - `id`: ID do anime.

---

### 5. Episódios Recentes
- **Endpoint**: `GET /episodes/new`
- **Descrição**: Retorna os episódios mais recentes adicionados.
- **Autenticação**: Não necessária (ajuste se necessário).

---

### 6. Listar Animes da Temporada
- **Endpoint**: `GET /season`
- **Descrição**: Retorna a lista de animes da temporada atual.
- **Autenticação**: Não necessária (ajuste se necessário).

---

## Rotas de Comentários

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
- **Autenticação**: Conforme a lógica da sua aplicação. (Originalmente necessitava, mas pode ser público se desejado.)
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

## Rotas de Reações

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

Para remover a reação, basta enviar o mesmo `comment_id` e `type` já existente. Caso a lógica interna detecte que a mesma reação já existe, ela será removida.

---

## Rotas de Busca 🔎

### 1. Busca Local por Títulos
- **Endpoint**: `GET /search`
- **Descrição**: Busca animes pelo título no banco local.
- **Autenticação**: Não necessária (ajuste se necessário).
- **Query Parameters**:
  - `query`: Termo de busca.
  
Exemplo:  
```
GET /search?query=Dan
```

---

### 2. Busca na API Externa
- **Endpoint**: `POST /search-api`
- **Descrição**: Envia uma query para uma fonte externa e retorna resultados.
- **Autenticação**: Não necessária (ajuste se necessário).
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição**:
  ```json
  {
    "query": "Reirei Genso"
  }
  ```

---

## Observações 📌

- Tokens expirados devem ser removidos da tabela `tokens` periodicamente.
- O registro e login incluem validações básicas para `username`, `email` e `password`.
- Autenticação pode ser adicionada ou removida em rotas conforme a necessidade do projeto.
- Paginação está disponível em `/comments` via parâmetros `page` e `limit`.
- Ajuste descrições de rotas conforme a lógica de negócio da sua aplicação.