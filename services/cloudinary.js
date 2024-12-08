const cloudinary = require('cloudinary').v2;

// Configure manualmente as credenciais
cloudinary.config({
  cloud_name: 'ddbma8dhc', // Substitua pelo seu cloud_name
  api_key: '172781453222536', // Substitua pela sua api_key
  api_secret: 'gidTXw2Zzi55otaGUOnJurZqqs4', // Substitua pelo seu api_secret
});

module.exports = cloudinary;
