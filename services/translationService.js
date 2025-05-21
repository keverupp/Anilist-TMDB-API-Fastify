/**
 * Serviço para tradução de textos usando a API DeepL
 */
const axios = require("axios");

/**
 * Traduz textos para português usando a API DeepL
 * @param {string|string[]} texts - Texto ou array de textos para traduzir
 * @returns {Promise<Object>} Objeto com os textos traduzidos
 */
async function translateToPortuguese(texts) {
  try {
    const { DEEPL_KEY } = process.env;

    if (!DEEPL_KEY) {
      throw new Error("DEEPL_KEY não configurada no ambiente");
    }

    // Garante que texts seja um array
    const textArray = Array.isArray(texts) ? texts : [texts];

    // Filtra textos vazios
    const validTexts = textArray.filter(
      (text) => text && typeof text === "string" && text.trim()
    );

    if (validTexts.length === 0) {
      return { translations: [] };
    }

    // Chama API DeepL
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      {
        text: validTexts,
        target_lang: "PT",
      },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.translations) {
      throw new Error("Resposta inválida da API DeepL");
    }

    return response.data;
  } catch (error) {
    console.error(`Erro ao traduzir textos: ${error.message}`);
    throw error;
  }
}

/**
 * Traduz campos específicos de um anime
 * @param {Object} anime - Objeto com dados do anime
 * @returns {Promise<Object>} Objeto com campos traduzidos
 */
async function translateAnimeFields(anime) {
  try {
    const fieldsToTranslate = {
      title: anime.title_english || anime.title,
      synopsis: anime.synopsis,
    };

    // Filtra campos vazios
    const validFields = Object.entries(fieldsToTranslate)
      .filter(([_, value]) => value && value.trim())
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    if (Object.keys(validFields).length === 0) {
      return {
        title_pt: null,
        synopsis_pt: null,
      };
    }

    // Prepara textos para tradução
    const texts = Object.values(validFields);

    // Traduz os textos
    const translationResult = await translateToPortuguese(texts);

    // Mapeia traduções de volta para os campos
    const keys = Object.keys(validFields);
    const result = {};

    keys.forEach((key, index) => {
      if (translationResult.translations[index]) {
        result[`${key}_pt`] = translationResult.translations[index].text;
      }
    });

    return {
      title_pt: result.title_pt || null,
      synopsis_pt: result.synopsis_pt || null,
    };
  } catch (error) {
    console.error(`Erro ao traduzir campos do anime: ${error.message}`);
    return {
      title_pt: null,
      synopsis_pt: null,
    };
  }
}

module.exports = {
  translateToPortuguese,
  translateAnimeFields,
};
