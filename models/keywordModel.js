// models/keywordModel.js
const knex = require("knex")(require("../knexfile").development);

class KeywordModel {
  async getAllKeywords({
    page = 1,
    limit = 100,
    name,
    sort_by = "name",
    sort_order = "asc",
  }) {
    const offset = (page - 1) * limit;

    // Validar direção de ordenação
    const sortDirection = ["asc", "desc"].includes(sort_order.toLowerCase())
      ? sort_order.toLowerCase()
      : "asc";

    // Validar campo de ordenação
    const validSortFields = ["id", "name"];
    const sortField = validSortFields.includes(sort_by) ? sort_by : "name";

    // Construir a query base
    let query = knex("keywords")
      .select("id", "name")
      .limit(limit)
      .offset(offset);

    // Aplicar filtro por nome se fornecido
    if (name) {
      query = query.where("name", "ilike", `%${name}%`);
    }

    // Aplicar ordenação
    query = query.orderBy(sortField, sortDirection);

    // Função para aplicar os mesmos filtros em diferentes queries
    const applyFilters = (builder) => {
      if (name) {
        builder.where("name", "ilike", `%${name}%`);
      }
    };

    // Executar a query principal e a query de contagem em paralelo
    const [keywords, totalCount] = await Promise.all([
      query,
      knex("keywords").modify(applyFilters).count("id as total").first(),
    ]);

    const total = parseInt(totalCount.total || 0, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      keywords,
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page, 10),
        perPage: parseInt(limit, 10),
      },
      sort: {
        field: sortField,
        order: sortDirection,
      },
    };
  }
}

module.exports = new KeywordModel();
