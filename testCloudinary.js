const cloudinary = require('./services/cloudinary');

(async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('Conexão bem-sucedida com o Cloudinary:', result);
  } catch (error) {
    console.error('Erro na conexão com o Cloudinary:', error.message || error);
  }
})();
