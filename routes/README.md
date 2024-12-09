# 📜 Documentação das Rotas

## Sumário

- [Rotas de Autenticação e Gestão de Tokens](#-rotas-de-autenticação-e-gestão-de-tokens)
  - [Registro](#1-registro)
  - [Login](#2-login)
  - [Logout](#3-logout)
  - [Renovação de Token](#4-renovação-de-token)
  - [Middleware de Autenticação](#middleware-de-autenticação)

- [Rotas de Animes e Episódios](#-rotas-de-animes-e-episódios)
  - [Popular Gêneros](#1-popular-gêneros)
  - [Seguir/Deixar de Seguir um Anime](#2-seguirdeixar-de-seguir-um-anime)
  - [Informações de um Anime](#3-informações-de-um-anime)
  - [Listar Episódios de um Anime](#4-listar-episódios-de-um-anime)
  - [Episódios Recentes](#5-episódios-recentes)
  - [Listar Animes da Temporada](#6-listar-animes-da-temporada)

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
  ---

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