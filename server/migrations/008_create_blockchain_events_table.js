exports.up = function(knex) {
  return knex.schema.createTable('blockchain_events', function(table) {
    table.increments('id').primary();
    table.string('event_type').notNull(); // Transfer, Approval, etc.
    table.string('network').notNull(); // base, polygon
    table.string('contract_address').notNull();
    table.string('transaction_hash').notNull();
    table.bigInteger('block_number').notNull();
    table.json('event_data').notNull();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index(['network', 'contract_address']);
    table.index(['transaction_hash']);
    table.index(['block_number']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('blockchain_events');
};
