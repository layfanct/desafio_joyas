const express = require('express');
const router = express.Router();
const { getJoyas, getFilteredJoyas } = require('../controllers/joyasController');

// Routes
router.get('/', getJoyas);
router.get('/filtros', getFilteredJoyas);

module.exports = router;
