const { exportTableToCSV } = require('./clickhouse.controller.js');
const { ingestCSV } = require('./file.controller.js');

module.exports = function ingestData(req, res) {
  const { direction } = req.body;
  if (direction === 'clickhouse-to-file') {
    return exportTableToCSV(req, res);
  } else if (direction === 'file-to-clickhouse') {
    return ingestCSV(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid ingestion direction' });
  }
}