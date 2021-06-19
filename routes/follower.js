const express = require('express');
const { getFollowing, getFollower } = require('../controller/follower');
const { verifyToken } = require('../middlewares/tokenVerifier');
const router = express.Router();

router.get('/getFollowing', verifyToken, getFollowing);
router.get('/getFollower', verifyToken, getFollower);
module.exports = router;