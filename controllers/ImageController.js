// controllers/ImageController.js
const axios = require("axios");
const ImageModel = require("../models/ImageModel"); // Ajuste o caminho se necessário
const apiKey = process.env.TMDB_API_KEY;

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

function normalizeIso639_1(isoCode) {
  if (!isoCode) return null;
  const lowerIsoCode = isoCode.toLowerCase();
  const allowedLanguages = ["en", "pt", "ja"];
  if (allowedLanguages.includes(lowerIsoCode)) {
    return lowerIsoCode;
  }
  return null;
}

function applyFiltersAndSort(images, queryImageType, queryLang, requestLog) {
  requestLog.info(
    `[Controller.applyFiltersAndSort] Aplicando filtros. Tipos: ${queryImageType}, Idiomas: ${queryLang}. Imagens recebidas: ${images.length}`
  );
  let processedImages = images.map((img) => ({
    ...img,
    iso_639_1: normalizeIso639_1(img.iso_639_1),
  }));

  if (queryImageType) {
    const requestedTypes = queryImageType
      .toLowerCase()
      .split(",")
      .map((t) => t.trim());
    processedImages = processedImages.filter(
      (img) =>
        img.image_type && requestedTypes.includes(img.image_type.toLowerCase())
    );
    requestLog.info(
      `[Controller.applyFiltersAndSort] Após filtro de tipo: ${processedImages.length} imagens.`
    );
  }

  if (queryLang) {
    const requestedLangs = queryLang
      .toLowerCase()
      .split(",")
      .map((l) => l.trim());
    const hasNullRequest = requestedLangs.includes("null");
    const concreteLangs = requestedLangs.filter((l) => l !== "null");

    processedImages = processedImages.filter((img) => {
      const imgLang = img.iso_639_1;
      if (imgLang === null) return hasNullRequest;
      return concreteLangs.includes(imgLang);
    });
    requestLog.info(
      `[Controller.applyFiltersAndSort] Após filtro de idioma: ${processedImages.length} imagens.`
    );
  }

  const langPriorityOrder = { en: 1, pt: 2, ja: 3 };
  processedImages.sort((a, b) => {
    const priorityA = langPriorityOrder[a.iso_639_1] || 4;
    const priorityB = langPriorityOrder[b.iso_639_1] || 4;
    if (priorityA !== priorityB) return priorityA - priorityB;

    if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count;
    if (b.vote_average !== a.vote_average)
      return b.vote_average - a.vote_average;
    if (a.file_path && b.file_path)
      return a.file_path.localeCompare(b.file_path);
    return 0;
  });
  requestLog.info(
    `[Controller.applyFiltersAndSort] Após ordenação: ${processedImages.length} imagens.`
  );
  return processedImages;
}

