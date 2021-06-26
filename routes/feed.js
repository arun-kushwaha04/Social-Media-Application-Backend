const express = require('express');
const router = express.Router();
const { addPost, getUserPost, editUserPost, deleteUserPost, getFollowingPosts, updateLike, sharePost, commentPost, getAllPostComment, getFollower, getPost, isLiked } = require('../controller/feed');
const { verifyToken } = require('../middlewares/tokenVerifier');

router.post('/addPost', verifyToken, addPost);
router.get('/getUserPost', verifyToken, getUserPost);
router.post('/editUserPost', verifyToken, editUserPost);
router.post('/deleteUserPost', verifyToken, deleteUserPost);
router.get('/getFollowingPosts', verifyToken, getFollowingPosts);
router.post('/updateLike', verifyToken, updateLike);
router.post('/isLiked', verifyToken, isLiked);
router.post('/sharePost', verifyToken, sharePost);
router.post('/commentPost', verifyToken, commentPost);
router.post('/getAllPostComment', verifyToken, getAllPostComment);
router.get('/getFollower', verifyToken, getFollower);
router.get('/getPost', verifyToken, getPost);
module.exports = router;