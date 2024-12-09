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
const upsert = async (table, conflictColumn, data) => {
  return knex(table)
    .insert(data)
    .onConflict(conflictColumn)
    .merge();
};

// Função para buscar gêneros associados a um anime
const findGenresByAnimeId = async (animeId) => {
  return knex("anime_genres")
    .join("genres", "anime_genres.genre_id", "genres.id")
    .where("anime_genres.anime_id", animeId)
    .select("genres.name_en", "genres.name_pt");
};

// Função para buscar gênero pelo nome
const findGenreByName = async (name) => {
  return knex("genres").where("name_pt", name).first();
};

// Função para inserir relação entre anime e gênero
const insertAnimeGenreRelation = async (animeId, genreId) => {
  const exists = await knex("anime_genres")
    .where({ anime_id: animeId, genre_id: genreId })
    .first();

  if (!exists) {
    return knex("anime_genres").insert({ anime_id: animeId, genre_id: genreId });
  }
};

// Função para upsert temporada
const upsertSeason = async (season) => {
  const seasonData = {
    id: season.id,
    name: season.name || "Desconhecido",
    season: season.season_number || null,
    year: season.air_date ? new Date(season.air_date).getFullYear() : 0,
    air_date: season.air_date || null,
  };

  try {
    await upsert("seasons", "id", seasonData);
    console.log(`Temporada upserted: ${seasonData.name}, ID: ${seasonData.id}`);
    return parseInt(seasonData.id, 10);
  } catch (error) {
    console.error("Erro em upsertSeason:", error.message, season);
    throw new Error("Falha ao inserir ou recuperar a temporada.");
  }
};

// Função para relacionar anime e temporada
const insertAnimeSeasonRelation = async (animeId, seasonId) => {
  animeId = parseInt(animeId, 10);
  seasonId = parseInt(seasonId, 10);

  if (isNaN(animeId) || isNaN(seasonId)) {
    console.error(`IDs inválidos para relacionamento: animeId=${animeId}, seasonId=${seasonId}`);
    return;
  }

  const exists = await knex("anime_seasons")
    .where({ anime_id: animeId, season_id: seasonId })
    .first();

  if (!exists) {
    await knex("anime_seasons").insert({ anime_id: animeId, season_id: seasonId });
    console.log(`Relacionamento inserido: animeId=${animeId}, seasonId=${seasonId}`);
  } else {
    console.log(`Relacionamento já existe: animeId=${animeId}, seasonId=${seasonId}`);
  }
};

async function updateAnimeWithAnilistData(animeId, data) {
  return knex('animes').where({ id: animeId }).update(data);
};



// Exportando funções específicas
module.exports = {
  findAnimeById: (id) => findById("animes", id),
  insertAnime: (anime) => insert("animes", anime),
  findGenresByAnimeId,
  findGenreByName,
  insertAnimeGenreRelation,
  upsertSeason,
  insertAnimeSeasonRelation,
  updateAnimeWithAnilistData,
};