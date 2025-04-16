const { Router } = require('express');
const { upload } = require('../middlewares/multerUpload.js');
const { ingestCSV } = require('../controllers/file.controller.js');
const { attachClickHouse } = require('../middlewares/clickhouse.middleware.js');

const router = Router();
router.use(attachClickHouse);

// router.post('/upload', upload.single('csvFile'), ingestCSV);

module.exports = router;