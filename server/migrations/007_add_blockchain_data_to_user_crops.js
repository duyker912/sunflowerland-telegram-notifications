exports.up = function(knex) {
  return knex.schema.alterTable('user_crops', function(table) {
    table.json('blockchain_data').nullable();
    table.string('transaction_hash').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('user_crops', function(table) {
    table.dropColumn('blockchain_data');
    table.dropColumn('transaction_hash');
  });
};
