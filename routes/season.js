const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

async function seasonRoutes(fastify, options) {
  fastify.get("/season", async (request, reply) => {
    try {
      // Determinar a temporada e o ano atuais
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentSeason = ["WINTER", "SPRING", "SUMMER", "FALL"][
        Math.floor(currentDate.getMonth() / 3)
      ];

      // Verificar se o DeepL Translator está disponível
      if (!fastify.deeplTranslator) {
        fastify.log.error("DeepL Translator não está configurado.");
        return reply
          .status(500)
          .send({ error: "DeepL Translator não configurado." });
      }

      // Buscar animes da temporada atual na API AniList
      const anilistResponse = await axios.post("https://graphql.anilist.co", {
        query: `
          query ($season: MediaSeason, $seasonYear: Int) {
            Page {
              media(season: $season, seasonYear: $seasonYear, type: ANIME) {
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
              }
            }
          }
        `,
        variables: {
          season: currentSeason,
          seasonYear: currentYear,
        },
      });

      const animes = anilistResponse.data.data.Page.media;

      // Processar cada anime
      const results = await Promise.all(
        animes.map(async (animeData) => {
          // Verificar se o anime já existe no banco
          const existingAnime = await knex("animes")
            .where({ id: animeData.id })
            .first();

          if (existingAnime) {
            return { id: animeData.id, status: "already_exists" }; // Anime já existe
          }

          // Traduzir a descrição
          const translatedDescription = await fastify.deeplTranslator.translateText(
            animeData.description || "",
            "en",
            "pt-BR"
          );

          // Preparar dados do anime
          const newAnime = {
            id: animeData.id,
            title: animeData.title.english || animeData.title.romaji,
            description: translatedDescription.text || "Descrição não disponível.",
            cover_image_url: animeData.coverImage.large,
            banner_image_url: animeData.bannerImage || null,
            release_date: animeData.startDate.year
              ? `${animeData.startDate.year}-${animeData.startDate.month || 1}-${
                  animeData.startDate.day || 1
                }`
              : null,
            is_current_season: true,
            season: currentSeason,
            season_year: currentYear,
          };

          // Inserir o anime no banco
          await knex("animes").insert(newAnime);

          // Processar e salvar gêneros
          for (const genreName of animeData.genres) {
            const genre = await knex("genres")
              .where("name_en", genreName)
              .first();

            if (!genre) {
              fastify.log.warn(`Gênero não encontrado no banco: ${genreName}`);
              continue;
            }

            await knex("anime_genres").insert({
              anime_id: animeData.id,
              genre_id: genre.id,
            });
          }

          return { id: animeData.id, status: "added" }; // Anime adicionado com sucesso
        })
      );

      // Retornar resultados do processamento
      return reply.send({
        message: "Processamento concluído.",
        season: currentSeason,
        year: currentYear,
        results,
      });
    } catch (error) {
      fastify.log.error(error);

      // Tratamento detalhado de erros
      if (error.response && error.response.data) {
        return reply.status(500).send({
          error: "Erro ao buscar dados da API AniList.",
          details: error.response.data,
        });
      }

      if (error.isAxiosError) {
        return reply.status(500).send({
          error: "Erro de rede ao conectar à API AniList.",
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

module.exports = seasonRoutes;
