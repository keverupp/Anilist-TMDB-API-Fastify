const {
    createSeason,
    findSeasonById,
    listSeasons,
    updateSeason,
    deleteSeason,
  } = require('../models/seasonModel');
  
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
      return reply.status(500).send({ error: 'Erro ao criar a temporada.' });
    }
  }
  
  async function getSeason(req, reply) {
    try {
      const { id } = req.params;
  
      const season = await findSeasonById(id);
      if (!season) {
        return reply.status(404).send({ error: 'Temporada não encontrada.' });
      }
  
      return reply.send(season);
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar a temporada.' });
    }
  }
  
  async function getSeasons(req, reply) {
    try {
      const { year, season } = req.query;
  
      const seasons = await listSeasons({ year, season });
      return reply.send(seasons);
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({ error: 'Erro ao listar temporadas.' });
    }
  }
  
  async function editSeason(req, reply) {
    try {
      const { id } = req.params;
      const data = req.body;
  
      const season = await findSeasonById(id);
      if (!season) {
        return reply.status(404).send({ error: 'Temporada não encontrada.' });
      }
  
      const updatedSeason = await updateSeason(id, data);
      return reply.send(updatedSeason);
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({ error: 'Erro ao atualizar a temporada.' });
    }
  }
  
  async function removeSeason(req, reply) {
    try {
      const { id } = req.params;
  
      const season = await findSeasonById(id);
      if (!season) {
        return reply.status(404).send({ error: 'Temporada não encontrada.' });
      }
  
      await deleteSeason(id);
      return reply.status(204).send();
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({ error: 'Erro ao excluir a temporada.' });
    }
  }
  
  module.exports = {
    addSeason,
    getSeason,
    getSeasons,
    editSeason,
    removeSeason,
  };
  