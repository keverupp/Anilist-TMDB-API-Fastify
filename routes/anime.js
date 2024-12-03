const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

async function animeRoutes(fastify, options) {
  fastify.get("/anime/:id", async (request, reply) => {
    const { id } = request.params;

    // Validação do parâmetro `id`
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return reply.status(400).send({
        error: 'Parâmetro "id" inválido na rota anime.',
        message: "O ID deve ser um número válido.",
      });
    }

    // Verificar se o DeepL Translator está disponível
    if (!fastify.deeplTranslator) {
      fastify.log.error("DeepL Translator não está configurado.");
      return reply
        .status(500)
        .send({ error: "DeepL Translator não configurado." });
    }

    try {
      // 1. Verificar se o anime já está no banco de dados
      const anime = await knex("animes").where({ id }).first();

      if (anime) {
        // Recuperar gêneros associados
        const genres = await knex("anime_genres")
          .join("genres", "anime_genres.genre_id", "genres.id")
          .where("anime_genres.anime_id", id)
          .select("genres.name_en", "genres.name_pt");

        return reply.send({ ...anime, genres });
      }

      // 2. Buscar dados na API Anilist
      const anilistResponse = await axios.post("https://graphql.anilist.co", {
        query: `
          query ($id: Int) {
            Media(id: $id) {
              id
              title {
                romaji
                english
              }
              description
              coverImage {
                large
              }
              bannerImage
              startDate {
                year
                month
                day
              }
              genres
              season
              seasonYear
            }
          }
        `,
        variables: { id },
      });

      const animeData = anilistResponse.data.data.Media;

      // 3. Traduzir a descrição com DeepL
      const translatedDescription = await fastify.deeplTranslator.translateText(
        animeData.description,
        "en", // Idioma de origem (detecção automática)
        "pt-BR" // Idioma de destino
      );

      // 4. Verificar temporada atual
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentSeason = ["WINTER", "SPRING", "SUMMER", "FALL"][
        Math.floor(currentDate.getMonth() / 3)
      ];

      const isCurrentSeason =
        animeData.season === currentSeason &&
        animeData.seasonYear === currentYear;

      // 5. Salvar os dados do anime no banco
      const newAnime = {
        id: animeData.id,
        title: animeData.title.english || animeData.title.romaji,
        description: translatedDescription.text || "Descrição não disponível.",
        cover_image_url: animeData.coverImage.large,
        banner_image_url: animeData.bannerImage,
        release_date: `${animeData.startDate.year}-${animeData.startDate.month || 1}-${
          animeData.startDate.day || 1
        }`,
        season: animeData.season,
        season_year: animeData.seasonYear,
        episodes_count: animeData.episodes || null, // Número de episódios previstos
      }

      await knex("animes").insert(newAnime);

      // 6. Processar e salvar gêneros
      for (const genreName of animeData.genres) {
        // Encontrar o gênero no banco pelo nome em inglês
        const genre = await knex("genres")
          .where("name_en", genreName)
          .first();

        // Se o gênero não existir, logar o problema
        if (!genre) {
          fastify.log.warn(`Gênero não encontrado no banco: ${genreName}`);
          continue;
        }

        // Relacionar o gênero ao anime
        await knex("anime_genres").insert({
          anime_id: animeData.id,
          genre_id: genre.id,
        });
      }

      // 7. Recuperar gêneros associados para retorno
      const genres = await knex("anime_genres")
        .join("genres", "anime_genres.genre_id", "genres.id")
        .where("anime_genres.anime_id", animeData.id)
        .select("genres.name_en", "genres.name_pt");

      // 8. Retornar os dados salvos
      return reply.send({ ...newAnime, genres });
    } catch (error) {
      fastify.log.error(error);

      // Tratamento detalhado de erros
      if (error.response && error.response.data) {
        return reply.status(500).send({
          error: "Erro ao buscar dados da API Anilist.",
          details: error.response.data,
        });
      }

      if (error.isAxiosError) {
        return reply.status(500).send({
          error: "Erro de rede ao conectar à API Anilist.",
        });
      }

      if (error.message && error.message.includes("DEEPL")) {
        return reply.status(500).send({
          error: "Erro ao traduzir com o DeepL.",
          details: error.message,
        });
      }

      return reply.status(500).send({ error: "Erro desconhecido." });
    }
  });
}

module.exports = animeRoutes;
