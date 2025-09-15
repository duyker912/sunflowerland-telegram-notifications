/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('user_crops', function(table) {
    // Thêm cột harvest_time nếu chưa có
    table.timestamp('harvest_time').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('user_crops', function(table) {
    table.dropColumn('harvest_time');
  });
};
