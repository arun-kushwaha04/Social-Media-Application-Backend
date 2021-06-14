const express = require('express');
const router = express.Router();
const { addPost, getUserPost, deleteUserPost } = require('../controller/feed');
const { verifyToken } = require('../middlewares/tokenVerifier');

router.post('/addPost', verifyToken, addPost);
router.get('/getUserPost', verifyToken, getUserPost);
router.post('/deleteUserPost', verifyToken, deleteUserPost);

module.exports = router;