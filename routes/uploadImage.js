const express = require('express');
const { addFeed } = require('../controller/uploadImage');
const router = express.Router();

router.get('/addFeed', addFeed);

module.exports = router;