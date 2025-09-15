exports.up = function(knex) {
  return knex.schema.createTable('user_crops', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('crop_id').unsigned().notNullable();
    table.integer('quantity').defaultTo(0);
    table.timestamp('planted_at');
    table.timestamp('harvest_ready_at');
    table.boolean('is_harvested').defaultTo(false);
    table.boolean('notification_sent').defaultTo(false);
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('crop_id').references('id').inTable('crops').onDelete('CASCADE');
    
    table.index(['user_id']);
    table.index(['harvest_ready_at']);
    table.index(['is_harvested']);
    table.index(['notification_sent']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_crops');
};
