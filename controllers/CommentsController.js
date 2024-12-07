const knex = require("knex")(require("../knexfile").development);

// Criar um comentário ou resposta
async function createComment(req, reply) {
    const { anime_id, episode_id, content } = req.body;
    const { id } = req.params; // ID do comentário pai (se for uma resposta)
    const user_id = req.user.id; // Supõe que o middleware adiciona `user` ao req
  
    // Validação de entrada
    if (!anime_id || !content) {
      return reply.status(400).send({ error: "Anime ID e conteúdo são obrigatórios." });
    }
  
    try {
      // Verificar se o comentário pai existe, caso seja uma resposta
      if (id) {
        const parentComment = await knex("comments").where({ id }).first();
        if (!parentComment) {
          return reply.status(404).send({ error: "Not Found", message: "Comentário pai não encontrado." });
        }
      }
  
      // Inserir o comentário ou resposta e retornar o ID
      const [commentId] = await knex("comments")
        .insert({
          anime_id,
          episode_id: episode_id || null,
          parent_id: id || null, // Associa a resposta ao comentário pai, se fornecido
          user_id,
          content,
        })
        .returning("id");
  
      // Responder com sucesso
      return reply.status(201).send({ message: "Comentário criado com sucesso.", commentId });
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
      return reply.status(500).send({ error: "Erro interno ao criar comentário." });
    }
  }
  

// Listar comentários (com respostas aninhadas)
async function getComments(req, reply) {
  console.log("Início de getComments");
  const { anime_id, episode_id } = req.query;

  try {
    const comments = await knex("comments")
      .where({ anime_id, episode_id: episode_id || null })
      .orderBy("created_at", "asc");

    const commentMap = {};
    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    const rootComments = [];
    comments.forEach((comment) => {
      if (comment.parent_id) {
        commentMap[comment.parent_id]?.replies.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return reply.status(200).send(rootComments);
  } catch (error) {
    console.error("Erro ao listar comentários:", error);
    return reply.status(500).send({ error: "Erro interno ao listar comentários." });
  } finally {
    console.log("Fim de getComments");
  }
}

// Excluir um comentário ou resposta
async function deleteComment(req, reply) {
  console.log("Início de deleteComment");
  const { id } = req.params;
  const user_id = req.user.id;

  if (!id) {
    return reply.status(400).send({ error: "Bad Request", message: "ID do comentário é obrigatório." });
  }

  try {
    const comment = await knex("comments").where({ id }).first();

    if (!comment) {
      return reply.status(404).send({ error: "Not Found", message: "Comentário não encontrado." });
    }

    if (comment.user_id !== user_id) {
      return reply.status(403).send({ error: "Forbidden", message: "Você não tem permissão para excluir este comentário." });
    }

    // Excluir respostas associadas (cascata)
    await knex("comments").where({ parent_id: id }).del();
    await knex("comments").where({ id }).del();

    return reply.status(200).send({ message: "Comentário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    return reply.status(500).send({ error: "Erro interno ao excluir comentário." });
  } finally {
    console.log("Fim de deleteComment");
  }
}

module.exports = { createComment, getComments, deleteComment };
