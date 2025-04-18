// config/api.js
module.exports = {
    tmdb: {
      baseUrl: 'https://api.themoviedb.org/3',
      imageBaseUrl: 'https://image.tmdb.org/t/p',
      timeout: 8000 // 8 segundos
    },
    anilist: {
      url: 'https://graphql.anilist.co',
      timeout: 10000 // 10 segundos
    }
  };