async function fetchAndStoreImages(request, reply) {
  const { series_id } = request.params;
  const { type: queryImageType, lang: queryLang } = request.query;

  if (!apiKey) {
    request.log.error(
      "[Controller.fetchAndStoreImages] ERRO: Chave da API TMDB (TMDB_API_KEY) não está configurada."
    );
    reply.status(500).send({ error: "Configuração do servidor incompleta." });
    return;
  }

  try {
    request.log.info(
      `[Controller] Iniciando busca para series_id: ${series_id}. Filtros: type=${queryImageType}, lang=${queryLang}`
    );
    let imagesFromDb = await ImageModel.findImagesByShowId(series_id);

    if (imagesFromDb && imagesFromDb.length > 0) {
      request.log.info(
        `[Controller] Imagens encontradas no DB para series_id: ${series_id}. Quantidade: ${imagesFromDb.length}`
      );
      const finalImages = applyFiltersAndSort(
        imagesFromDb,
        queryImageType,
        queryLang,
        request.log
      );
      reply.status(200).send({
        message: "Imagens recuperadas do banco de dados e processadas.",
        source: "database",
        images: finalImages,
      });
      return;
    }

    request.log.info(
      `[Controller] Imagens não encontradas no DB. Buscando na API TMDB para series_id: ${series_id}`
    );
    let imagesToStoreFromApi = [];

    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/tv/${series_id}/images`,
        {
          params: {
            api_key: apiKey,
            include_image_language: "pt,en,ja,x-no-linguistic-content,null",
          },
          timeout: 10000,
        }
      );

      const tmdbData = response.data;
      const hasBackdrops = tmdbData.backdrops && tmdbData.backdrops.length > 0;
      const hasPosters = tmdbData.posters && tmdbData.posters.length > 0;
      const hasLogos = tmdbData.logos && tmdbData.logos.length > 0;

      if (!tmdbData || (!hasBackdrops && !hasPosters && !hasLogos)) {
        request.log.info(
          `[Controller] Nenhuma imagem bruta encontrada na API TMDB para series_id: ${series_id}`
        );
      } else {
        request.log.info(
          `[Controller] Imagens brutas encontradas na API TMDB. Processando...`
        );
        const imageTypes = ["backdrops", "posters", "logos"];
        imageTypes.forEach((type) => {
          if (tmdbData[type] && tmdbData[type].length > 0) {
            tmdbData[type].forEach((img) => {
              if (
                img.file_path &&
                typeof img.width === "number" &&
                typeof img.height === "number" &&
                typeof img.aspect_ratio === "number"
              ) {
                imagesToStoreFromApi.push({
                  show_id: series_id,
                  file_path: `${TMDB_IMAGE_BASE_URL}${img.file_path}`,
                  width: img.width,
                  height: img.height,
                  aspect_ratio: img.aspect_ratio,
                  iso_639_1: normalizeIso639_1(img.iso_639_1),
                  vote_average:
                    typeof img.vote_average === "number"
                      ? parseFloat(img.vote_average.toFixed(3))
                      : 0,
                  vote_count:
                    typeof img.vote_count === "number" ? img.vote_count : 0,
                  image_type: type.slice(0, -1),
                });
              } else {
                request.log.warn(
                  `[Controller] Imagem da API TMDB com dados incompletos ignorada para series_id ${series_id}: ${JSON.stringify(
                    img
                  )}`
                );
              }
            });
          }
        });
        request.log.info(
          `[Controller] ${imagesToStoreFromApi.length} imagens processadas da API TMDB para series_id: ${series_id}`
        );
      }
    } catch (apiError) {
      request.log.error(
        `[Controller] Erro ao buscar imagens da API TMDB para series_id ${series_id}: ${apiError.message}`
      );
      throw apiError;
    }

    if (imagesToStoreFromApi.length === 0) {
      request.log.info(
        `[Controller] Nenhuma imagem válida para inserir para series_id: ${series_id} após consulta à API.`
      );
      const finalImages = applyFiltersAndSort(
        [],
        queryImageType,
        queryLang,
        request.log
      );
      reply.status(404).send({
        message:
          "Nenhuma imagem encontrada para esta série, no banco ou na API externa, que corresponda aos critérios.",
        source: "tmdb_api_processed_empty",
        images: finalImages,
      });
      return;
    }

    request.log.info(
      `[Controller] Inserindo ${imagesToStoreFromApi.length} imagens no DB para series_id: ${series_id}`
    );
    const storedImages = await ImageModel.insertManyImages(
      imagesToStoreFromApi
    );

    request.log.info(
      `[Controller] Imagens inseridas/processadas no DB. Aplicando filtros e ordenação para series_id: ${series_id}`
    );
    const finalImages = applyFiltersAndSort(
      storedImages,
      queryImageType,
      queryLang,
      request.log
    );

    reply.status(201).send({
      message: "Imagens obtidas da API, processadas, armazenadas e filtradas.",
      source: "tmdb_api_then_database",
      images: finalImages,
    });
  } catch (error) {
    request.log.error(
      `[Controller] Erro geral no controller para series_id ${series_id}: ${error.message}`,
      { stack: error.stack }
    );
    if (error.response) {
      const statusCode = error.response.status || 500;
      const externalErrorMessage =
        error.response.data?.status_message ||
        error.response.data?.error ||
        "Erro ao comunicar com serviço externo.";
      if (
        error.config &&
        error.config.url &&
        error.config.url.includes("themoviedb.org")
      ) {
        request.log.error(
          `[Controller] Erro específico da API TMDB: Status ${statusCode}, Mensagem: ${externalErrorMessage}, URL: ${error.config.url}`
        );
      }
      reply
        .status(statusCode)
        .send({ error: `Erro ao processar imagens: ${externalErrorMessage}` });
    } else {
      reply
        .status(500)
        .send({
          error: "Erro interno do servidor ao buscar e inserir imagens.",
        });
    }
  }
}

module.exports = {
  fetchAndStoreImages,
};
