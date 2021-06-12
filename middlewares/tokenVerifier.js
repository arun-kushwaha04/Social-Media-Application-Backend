const jwt = require('jsonwebtoken');
const client = require('../configs/db');

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    jwt.verify(token, process.env.SECRET_KEY, (err, result) => {
        if (err) {
            res.status(500).json({
                message: "Internal Error Ocurred",
            })
        } else {
            if (result) {
                const userId = result.userId;
                const email = result.email;
                const name = result.name;
                const username = result.username;
                client.query(`SELECT * FROM users WHERE email = '${email}';`, (err, data) => {
                    if (err) {
                        console.log(err.message);
                        res.status(500).json({
                            message: "Internal server Error",
                        })
                    } else {
                        if (data.rows.length === 0 || data.rows[0].name !== name || data.rows[0].id !== userId || data.rows[0].username !== username) {
                            console.log("Inavalid Token");
                            res.status(400).json({
                                message: "Token Experied",
                            })
                        } else {
                            req.userId = userId;
                            req.userusername = username;
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