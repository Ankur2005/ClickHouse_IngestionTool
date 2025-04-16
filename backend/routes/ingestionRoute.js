const { Router } = require('express');
const { ingestData } = require('../controllers/ingestion.controller.js');
const authenticate = require('../middlewares/auth.js');

const router = Router();

router.post('/', authenticate, ingestData);

module.exports = router;