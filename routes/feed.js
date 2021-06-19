const express = require('express');
const router = express.Router();
const { addPost, getUserPost, editUserPost, deleteUserPost, getFollowingPosts, updateLike, updateShare, commentPost, getAllPostComment, getFollower, getPost } = require('../controller/feed');
const { verifyToken } = require('../middlewares/tokenVerifier');

router.post('/addPost', verifyToken, addPost);
router.get('/getUserPost', verifyToken, getUserPost);
router.post('/editUserPost', verifyToken, editUserPost);
router.post('/deleteUserPost', verifyToken, deleteUserPost);
router.get('/getFollowingPosts', verifyToken, getFollowingPosts);
router.get('/updateLike', verifyToken, updateLike);
router.get('/updateShare', verifyToken, updateShare);
router.get('/commentPost', verifyToken, commentPost);
router.get('/getAllPostComment', verifyToken, getAllPostComment);
router.get('/getFollower', verifyToken, getFollower);
router.get('/getPost', verifyToken, getPost);
module.exports = router;