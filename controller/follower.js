const client = require('../configs/db');

exports.getFollowing = (req, res) => {
    client.query(`SELECT following,username,profilephoto FROM follower INNER JOIN users ON follower.following = users.id WHERE follower.follower = ${req.userId}`, (err, data) => {
        if (err) {
            console.log(`Error occured in searching following\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        } else {
            const temp = [];
            data.rows.forEach(element => {
                const following = element.following;
                const followingrusername = element.username;
                const profilephoto = element.profilephoto;
                const tempData = {
                    following,
                    followingrusername,
                    profilephoto,
                }
                temp.push(tempData);
            });
            res.status(200).json({
                message: "Following Found Successfully",
                follower: temp,
            })
        }
    })
}

exports.getFollower = (req, res) => {
    client.query(`SELECT follower,username,profilephoto FROM follower INNER JOIN users ON follower.follower = users.id WHERE follower.following = ${req.userId}`, (err, data) => {
        if (err) {
            console.log(`Error occured in searching follower\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        } else {
            const temp = [];
            data.rows.forEach(element => {
                const follower = element.follower;
                const followerusername = element.username;
                const profilephoto = element.profilephoto;
                const tempData = {
                    follower,
                    followerusername,
                    profilephoto,
                }
                temp.push(tempData);
            });
            res.status(200).json({
                message: "Follower Found Successfully",
                following: temp,
            })
        }
    })
}

exports.getUserList = (req, res) => {
    client.query(`SELECT id, username, email, name, profilephoto FROM users ORDER BY likes DESC;`, (err, users) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error', });
        } else {
            res.status(200).json({
                message: 'Users Reterived Successfully',
                users: users.rows,
            })
        }
    })
}


exports.getSuggestionList = (req, res) => {
    client.query(`SELECT id, username, profilephoto FROM users WHERE id NOT IN ( SELECT following FROM follower WHERE follower = ${req.userId}) AND NOT id = ${req.userId} ORDER BY likes DESC;`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error', });
        } else {
            const users = data.rows;
            res.status(200).json({
                message: 'Users Reterived Successfully',
                users,
            })
        }
    })
}

exports.addFollowing = (req, res) => {
    const { following, followingrusername } = req.body;

    client.query(`BEGIN TRANSACTION;
    INSERT INTO follower VALUES (${req.userId},${following});
    UPDATE users SET followingcount = users.followingcount + 1 WHERE id = ${req.userId};
    UPDATE users SET followercount = users.followercount + 1 WHERE id = ${following};
    COMMIT;
    `, err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: `Followed ${followingrusername}`,
            })
        }
    })
}
exports.removeFollowing = (req, res) => {
    const { following, followingrusername } = req.body;
    console.log(req.body);
    client.query(`BEGIN TRANSACTION;
    DELETE FROM follower WHERE follower = ${req.userId} AND following = ${following};
    UPDATE users SET followingcount = users.followingcount - 1 WHERE id = ${req.userId};
    UPDATE users SET followercount = users.followercount - 1 WHERE id = ${following};    
    COMMIT;
    `, err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: `Un-Followed ${followingrusername}`,
            })
        }
    })
}

exports.isUserFollowing = (req, res) => {
    const { username } = req.body;

    client.query(`
    SELECT t1.username from follower INNER JOIN users t1 on following = t1.id WHERE follower = ${req.userId} and t1.username = '${username}'
    `, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            let value = 1;
            if (data.rowCount === 0) value = 0;
            res.status(200).json({
                value,
            })
        }
    })
}