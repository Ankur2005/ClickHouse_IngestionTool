const { ClickHouse } = require('clickhouse');

module.exports = async function createClickHouseClient({ host, port, username, token, database, protocol = 'http' }) {
  if (!host || !port || !token || !database) {
    throw new Error('Missing required parameters');
  }

  return new ClickHouse({
    url: `${protocol}://${host}`,
    port,
    debug: fase,
    basicAuth: {
      username: username,
    },
    format: "json",
    config: {
      database,
    },
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}