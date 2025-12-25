import sequelize from '../config/db.js';

async function drop() {
  try {
    console.log('Connecting to DB...');
    await sequelize.authenticate();
    console.log('Connected. Dropping table `transactions`...');
    await sequelize.getQueryInterface().dropTable('transactions');
    console.log('Dropped table `transactions` successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error dropping table transactions:', err.message || err);
    process.exit(1);
  }
}

drop();
