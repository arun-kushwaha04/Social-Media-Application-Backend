const express = require('express');
const { verifyToken } = require('../middlewares/tokenVerifier');
const { userData, updateEmail, updatePassword, updateName, updateAbout } = require('../controller/profile');
const router = express.Router();

router.post('/getUserData', verifyToken, userData);
router.put('/updateEmail', verifyToken, updateEmail);
router.put('/updateName', verifyToken, updateName);
router.put('/updatePassword', verifyToken, updatePassword);
router.put('/updateAbout', verifyToken, updateAbout);

module.exports = router;