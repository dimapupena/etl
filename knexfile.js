const options = {
  client: 'pg',
  connection: {
    database: 'olap',
    user: 'postgres',
    password: 'root',
    host: 'localhost',
  },
  pool: {
    min: 2,
    max: 10,
  },
};

module.exports = options;
