// routes/resetPasswordRoutes.js
module.exports = async function (fastify, opts) {
    const resetPasswordController = require('../controllers/ResetPasswordController');
    
    fastify.post('/resetpassword', resetPasswordController.handleResetPassword);
  };
  