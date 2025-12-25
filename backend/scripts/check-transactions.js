import sequelize from '../config/db.js';

async function check() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SHOW TABLES LIKE 'transactions'");
    if (Array.isArray(results) && results.length > 0) {
      console.log('transactions table EXISTS');
    } else {
      console.log('transactions table DOES NOT EXIST');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking transactions table:', err.message || err);
    process.exit(1);
  }
}

check();
