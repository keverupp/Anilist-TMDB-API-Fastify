const {
  findAnimeIdByAlternativeTitle,
  findTitles,
} = require("../models/titleModel");
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

    // Define campos selecionados
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

    // 1) Busca IDs em alternative_titles
    const altResults = await findAnimeIdByAlternativeTitle(query);
    const altIDs = altResults.map((row) => row.anime_id);

    // 2) Busca registros diretamente na tabela titles (id + campos)
    const directResults = await findTitles(query);
    const directIDs = directResults.map((row) => row.id);

    // 3) Combina todos os IDs, removendo duplicados
    const allIDs = [...new Set([...altIDs, ...directIDs])];

    // 4) Se não houver nenhum ID encontrado, retorna 404
    if (allIDs.length === 0) {
      return reply.status(404).send({ mensagem: "Nenhum título encontrado." });
    }

    // 5) Busca os registros finais na tabela titles, com os campos solicitados
    const finalResults = await knex("titles")
      .whereIn("id", allIDs)
      .select(selectedFields);

    // 6) Retorna tudo
    return reply.send(finalResults);
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
  