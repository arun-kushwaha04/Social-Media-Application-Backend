const express = require('express');
const router = express.Router();
const { addStory, getUserStory, isImageLiked, updateLikeStory } = require('../controller/story');
const { verifyToken } = require('../middlewares/tokenVerifier');

router.post('/addStory', verifyToken, addStory);
router.get('/getUserStory', verifyToken, getUserStory);
router.post('/isImageLiked', verifyToken, isImageLiked);
router.post('/updateLikeStory', verifyToken, updateLikeStory);
// router.get('/getFollowing', verifyToken, getFollowing);
module.exports = router;