const knex = require("knex")(require("../knexfile").development);

// Função genérica para buscar um registro por ID
const findById = async (table, id) => {
  return knex(table).where({ id }).first();
};

// Função genérica para inserir um registro
const insert = async (table, data) => {
  return knex(table).insert(data);
};

// Função genérica para upsert (inserir ou atualizar) usando onConflict
const upsert = async (table, conflictColumns, data) => {
  return knex(table).insert(data).onConflict(conflictColumns).merge();
};

// === Gêneros ===
const findGenresByAnimeId = async (animeId) => {
  return knex("anime_genres")
    .join("genres", "anime_genres.genre_id", "genres.id")
    .where("anime_genres.anime_id", animeId)
    .select("genres.id as tmdb_id", "genres.name_en", "genres.name_pt");
};

const findGenreById = async (id) => {
  return knex("genres").where("id", id).first();
};

const insertAnimeGenreRelation = async (animeId, genreId) => {
  const exists = await knex("anime_genres")
    .where({ anime_id: animeId, genre_id: genreId })
    .first();

  if (!exists) {
    return knex("anime_genres").insert({
      anime_id: animeId,
      genre_id: genreId,
    });
  }
};

// === Temporadas ===
const upsertSeason = async (season) => {
  const seasonData = {
    id: season.id,
    name: season.name || "Desconhecido",
    season: season.season_number || null,
    year: season.air_date ? new Date(season.air_date).getFullYear() : 0,
    air_date: season.air_date || null,
  };

  await upsert("seasons", "id", seasonData);
  return parseInt(seasonData.id, 10);
};

const insertAnimeSeasonRelation = async (animeId, seasonId) => {
  animeId = parseInt(animeId, 10);
  seasonId = parseInt(seasonId, 10);

  const exists = await knex("anime_seasons")
    .where({ anime_id: animeId, season_id: seasonId })
    .first();

  if (!exists) {
    await knex("anime_seasons").insert({
      anime_id: animeId,
      season_id: seasonId,
    });
  }
};

// === Episódios ===
/**
 * Insere ou atualiza um episódio, preenchendo apenas campos não-nulos.
 */
const upsertEpisode = async (episodeData) => {
  await knex("episodes")
    .insert(episodeData)
    .onConflict(["anime_season_id", "episode_number"])
    .merge({
      name: knex.raw("COALESCE(EXCLUDED.name, ??)", ["episodes.name"]),
      overview: knex.raw("COALESCE(EXCLUDED.overview, ??)", [
        "episodes.overview",
      ]),
      still_path: knex.raw("COALESCE(EXCLUDED.still_path, ??)", [
        "episodes.still_path",
      ]),
      air_date: knex.raw("COALESCE(EXCLUDED.air_date, ??)", [
        "episodes.air_date",
      ]),
      runtime: knex.raw("COALESCE(EXCLUDED.runtime, ??)", ["episodes.runtime"]),
      tmdb_id: knex.raw("COALESCE(EXCLUDED.tmdb_id, ??)", ["episodes.tmdb_id"]),
      vote_average: knex.raw("COALESCE(EXCLUDED.vote_average, ??)", [
        "episodes.vote_average",
      ]),
      vote_count: knex.raw("COALESCE(EXCLUDED.vote_count, ??)", [
        "episodes.vote_count",
      ]),
      is_pending_update: knex.raw("EXCLUDED.is_pending_update"),
    });
};

/**
 * Processa um array de episódios para uma determinada temporada.
 */
const processEpisodes = async (seasonId, episodes, logger) => {
  await Promise.all(
    episodes.map(async (ep) => {
      try {
        const episodeData = {
          anime_season_id: seasonId,
          episode_number: ep.episode_number,
          name: ep.name || null,
          overview: ep.overview || null,
          still_path: ep.still_path
            ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
            : null,
          air_date: ep.air_date || null,
          runtime: ep.runtime || null,
          tmdb_id: ep.id || null,
          vote_average: ep.vote_average || 0,
          vote_count: ep.vote_count || 0,
          is_pending_update: ep.overview == null,
        };
        await upsertEpisode(episodeData);
      } catch (error) {
        logger.error(
          `Erro ao processar episódio seasonId=${seasonId} ep=${ep.episode_number}:`,
          error.message
        );
      }
    })
  );
};

// === Títulos e Keywords ===
async function getEnglishTitleFromTitles(animeId) {
  return knex("titles").select("english_title").where("id", animeId).first();
}

const processKeywords = async (animeId, logger, keywords) => {
  await Promise.all(
    keywords.map(async (keyword) => {
      try {
        await knex("keywords")
          .insert({ id: keyword.id, name: keyword.name })
          .onConflict("id")
          .ignore();
        await knex("anime_keywords")
          .insert({ anime_id: animeId, keyword_id: keyword.id })
          .onConflict(["anime_id", "keyword_id"])
          .ignore();
      } catch (error) {
        logger.error(
          `Erro ao processar keyword '${keyword.name}' (ID ${keyword.id}):`,
          error.message
        );
      }
    })
  );
};

const findKeywordsByAnimeId = async (animeId) => {
  return knex("anime_keywords")
    .join("keywords", "anime_keywords.keyword_id", "keywords.id")
    .where("anime_keywords.anime_id", animeId)
    .select("keywords.id", "keywords.name");
};

// Exportando funções específicas
module.exports = {
  findAnimeById: (id) => findById("animes", id),
  insertAnime: (anime) => insert("animes", anime),
  findGenresByAnimeId,
  findGenreById,
  insertAnimeGenreRelation,
  upsertSeason,
  insertAnimeSeasonRelation,
  upsertEpisode,
  processEpisodes,
  getEnglishTitleFromTitles,
  processKeywords,
  findKeywordsByAnimeId,
};
