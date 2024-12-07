
## 🛠️ Rotas de Autenticação e CIA

### 1. **Registro**

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

- **Respostas**:
  - **201 Created**: Usuário registrado com sucesso.
    ```json
    {
      "message": "Usuário registrado com sucesso.",
      "user": {
        "id": 1,
        "username": "usuario123",
        "email": "usuario@example.com"
      }
    }
    ```
  - **400 Bad Request**: Erro de validação (username curto, email inválido, senha curta).
  - **500 Internal Server Error**: Erro interno do servidor.

---

### 2. **Login**

- **Endpoint**: `POST /login`
- **Descrição**: Autentica o usuário e retorna um token JWT.
- **Corpo da Requisição**:

  ```json
  {
    "email": "usuario@example.com",
    "password": "senhaSegura123"
  }
  ```

- **Respostas**:
  - **200 OK**: Login bem-sucedido.
    ```json
    {
      "message": "Login realizado com sucesso.",
      "user": {
        "id": 1,
        "username": "usuario123",
        "email": "usuario@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR..."
    }
    ```
  - **401 Unauthorized**: Credenciais inválidas.
  - **500 Internal Server Error**: Erro interno do servidor.

---

### 3. **Logout**

- **Endpoint**: `POST /logout`
- **Descrição**: Remove o token JWT da tabela `tokens`, invalidando-o.
- **Corpo da Requisição**:

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

- **Respostas**:
  - **200 OK**: Logout bem-sucedido.
    ```json
    {
      "message": "Logout efetuado com sucesso."
    }
    ```
  - **400 Bad Request**: Token não enviado.
  - **404 Not Found**: Token não encontrado.
  - **500 Internal Server Error**: Erro interno do servidor.

---

### 4. **Renovação de Token**

- **Endpoint**: `POST /refreshToken`
- **Descrição**: Gera um novo token JWT se o token atual for válido e ainda não tiver expirado.
- **Corpo da Requisição**:

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

- **Respostas**:
  - **200 OK**: Token renovado com sucesso.
    ```json
    {
      "message": "Token renovado com sucesso.",
      "token": "novoTokenAqui..."
    }
    ```
  - **400 Bad Request**: Token não enviado.
  - **401 Unauthorized**: Token inválido ou expirado.
  - **500 Internal Server Error**: Erro interno do servidor.

---

## 🔒 Middleware

### `authMiddleware.js`

- **Descrição**: Middleware para proteger rotas que requerem autenticação.
- **Funcionamento**:
  - Valida o token JWT enviado no cabeçalho `Authorization`.
  - Verifica se o token existe na tabela `tokens` e se não está expirado.
  - Anexa o `user` ao objeto `req` se o token for válido.

- **Uso**:

  Em rotas protegidas, adicione o middleware:

  ```javascript
  fastify.get("/protected", { preHandler: authMiddleware }, async (req, reply) => {
    return reply.send({ message: "Acesso autorizado.", user: req.user });
  });
  ```

- **Respostas do Middleware**:
  - **401 Unauthorized**: Token ausente, inválido ou expirado.

Aqui está a documentação das rotas de comentários e reações:

---

## **Rotas de Comentários**

### **1. Criar Comentário**
- **Endpoint**: `POST /comments`
- **Descrição**: Cria um novo comentário em um episódio ou anime.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu_token>",
    "Content-Type": "application/json"
  }
  ```
- **Body**:
  ```json
  {
    "anime_id": 1,
    "episode_id": 2,
    "content": "Gostei muito do episódio!"
  }
  ```
- **Respostas**:
  - **201 Created**:
    ```json
    {
      "message": "Comentário criado com sucesso.",
      "commentId": 10
    }
    ```
  - **400 Bad Request**:
    ```json
    {
      "error": "Invalid data",
      "message": "Anime ID e conteúdo são obrigatórios."
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "error": "Erro interno ao criar comentário."
    }
    ```

---

### **2. Responder a Comentário**
- **Endpoint**: `POST /comments/:id`
- **Descrição**: Cria uma resposta a um comentário específico.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu_token>",
    "Content-Type": "application/json"
  }
  ```
- **Body**:
  ```json
  {
    "anime_id": 1,
    "episode_id": 2,
    "content": "Concordo com você!"
  }
  ```
- **Respostas**:
  - **201 Created**:
    ```json
    {
      "message": "Comentário criado com sucesso.",
      "commentId": 11
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "error": "Not Found",
      "message": "Comentário pai não encontrado."
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "error": "Erro interno ao criar comentário."
    }
    ```

---

### **3. Listar Comentários**
- **Endpoint**: `GET /comments`
- **Descrição**: Lista os comentários de um anime ou episódio, incluindo respostas aninhadas.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu_token>"
  }
  ```
- **Query Parameters**:
  - `anime_id` (obrigatório): ID do anime.
  - `episode_id` (opcional): ID do episódio.
- **Respostas**:
  - **200 OK**:
    ```json
    [
      {
        "id": 1,
        "anime_id": 1,
        "episode_id": 2,
        "parent_id": null,
        "user_id": 1,
        "content": "Gostei muito do episódio!",
        "replies": [
          {
            "id": 2,
            "anime_id": 1,
            "episode_id": 2,
            "parent_id": 1,
            "user_id": 2,
            "content": "Eu também gostei!"
          }
        ]
      }
    ]
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "error": "Erro interno ao listar comentários."
    }
    ```

---

### **4. Excluir Comentário**
- **Endpoint**: `DELETE /comments/:id`
- **Descrição**: Exclui um comentário ou resposta.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu_token>"
  }
  ```
- **Respostas**:
  - **200 OK**:
    ```json
    {
      "message": "Comentário excluído com sucesso."
    }
    ```
  - **403 Forbidden**:
    ```json
    {
      "error": "Forbidden",
      "message": "Você não tem permissão para excluir este comentário."
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "error": "Not Found",
      "message": "Comentário não encontrado."
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "error": "Erro interno ao excluir comentário."
    }
    ```

---

## **Rotas de Reações**

### **1. Adicionar ou Atualizar Reação**
- **Endpoint**: `POST /reactions`
- **Descrição**: Adiciona ou atualiza uma reação (`like` ou `dislike`) a um comentário.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu_token>",
    "Content-Type": "application/json"
  }
  ```
- **Body**:
  ```json
  {
    "comment_id": 1,
    "type": "like"
  }
  ```
- **Respostas**:
  - **201 Created**:
    ```json
    {
      "message": "Reação adicionada."
    }
    ```
  - **200 OK**:
    ```json
    {
      "message": "Reação atualizada."
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "error": "Not Found",
      "message": "Comentário não encontrado."
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "error": "Erro interno ao reagir ao comentário."
    }
    ```

---

### **2. Remover Reação**
- **Endpoint**: `DELETE /reactions`
- **Descrição**: Remove uma reação existente.
- **Autenticação**: Necessária.
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <seu_token>",
    "Content-Type": "application/json"
  }
  ```
- **Body**:
  ```json
  {
    "comment_id": 1
  }
  ```
- **Respostas**:
  - **200 OK**:
    ```json
    {
      "message": "Reação removida."
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "error": "Not Found",
      "message": "Reação não encontrada."
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "error": "Erro interno ao remover reação."
    }
    ```

## 📌 Observações

- Tokens expirados devem ser removidos da tabela `tokens` periodicamente.
- O registro e login já incluem validações básicas para `username`, `email` e `password`. Validações mais complexas podem ser adicionadas conforme necessário.
- Middleware pode ser aplicado globalmente ou em rotas específicas, dependendo do caso de uso.
