exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('telegram_chat_id').unique();
    table.string('telegram_username');
    table.boolean('telegram_linked').defaultTo(false);
    table.boolean('notifications_enabled').defaultTo(true);
    table.json('notification_settings').defaultTo('{}');
    table.timestamp('last_login').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    table.index(['email']);
    table.index(['telegram_chat_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
