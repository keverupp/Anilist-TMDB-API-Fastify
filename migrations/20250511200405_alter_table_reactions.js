// migrations/20250511_extend_reactions_enum.js

exports.up = async function (knex) {
  // 1) cria o enum "novo"
  await knex.raw(`
    CREATE TYPE reactions_type_enum_new AS ENUM (
      'like',
      'dislike',
      'upvote',
      'downvote'
    );
  `);

  // 2) Alter the column to TEXT temporarily
  await knex.schema.alterTable("reactions", (table) => {
    table.string("type").alter();
  });

  // 3) Update the column to the new enum type
  await knex.raw(`
    ALTER TABLE reactions
    ALTER COLUMN "type"
    TYPE reactions_type_enum_new
    USING "type"::text::reactions_type_enum_new;
  `);

  // 4) descarta o enum antigo (check if it exists first)
  const enumExists = await knex.raw(`
    SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reactions_type_enum');
  `);

  if (enumExists.rows[0].exists) {
    await knex.raw(`DROP TYPE reactions_type_enum;`);
  } else {
    console.log(
      'Enum type "reactions_type_enum" does not exist, skipping drop.'
    );
  }

  // 5) renomeia o enum novo para o nome original
  await knex.raw(`
    ALTER TYPE reactions_type_enum_new
    RENAME TO reactions_type_enum;
  `);
};

exports.down = async function (knex) {
  // Para reverter, criou-se um enum apenas com like/dislike e restaurou-se tudo:
  await knex.raw(`
    CREATE TYPE reactions_type_enum_old AS ENUM (
      'like',
      'dislike'
    );
  `);

  // Revert the type back to TEXT temporarily
  await knex.schema.alterTable("reactions", (table) => {
    table.string("type").alter();
  });

  await knex.raw(`
    ALTER TABLE reactions
    ALTER COLUMN "type"
    TYPE reactions_type_enum_old
    USING "type"::text::reactions_type_enum_old;
  `);

  // Drop the current enum (which should be reactions_type_enum)
  await knex.raw(`DROP TYPE reactions_type_enum;`);

  await knex.raw(`
    ALTER TYPE reactions_type_enum_old
    RENAME TO reactions_type_enum;
  `);
};
