const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const client = require('../configs/db');

//creating a sign up method 
exports.signUp = (req, res) => {
    const { name, email, password } = req.body;
    //checking if a user already exist with given email id
    client.query(`SELECT * FROM users WHERE email = '${email}'`, (err, data) => {
        //if error occured
        if (err) {
            console.log(`Error occured in searching users\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        }
        //else move forward
        else {
            const userExists = data.rows.length;
            if (userExists !== 0) {
                res.status(400).json({ message: 'User Already exists, Try To Login', });
            }
            //If user not exist then add user in database 
            else {
                //creating hash password
                client.query(`SELECT * FROM unverifiedUsers WHERE email = '${email}'`, (err, data) => {
                    //if error occured
                    if (err) {
                        console.log(`Error occured in searching users\n ${err}`);
                        res.status(500).json({ message: 'Internal Server Error Please Try Again', });
                    }
                    //else move forward
                    else {
                        const userExists = data.rows.length;
                        if (userExists !== 0) {
                            res.status(200).json({
                                message: `Accounting Creation Pending, Verify Email to Complete Account Creation Process.`,
                                userToken: data.rows[0].userToken,
                                domain: process.env.domain,
                                key: process.env.key,
                            });
                        } else {
                            bcrypt.hash(password, 10, (err, hash) => {
                                if (err) {
                                    console.log(`Error occured in hashing password\n ${err}`);
                                    res.status(500).json({ message: 'Internal Server Error Please Try Again', });
                                } else {
                                    const token = jwt.sign({
                                            name: name,
                                            email: email,
                                        },
                                        process.env.SECRET_KEY,
                                    );
                                    client.query(`INSERT INTO unverifiedUsers (name, email, password, userToken) VALUES ('{${name}}', '${email}', '${hash}', '${token}'); `, (err) => {
                                        if (err) {
                                            console.log(`Error occured in adding unverifiedusers\n ${err}`);
                                            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
                                        } else {
                                            console.log('User added successfully');
                                            res.status(200).json({
                                                message: `Accounting Creation Pending, Verify Email to Complete Account Creation Process.`,
                                                userToken: token,
                                                domain: process.env.DOMAIN,
                                                key: process.env.KEY,
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
};



//siginig a valid user 
exports.login = (req, res) => {
    const { email, password } = req.body;
    //checking if a user already exist with given email id
    client.query(`SELECT * FROM users WHERE email = '${email}'`, (err, data) => {
        //if error occured
        if (err) {
            console.log(`Error occured in searching users\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        }
        //else move forward
        else {
            const userExists = data.rows.length;
            if (userExists == 0) {
                res.status(400).json({ message: 'No Such User Exists Try Registering Yourself', });;
            }
            //If user exist then check credentials
            else {
                //comparing hash password
                bcrypt.compare(password, data.rows[0].password, (err, result) => {
                    if (err) {
                        console.log(`Error occured in comparing password\n ${err}`);
                        res.status(500).json({ message: 'Internal Server Error Please Try Again', });
                    } else {
                        if (!result) {
                            res.status(401).json({ message: 'Invalid Password', });
                        } else {
                            //creating token for user
                            const token = jwt.sign({
                                    userId: data.rows[0].id,
                                    name: data.rows[0].name,
                                    email: email,
                                },
                                process.env.SECRET_KEY,
                            );
                            //finally logging in the user
                            res.status(200).json({
                                message: 'User Logged in successfully',
                                dashboardUrl: '/Pages/Dashboard/index.html',
                                userToken: token,
                            })
                        }
                    }
                });
            }
        }
    });
};


exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    //checking if a user already exist with given email id
    client.query(`SELECT * FROM users WHERE email = '${email}'`, (err, data) => {
        //if error occured
        if (err) {
            console.log(`Error occured in searching users\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        }
        //else move forward
        else {
            const userExists = data.rows.length;
            if (userExists == 0) {
                res.status(400).json({ message: 'No Such User Exists Try Registering Yourself', });;
            } else {
                const token = jwt.sign({
                        userId: data.rows[0].id,
                        name: data.rows[0].name,
                        email: email,
                    },
                    process.env.SECRET_KEY, { expiresIn: '1m' }
                );
                res.status(200).json({
                    message: 'Reset Password Has Been Email Sent',
                    userToken: token,
                    domain: process.env.DOMAIN,
                    key: process.env.KEY,
                })
            }
        }
    });
};


exports.resetPassword = (req, res) => {
    const password = req.body.password;
    //checking if a user already exist with given email id
    client.query(`SELECT * FROM users WHERE email = '${req.email}'`, (err, data) => {
        //if error occured
        if (err) {
            console.log(`Error occured in searching users\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        }
        //else move forward
        else {
            const userExists = data.rows.length;
            if (userExists == 0) {
                res.status(400).json({ message: 'No Such User Exists Try Registering Yourself', });;
            }
            //If user exist then check credentials
            else {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) {
                        console.log(`Error occured in hashing password\n ${err}`);
                        res.status(500).json({ message: 'Internal Server Error Please Try Again', });
                    } else {
                        client.query(`UPDATE users SET password='${hash}' WHERE email='${req.email}'`, err => {
                            if (err) {
                                res.status(500).json({ message: "Internal Server Error", });
                            } else {
                                res.status(200).json({
                                    message: "Password Updated successfully",
                                });
                            }
                        });
                    }
                })
            }
        }
    });
};

exports.verifyEmail = (req, res) => {
    const userToken = req.headers.authorization;
    const email = req.body.email;
    console.log(email);
    client.query(`SELECT * FROM unverifiedUsers WHERE email = '${email}';`, (err, data) => {
        //if error occured
        if (err) {
            console.log(`Error occured in searching users\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        }
        //else move forward
        else {
            const userExists = data.rows.length;
            if (userExists == 0) {
                res.status(400).json({ message: 'Verification Link Expired', });
            } else {
                const name = data.rows[0].name;
                const password = data.rows[0].password;
                const token = data.rows[0].usertoken;
                if (token === userToken) {
                    client.query(`DELETE FROM unverifiedUsers WHERE email = '${email}';`, err => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Internal Server Error Please Try Logging YourSelf' })
                        } else {
                            client.query(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${password}'); `, err => {
                                if (err) { res.status(500).json({ message: 'Internal Server Error Please Try Registering YourSelf Again' }) } else {
                                    res.status(200).json({
                                        message: 'Email Verified Successfully !!'
                                    })
                                }
                            })
                        }
                    })
                } else {
                    res.status(400).json({ message: 'Verification Link Expired' })
                }
            }
        }
    });
}