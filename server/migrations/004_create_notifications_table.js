exports.up = function(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('type').notNullable(); // 'harvest_ready', 'crop_wilting', 'daily_summary'
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.json('data').defaultTo('{}'); // dữ liệu bổ sung
    table.boolean('sent').defaultTo(false);
    table.timestamp('sent_at');
    table.timestamp('scheduled_for');
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    table.index(['user_id']);
    table.index(['type']);
    table.index(['sent']);
    table.index(['scheduled_for']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};
