// routes/resetPasswordRoutes.js
module.exports = async function (fastify, opts) {
    const resetPasswordController = require('../controllers/ResetPasswordController');
    
    fastify.post('/resetPassword', resetPasswordController.handleResetPassword);
  };
  