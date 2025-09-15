exports.up = function(knex) {
  return knex.schema.alterTable('user_crops', function(table) {
    // Thêm các column còn thiếu
    table.timestamp('harvest_ready_at').nullable();
    table.boolean('is_harvested').defaultTo(false);
    table.boolean('notification_sent').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('user_crops', function(table) {
    table.dropColumn('harvest_ready_at');
    table.dropColumn('is_harvested');
    table.dropColumn('notification_sent');
  });
};
