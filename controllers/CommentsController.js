const knex = require("knex")(require("../knexfile").development);
const {
  notifyReply,
  notifyNewComment,
} = require("../services/NotificationService");

// Criar um comentário ou resposta
async function createComment(req, reply) {
  const { anime_id, episode_id, content } = req.body;
  const { id: parent_id } = req.params; // ID do comentário pai (se for uma resposta)
  const user_id = req.user.id; // Obtém o ID do usuário autenticado do middleware

  // Validação de entrada
  if (!anime_id || !content) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "Anime ID e conteúdo são obrigatórios.",
    });
  }

  try {
    // Verificar se o comentário pai existe, caso seja uma resposta
    if (parent_id) {
      const parentComment = await knex("comments")
        .where({ id: parent_id })
        .first();
      if (!parentComment) {
        return reply.status(404).send({
          error: "Not Found",
          message: "Comentário pai não encontrado.",
        });
      }
    }

    // Inserir o comentário ou resposta e retornar o ID
    const [insertedComment] = await knex("comments")
      .insert({
        anime_id,
        episode_id: episode_id || null,
        parent_id: parent_id || null, // Associa a resposta ao comentário pai, se fornecido
        user_id,
        content,
      })
      .returning("id");

    const commentId = insertedComment?.id || insertedComment; // Extrai o ID corretamente

    // Notificar o autor do comentário pai, se for uma resposta
    if (parent_id) {
      await notifyReply(parent_id, user_id, commentId);
    } else {
      // Notificar seguidores sobre novos comentários no anime
      await notifyNewComment(commentId);
    }

    // Responder com sucesso
    return reply.status(201).send({
      message: parent_id
        ? "Resposta criada com sucesso."
        : "Comentário criado com sucesso.",
      commentId,
    });
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    return reply.status(500).send({
      error: "Erro interno ao criar comentário.",
    });
  }
}

// Listar comentários (com respostas aninhadas) com paginação nos comentários raiz
async function getComments(req, reply) {
  const { anime_id, episode_id, page = 1, limit = 20 } = req.query; 
  const offset = (page - 1) * limit;

  try {
    // Primeiro, contar quantos comentários raiz existem
    const [{ count }] = await knex("comments")
      .where({ anime_id, episode_id: episode_id || null, parent_id: null })
      .count({ count: "*" });

    // Obter apenas os comentários raiz da página solicitada
    const rootCommentsRows = await knex("comments")
      .where({ anime_id, episode_id: episode_id || null, parent_id: null })
      .orderBy("created_at", "asc")
      .limit(limit)
      .offset(offset);

    // Obter todos os comentários (incluindo filhos)
    const allComments = await knex("comments")
      .where({ anime_id, episode_id: episode_id || null })
      .orderBy("created_at", "asc");

    const commentMap = {};
    allComments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Montar a árvore de comentários aninhados
    allComments.forEach((comment) => {
      if (comment.parent_id) {
        commentMap[comment.parent_id]?.replies.push(commentMap[comment.id]);
      }
    });

    // Filtrar apenas os rootComments obtidos na paginação
    const rootCommentIds = rootCommentsRows.map(r => r.id);
    const paginatedRootComments = rootCommentIds.map(id => commentMap[id]);

    return reply.status(200).send({
      page: Number(page),
      limit: Number(limit),
      total: Number(count),
      total_pages: Math.ceil(count / limit),
      comments: paginatedRootComments
    });
  } catch (error) {
    console.error("Erro ao listar comentários:", error);
    return reply
      .status(500)
      .send({ error: "Erro interno ao listar comentários." });
  } finally {
  }
}


// Excluir um comentário ou resposta
async function deleteComment(req, reply) {
  const { id } = req.params;
  const user_id = req.user.id;

  if (!id) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "ID do comentário é obrigatório.",
    });
  }

  try {
    const comment = await knex("comments").where({ id }).first();

    if (!comment) {
      return reply
        .status(404)
        .send({ error: "Not Found", message: "Comentário não encontrado." });
    }

    if (comment.user_id !== user_id) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "Você não tem permissão para excluir este comentário.",
      });
    }

    // Remover notificações associadas a este comentário
    await knex("notifications")
      .where((builder) =>
        builder
          .where({ related_id: id, type: "reply" })
          .orWhere({ related_id: id, type: "new_comment" })
      )
      .del();

    // Excluir respostas associadas (cascata)
    await knex("comments").where({ parent_id: id }).del();
    await knex("comments").where({ id }).del();

    return reply
      .status(200)
      .send({ message: "Comentário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    return reply
      .status(500)
      .send({ error: "Erro interno ao excluir comentário." });
  } finally {
  }
}

module.exports = { createComment, getComments, deleteComment };
