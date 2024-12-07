module.exports = async function (fastify, opts) {
    const forgotPasswordController = require('../controllers/ForgotPasswordController');
  
    fastify.post('/forgotPassword', forgotPasswordController.handleForgotPassword);
  };
  