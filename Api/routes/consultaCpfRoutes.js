const express = require('express');
const router = express.Router();
const consultaCpfController = require('../controllers/consultaCpfController');

router.post('/', consultaCpfController.consultaCpf);

module.exports = router;