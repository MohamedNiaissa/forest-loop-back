const express = require('express')
const testCtrl = require('../controllers/test')
const router = express.Router();

router.get('', testCtrl.getTest);

module.exports = router;
