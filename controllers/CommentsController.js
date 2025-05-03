// controllers/commentsController.js
const EventEmitter = require("events");
const knex = require("knex")(require("../knexfile").development);
const {
  notifyReply,
  notifyNewComment,
} = require("../services/NotificationService");

// Event emitter para distribuição de novos comentários
const commentEmitter = new EventEmitter();

// Função para criar comentário ou resposta
async function createComment(req, reply) {
  const { anime_id, episode_id, content } = req.body;
  const { id: parent_id } = req.params;
  const user_id = req.user.id;

  if (!anime_id || !content) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "Anime ID e conteúdo são obrigatórios.",
    });
  }

  try {
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

    // Inserção do comentário
    const [insertedId] = await knex("comments")
      .insert({
        anime_id,
        episode_id: episode_id || null,
        parent_id: parent_id || null,
        user_id,
        content,
      })
      .returning("id");
    const commentId = insertedId.id || insertedId;

    // Lógica de notificações existente
    if (parent_id) {
      await notifyReply(parent_id, user_id, commentId);
    } else {
      await notifyNewComment(commentId);
    }

    // Recupera o comentário completo com dados do usuário
    const [newCommentRow] = await knex("comments as c")
      .select(
        "c.id",
        "c.anime_id",
        "c.episode_id",
        "c.parent_id",
        "c.user_id",
        "c.content",
        "c.created_at",
        "u.username",
        "u.avatar"
      )
      .join("users as u", "c.user_id", "u.id")
      .where("c.id", commentId);

    // Monta objeto para emissão
    const emittedComment = {
      id: newCommentRow.id,
      anime_id: newCommentRow.anime_id,
      episode_id: newCommentRow.episode_id,
      parent_id: newCommentRow.parent_id,
      content: newCommentRow.content,
      created_at: newCommentRow.created_at,
      user: {
        id: newCommentRow.user_id,
        username: newCommentRow.username,
        avatar: newCommentRow.avatar,
      },
      replies: [],
    };

    // Emite evento de novo comentário
    // Emite evento de novo comentário
    commentEmitter.emit("comment", {
      action: "new_comment", // Adicionado para consistência
      ...emittedComment,
    });

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

// Função para listar comentários (mesma lógica)
async function getComments(req, reply) {
  const { anime_id, episode_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [{ count }] = await knex("comments")
      .where({ anime_id, episode_id: episode_id || null, parent_id: null })
      .count({ count: "*" });

    const rootCommentsRows = await knex("comments")
      .where({ anime_id, episode_id: episode_id || null, parent_id: null })
      .orderBy("created_at", "asc")
      .limit(limit)
      .offset(offset);

    const allComments = await knex("comments")
      .where({ anime_id, episode_id: episode_id || null })
      .orderBy("created_at", "asc");

    const commentMap = {};
    const userIds = new Set();

    allComments.forEach((comment) => {
      userIds.add(comment.user_id);
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    const users = await knex("users")
      .select("id", "username", "avatar")
      .whereIn("id", Array.from(userIds));

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    allComments.forEach((comment) => {
      commentMap[comment.id].user = userMap[comment.user_id] || null;
    });

    allComments.forEach((comment) => {
      if (comment.parent_id) {
        commentMap[comment.parent_id]?.replies.push(commentMap[comment.id]);
      }
    });

    const commentsWithUsers = rootCommentsRows.map(
      (comment) => commentMap[comment.id]
    );

    return reply.send({
      total: Number(count),
      page: Number(page),
      limit: Number(limit),
      comments: commentsWithUsers,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao buscar comentários" });
  }
}

// Subscribe para novos comentários via WebSocket
function subscribeToComments(animeId, episodeId, callback) {
  const listener = (comment) => {
    const matchAnime = comment.anime_id.toString() === animeId.toString();
    const matchEpisode = episodeId
      ? comment.episode_id?.toString() === episodeId.toString()
      : !comment.episode_id;
    if (matchAnime && matchEpisode) {
      callback(comment);
    }
  };
  commentEmitter.on("comment", listener);
  return () => commentEmitter.off("comment", listener);
}

// Excluir um comentário ou resposta
async function deleteComment(req, reply) {
  const { id } = req.params;
  const user_id = req.user.id;
  const user_roles = req.user.roles; // Obter papéis do usuário autenticado

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

    // Verifica se o usuário tem permissão para excluir o comentário
    const isAdmin = user_roles.includes("admin");
    if (comment.user_id !== user_id && !isAdmin) {
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

    // NOVO: Emitir evento de exclusão de comentário
    commentEmitter.emit("comment", {
      action: "delete_comment",
      id: parseInt(id),
      parent_id: comment.parent_id,
      anime_id: comment.anime_id,
      episode_id: comment.episode_id,
    });

    return reply
      .status(200)
      .send({ message: "Comentário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    return reply
      .status(500)
      .send({ error: "Erro interno ao excluir comentário." });
  }
}

// Editar um comentário
async function editComment(req, reply) {
  const { id } = req.params; // ID do comentário a ser editado
  const { content } = req.body; // Novo conteúdo do comentário
  const user_id = req.user.id; // ID do usuário autenticado
  const user_roles = req.user.roles; // Papéis do usuário autenticado

  // Validações de entrada
  if (!id) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "ID do comentário é obrigatório.",
    });
  }
  if (!content || content.trim().length === 0) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "O conteúdo do comentário não pode estar vazio.",
    });
  }

  try {
    // Buscar o comentário no banco de dados
    const comment = await knex("comments").where({ id }).first();

    if (!comment) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Comentário não encontrado.",
      });
    }

    // Verificar se o usuário tem permissão para editar o comentário
    const isAdmin = user_roles.includes("admin");
    if (comment.user_id !== user_id && !isAdmin) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "Você não tem permissão para editar este comentário.",
      });
    }

    // Atualizar o comentário no banco de dados
    await knex("comments")
      .where({ id })
      .update({ content, updated_at: knex.fn.now() });

    // Buscar o comentário atualizado para obter o updated_at
    const updatedComment = await knex("comments").where({ id }).first();

    // NOVO: Emitir evento de edição de comentário
    commentEmitter.emit("comment", {
      action: "edit_comment",
      id: parseInt(id),
      parent_id: comment.parent_id,
      anime_id: comment.anime_id,
      episode_id: comment.episode_id,
      content: content,
      updated_at: updatedComment.updated_at,
    });

    return reply.status(200).send({
      message: "Comentário atualizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao editar comentário:", error);
    return reply.status(500).send({
      error: "Erro interno ao editar comentário.",
    });
  }
}

module.exports = {
  createComment,
  getComments,
  deleteComment,
  editComment,
  subscribeToComments,
};
