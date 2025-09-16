exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('sunflower_farm_id').nullable();
    table.json('blockchain_data').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('sunflower_farm_id');
    table.dropColumn('blockchain_data');
  });
};

