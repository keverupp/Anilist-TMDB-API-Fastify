// controllers/keywordController.js
const keywordModel = require("../models/keywordModel");

class KeywordController {
  async getAllKeywords(request, reply) {
    try {
      const result = await keywordModel.getAllKeywords(request.query);

      return reply.status(200).send({
        pagination: result.pagination,
        sort: result.sort,
        data: result.keywords,
      });
    } catch (error) {
      console.error("Erro ao buscar keywords:", error);
      return reply.status(500).send({ error: "Erro ao buscar keywords." });
    }
  }
}

module.exports = new KeywordController();
