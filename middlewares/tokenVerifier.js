const jwt = require('jsonwebtoken');
const client = require('../configs/db');

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    jwt.verify(token, process.env.SECRET_KEY, (err, result) => {
        if (err) {
            console.log("here is error");
            res.status(500).json({
                message: "Invalid Token",
            })
        } else {
            const userId = result.userId;
            const email = result.email;
            const name = result.name;
            client.query(`SELECT * FROM users WHERE email = '${email}';`, (err, data) => {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        message: "Internal server Error",
                    })
                } else {
                    if (data.rows.length === 0 || data.rows[0].name !== name || data.rows[0].id !== userId) {
                        console.log("Inavalid Token");
                        res.status(400).json({
                            message: "Invalid Token",
                        })
                    } else {
                        req.userId = userId;
                        req.name = name;
                        req.email = email;
                        next();
                    }
                }
            })
        }
    })
}