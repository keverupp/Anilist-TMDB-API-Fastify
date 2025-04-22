const {
  createSeason,
  findSeasonById,
  listSeasons,
  updateSeason,
  deleteSeason,
} = require("../models/seasonModel");

const knex = require("knex")(require("../knexfile").development);

async function addSeason(req, reply) {
  try {
    const { name, season, year, air_date } = req.body;

    if (!name || !year) {
      return reply.status(400).send({
        error: 'Os campos "name" e "year" são obrigatórios.',
      });
    }

    const newSeason = await createSeason({ name, season, year, air_date });
    return reply.status(201).send(newSeason);
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ error: "Erro ao criar a temporada." });
  }
}

async function getSeason(req, reply) {
  try {
    const { id } = req.params;

    const season = await findSeasonById(id);
    if (!season) {
      return reply.status(404).send({ error: "Temporada não encontrada." });
    }

    return reply.send(season);
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ error: "Erro ao buscar a temporada." });
  }
}

async function getSeasons(req, reply) {
  try {
    const { year, season } = req.query;

    const seasons = await listSeasons({ year, season });
    return reply.send(seasons);
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ error: "Erro ao listar temporadas." });
  }
}

async function editSeason(req, reply) {
  try {
    const { id } = req.params;
    const data = req.body;

    const season = await findSeasonById(id);
    if (!season) {
      return reply.status(404).send({ error: "Temporada não encontrada." });
    }

    const updatedSeason = await updateSeason(id, data);
    return reply.send(updatedSeason);
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ error: "Erro ao atualizar a temporada." });
  }
}

async function removeSeason(req, reply) {
  try {
    const { id } = req.params;

    const season = await findSeasonById(id);
    if (!season) {
      return reply.status(404).send({ error: "Temporada não encontrada." });
    }

    await deleteSeason(id);
    return reply.status(204).send();
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ error: "Erro ao excluir a temporada." });
  }
}

async function getSeasonsByAnimeId(request, reply) {
  const { anime_id } = request.params;
  const { page = 1, limit = 10 } = request.query;

  try {
    const offset = (page - 1) * limit;

    // Validar o parâmetro anime_id
    if (!anime_id || isNaN(anime_id) || anime_id <= 0) {
      reply.status(400).send({
        error: "Parâmetro inválido",
        message: "O ID do anime deve ser um número válido e positivo.",
      });
      return;
    }

    // Base da query com join para conectar temporadas ao anime
    const query = knex("anime_seasons")
      .join("seasons", "anime_seasons.season_id", "seasons.id")
      .select(
        "seasons.id",
        "seasons.name",
        "seasons.season",
        "seasons.year",
        "seasons.air_date",
        "seasons.created_at",
        "seasons.updated_at"
      )
      .where("anime_seasons.anime_id", anime_id)
      .limit(limit)
      .offset(offset);

    // Buscar temporadas
    const seasons = await query;

    // Contar total de temporadas do anime
    const [{ count }] = await knex("anime_seasons")
      .where("anime_id", anime_id)
      .count("season_id as count");

    if (seasons.length === 0) {
      reply.status(404).send({
        message: "Nenhuma temporada encontrada para este anime.",
      });
      return;
    }

    // Retornar temporadas e paginação
    reply.status(200).send({
      seasons,
      pagination: {
        total: parseInt(count, 10),
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page, 10),
        perPage: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar temporadas:", error);
    reply.status(500).send({ error: "Erro ao buscar temporadas." });
  }
}

async function syncSeasonsFromApi(req, reply) {
  const { anime_id } = req.params;

  try {
    if (!anime_id || isNaN(anime_id)) {
      return reply.status(400).send({ error: "anime_id inválido" });
    }

    // 🔍 Busca temporadas já associadas
    const existingSeasonIds = await knex("anime_seasons")
      .where({ anime_id })
      .pluck("season_id");

    // 🌐 Busca temporadas da API externa
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/tv/${anime_id}?api_key=YOUR_API_KEY&append_to_response=seasons`
    );
    const apiSeasons = data?.seasons || [];

    const newSeasonIds = [];

    for (const apiSeason of apiSeasons) {
      const { name, season_number, air_date } = apiSeason;

      // 🔁 Verifica se já existe
      const existing = await knex("seasons")
        .where({
          name,
          season: season_number,
          year: new Date(air_date).getFullYear(),
        })
        .first();

      let seasonId = existing?.id;

      // ➕ Se não existe, insere
      if (!seasonId) {
        const [inserted] = await createSeason({
          name,
          season: season_number,
          year: new Date(air_date).getFullYear(),
          air_date,
        });
        seasonId = inserted.id;
      }

      // 🔗 Relaciona com o anime se ainda não estiver associado
      if (!existingSeasonIds.includes(seasonId)) {
        await knex("anime_seasons").insert({
          anime_id,
          season_id: seasonId,
        });
        newSeasonIds.push(seasonId);
      }
    }

    return reply.status(200).send({
      message: newSeasonIds.length
        ? `${newSeasonIds.length} novas temporadas adicionadas.`
        : "Nenhuma nova temporada encontrada.",
      newSeasonIds,
    });
  } catch (err) {
    req.log.error(err);
    return reply.status(500).send({ error: "Erro ao sincronizar temporadas." });
  }
}

module.exports = {
  addSeason,
  getSeason,
  getSeasons,
  editSeason,
  removeSeason,
  getSeasonsByAnimeId,
  syncSeasonsFromApi,
};
