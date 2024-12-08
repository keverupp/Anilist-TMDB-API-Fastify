const cloudinary = require('../services/cloudinary');
const { authenticate } = require("../middlewares/AuthMiddleware");
const UserModel = require('../models/userModel');

module.exports = async (fastify) => {
  fastify.post('/user/avatar', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;

    try {
      // Obtém o arquivo enviado pelo cliente
      const data = await request.file({
        limits: {
          fileSize: 5 * 1024 * 1024, // Limite de 5 MB
        },
      });

      // Valida o tipo MIME do arquivo
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Formato de arquivo não permitido.' });
      }

      // Lê o conteúdo do arquivo como Buffer
      const chunks = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Upload do Buffer para o Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'avatars',
            public_id: `avatar_${userId}`, // Nome único baseado no ID do usuário
            overwrite: true, // Substituir avatar existente
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );

        // Envia o buffer para o Cloudinary
        uploadStream.end(buffer);
      });

      // Valida o resultado do upload
      if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('Upload para o Cloudinary falhou.');
      }

      const avatarUrl = uploadResult.secure_url;

      // Atualiza o avatar no banco de dados
      await UserModel.updateAvatar(userId, avatarUrl);

      // Retorna a resposta com sucesso
      return reply.send({ message: 'Avatar atualizado com sucesso!', avatarUrl });
    } catch (error) {
      console.error('Erro ao processar o avatar:', error.message || error);
      return reply.status(500).send({ error: 'Erro ao atualizar avatar.', details: error.message || error });
    }
  });
};
