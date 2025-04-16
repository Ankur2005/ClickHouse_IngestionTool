module.exports = {
    port: process.env.PORT || 5000,
    clickhouse: {
      host: process.env.CLICKHOUSE_HOST || 'http://localhost',
      port: process.env.CLICKHOUSE_PORT || 8123,  
      database: process.env.CLICKHOUSE_DB || 'default',
      username: process.env.CLICKHOUSE_USER || 'default',
      password: process.env.CLICKHOUSE_PASS || '',
    },
    jwtSecret: process.env.JWT_SECRET || 'ingestionkey'
};