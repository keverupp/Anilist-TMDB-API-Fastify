const fastifyPlugin = require("fastify-plugin");
const fastifyOauth2 = require("@fastify/oauth2");
const knex = require("knex")(require("../../knexfile").development);
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = fastifyPlugin(async function (fastify, opts) {
  fastify.register(fastifyOauth2, {
    name: "googleOAuth2",
    scope: ["profile", "email"],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/auth/google",
    callbackUri: `${process.env.API_URL}/auth/google/callback`,
  });

  fastify.get("/auth/google/callback", async function (request, reply) {
    try {
      const tokenResponse =
        await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
          request
        );
      console.log("✅ access_token recebido:", tokenResponse.access_token);

      const userInfoRes = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      const profile = await userInfoRes.json();
      console.log("🔍 Google profile:", profile);

      // 🛡️ Verifica se o email foi retornado
      if (!profile.email) {
        console.warn("⚠️ Email ausente no perfil do Google:", profile);
        return reply.redirect(
          `${process.env.FRONTEND_URL.replace(
            /\/$/,
            ""
          )}/login?error=missing_email`
        );
      }

      // 🔍 Verifica se o usuário com o e-mail do Google existe
      const user = await knex("users").where({ email: profile.email }).first();

      if (!user) {
        return reply.redirect(
          `${process.env.FRONTEND_URL.replace(
            /\/$/,
            ""
          )}/login?error=not_registered`
        );
      }

      // 🔐 Gera JWT e salva no banco
      const daysValid = 30;
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: `${daysValid}d`,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysValid);

      await knex("tokens").insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt,
        created_at: new Date(),
      });

      reply.redirect(
        `${process.env.FRONTEND_URL.replace(
          /\/$/,
          ""
        )}/login/callback?token=${token}`
      );
    } catch (err) {
      console.error("❌ Erro ao fazer login com Google:", err);
      reply.redirect(
        `${process.env.FRONTEND_URL.replace(
          /\/$/,
          ""
        )}/login?error=google_login_failed`
      );
    }
  });
});
