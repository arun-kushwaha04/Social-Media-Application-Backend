const express = require('express');
const { getFollowing, getFollower, getUserList, getSuggestionList } = require('../controller/follower');
const { verifyToken } = require('../middlewares/tokenVerifier');
const router = express.Router();

router.get('/getFollowing', verifyToken, getFollowing);
router.get('/getFollower', verifyToken, getFollower);
router.get('/getUserList', getUserList);
router.get('/getSuggestionList', verifyToken, getSuggestionList);
module.exports = router;