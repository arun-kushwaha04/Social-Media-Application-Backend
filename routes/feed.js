const express = require('express');
const router = express.Router();
const { addPost, getUserPost, editUserPost, deleteUserPost, getFollowingPosts } = require('../controller/feed');
const { verifyToken } = require('../middlewares/tokenVerifier');

router.post('/addPost', verifyToken, addPost);
router.get('/getUserPost', verifyToken, getUserPost);
router.post('/editUserPost', verifyToken, editUserPost);
router.post('/deleteUserPost', verifyToken, deleteUserPost);
router.get('/getFollowingPosts', verifyToken, getFollowingPosts);

module.exports = router;