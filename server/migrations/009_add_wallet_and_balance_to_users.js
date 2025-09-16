exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('wallet_address').nullable();
    table.string('flower_balance').defaultTo('0');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('wallet_address');
    table.dropColumn('flower_balance');
  });
};

