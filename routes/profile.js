const express = require('express');
const { verifyToken } = require('../middlewares/tokenVerifier');
const { updatePassword, updateName, updateAbout, userInfo, updateProfilePhoto } = require('../controller/profile');
const router = express.Router();

// router.post('/getUserData', verifyToken, userData);
router.post('/getUserinfo', verifyToken, userInfo);
router.put('/updateName', verifyToken, updateName);
router.put('/updatePassword', verifyToken, updatePassword);
router.put('/updateProfilePhoto', verifyToken, updateProfilePhoto);
router.put('/updateAbout', verifyToken, updateAbout);

module.exports = router;