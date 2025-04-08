const { findAnimeIdByAlternativeTitle, findTitles } = require("../models/titleModel");
const knex = require("knex")(require("../knexfile").development);

const ALLOWED_FIELDS = ["id", "english_title", "pt_title", "native_title"];

const searchTitles = async (request, reply) => {
  try {
    const { query, fields } = request.query;

    if (!query || typeof query !== "string") {
      return reply.status(400).send({
        erro: 'O parâmetro "query" é obrigatório e deve ser uma string.',
      });
    }

    // Definir campos selecionados
    let selectedFields = ALLOWED_FIELDS;
    if (fields) {
      const requestedFields = fields.split(",").map((field) => field.trim());
      const invalidFields = requestedFields.filter(
        (field) => !ALLOWED_FIELDS.includes(field)
      );

      if (invalidFields.length > 0) {
        return reply.status(400).send({
          erro: "Campos solicitados são inválidos.",
          campos_invalidos: invalidFields,
        });
      }

      selectedFields = requestedFields;
    }

    const alternativeTitleResult = await findAnimeIdByAlternativeTitle(query);

    if (alternativeTitleResult.length === 0) {
      // tenta achar diretamente nos campos de titles
      const directTitleResults = await findTitles(query);
      if (directTitleResults.length === 0) {
        return reply
          .status(404)
          .send({ mensagem: "Nenhum título encontrado." });
      }
      // se achou, retorna
      return reply.send(directTitleResults);
    }

    const animeIds = alternativeTitleResult.map((row) => row.anime_id);

    const titles = await knex("titles")
      .whereIn("id", animeIds)
      .select(selectedFields);

    if (titles.length === 0) {
      return reply.status(404).send({ mensagem: "Nenhum título encontrado." });
    }

    return reply.send(titles);
  } catch (error) {
    console.error("Erro ao buscar títulos:", error);
    return reply
      .status(500)
      .send({ erro: "Ocorreu um erro ao buscar os títulos." });
  }
};

module.exports = {
  searchTitles,
};
