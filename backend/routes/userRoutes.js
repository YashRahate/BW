const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userControllers');

router.get('/', getUsers);

module.exports = router;
