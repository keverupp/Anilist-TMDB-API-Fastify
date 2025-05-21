/**
 * Repositório para operações de banco de dados relacionadas a animes futuros
 */
const knex = require("knex")(require("../knexfile").development);

/**
 * Busca anime futuro pelo ID do MyAnimeList
 * @param {number} malId - ID do anime no MyAnimeList
 * @returns {Promise<Object|null>} Dados do anime ou null se não encontrado
 */
async function findUpcomingAnimeByMalId(malId) {
  return knex("upcoming_animes").where("mal_id", malId).first();
}

/**
 * Insere um novo anime futuro no banco de dados
 * @param {Object} animeData - Dados do anime
 * @returns {Promise<number>} ID do anime inserido
 */
async function insertUpcomingAnime(animeData) {
  const [id] = await knex("upcoming_animes").insert(animeData).returning("id");
  return id;
}

/**
 * Busca animes futuros não processados
 * @returns {Promise<Array>} Lista de animes não processados
 */
async function findUnprocessedUpcomingAnimes() {
  return knex("upcoming_animes").where("processed", false);
}

/**
 * Atualiza dados de um anime futuro
 * @param {number} id - ID do anime
 * @param {Object} data - Dados a serem atualizados
 * @returns {Promise<void>}
 */
async function updateUpcomingAnime(id, data) {
  return knex("upcoming_animes").where("id", id).update(data);
}

/**
 * Lista todos os animes futuros
 * @param {Object} options - Opções de filtro e paginação
 * @returns {Promise<Array>} Lista de animes futuros
 */
async function listUpcomingAnimes(options = {}) {
  const {
    page = 1,
    limit = 20,
    season,
    year,
    hasOtakuId = null,
    name,
    fields,
  } = options;

  // Iniciar a query
  let query = knex("upcoming_animes");

  // Selecionar campos específicos se fornecidos, caso contrário selecionar todos
  if (fields && Array.isArray(fields) && fields.length > 0) {
    // Garantindo que sempre incluímos o campo id para manter a consistência
    if (!fields.includes("id")) {
      fields.push("id");
    }
    query = query.select(fields);
  }

  // Continuar com o resto da query
  query = query
    .orderBy("release_date", "asc")
    .limit(limit)
    .offset((page - 1) * limit);

  if (season) {
    query.where("season", season);
  }

  if (year) {
    query.where("year", year);
  }

  if (hasOtakuId !== null) {
    if (hasOtakuId) {
      query.whereNotNull("otaku_discuss_id");
    } else {
      query.whereNull("otaku_discuss_id");
    }
  }

  if (name) {
    // Modificar para buscar em todos os três campos de título
    query.where(function () {
      this.whereILike("title", `%${name}%`)
        .orWhereILike("title_english", `%${name}%`)
        .orWhereILike("title_pt", `%${name}%`);
    });
  }

  return query;
}

/**
 * Conta o total de animes futuros
 * @param {Object} options - Opções de filtro
 * @returns {Promise<number>} Total de animes
 */
async function countUpcomingAnimes(options = {}) {
  const { season, year, hasOtakuId = null, name } = options;

  const query = knex("upcoming_animes").count("* as total");

  if (season) {
    query.where("season", season);
  }

  if (year) {
    query.where("year", year);
  }

  if (hasOtakuId !== null) {
    if (hasOtakuId) {
      query.whereNotNull("otaku_discuss_id");
    } else {
      query.whereNull("otaku_discuss_id");
    }
  }

  // Adicionando filtro por nome
  if (name) {
    query.whereILike("title", `%${name}%`);
  }

  const result = await query;
  return parseInt(result[0].total);
}

module.exports = {
  findUpcomingAnimeByMalId,
  insertUpcomingAnime,
  findUnprocessedUpcomingAnimes,
  updateUpcomingAnime,
  listUpcomingAnimes,
  countUpcomingAnimes,
};
