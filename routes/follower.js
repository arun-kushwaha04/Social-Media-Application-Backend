const express = require('express');
const { getFollowing, getFollower, getUserList, getSuggestionList, addFollowing, removeFollowing, isUserFollowing } = require('../controller/follower');
const { verifyToken } = require('../middlewares/tokenVerifier');
const router = express.Router();

router.get('/getFollowing', verifyToken, getFollowing);
router.get('/getFollower', verifyToken, getFollower);
router.get('/getUserList', getUserList);
router.get('/getSuggestionList', verifyToken, getSuggestionList);
router.post('/addFollowing', verifyToken, addFollowing);
router.post('/removeFollowing', verifyToken, removeFollowing);
router.post('/isUserFollowing', verifyToken, isUserFollowing);
module.exports = router;