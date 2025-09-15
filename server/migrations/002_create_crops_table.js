exports.up = function(knex) {
  return knex.schema.createTable('crops', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('type').notNullable(); // 'crop', 'tree', 'bush'
    table.integer('grow_time').notNullable(); // thời gian phát triển (giây)
    table.integer('harvest_time').notNullable(); // thời gian thu hoạch (giây)
    table.integer('sell_price').notNullable(); // giá bán
    table.string('image_url');
    table.text('description');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['type']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('crops');
};
