const jwt = require('jsonwebtoken');
const client = require('../configs/db');

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    console.log('request made');
    jwt.verify(token, process.env.SECRET_KEY, (err, result) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                const payload = jwt.verify(token, process.env.SECRET_KEY, { ignoreExpiration: true });
                client.query(`UPDATE users SET isLoggedin = 0 WHERE id = ${payload.userId};`)
                res.status(200).json({
                    message: "Token Expired",
                })
            } else {
                res.status(400).json({
                    message: "Internal Server Error",
                })
            }
            console.log('here invalid token');
        } else {
            if (result) {
                const userId = result.userId;
                const email = result.email;
                const name = result.name;
                const username = result.username;
                client.query(`SELECT id, name ,username ,email, profilephoto FROM users WHERE email = '${email}';`, (err, data) => {
                    if (err) {
                        console.log(err.message);
                        res.status(500).json({
                            message: "Internal server Error",
                        })
                    } else {
                        if (data.rows.length === 0 || data.rows[0].name !== name || data.rows[0].id !== userId || data.rows[0].username !== username) {
                            console.log("Inavalid Token");
                            res.status(400).json({
                                message: "Invalid Token",
                            })
                        } else {
                            req.userId = userId;
                            req.username = username;
                            req.name = name;
                            req.email = email;
                            next();
                        }
                    }
                })
            } else {
                res.status(400).json({ message: "Token Expired" })
            }
        }
    })
}