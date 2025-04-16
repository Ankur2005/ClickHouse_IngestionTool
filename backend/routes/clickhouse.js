const { Router } = require('express');
const {
    connect,
    getTables,
    getTableSchema,
    previewTable,
    exportTableToCSV,
    exportJoinResult
} = require('../controllers/clickhouse.controller.js');
const { attachClickHouse } = require('../middlewares/clickhouse.middleware.js');

const router = Router();

router.post('/connect-clickhouse', connect);

router.use(attachClickHouse);

router.get('/tables', getTables);
router.get('/tables/:table', getTableSchema);
router.get('/tables/:table/preview', previewTable);
router.get('/tables/:table/export', exportTableToCSV);
router.post('/join/export', exportJoinResult);

module.exports = router;