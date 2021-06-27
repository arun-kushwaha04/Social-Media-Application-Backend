const client = require('../configs/db');

exports.getFollowing = (req, res) => {
    client.query(`SELECT * FROM follower INNER JOIN users ON follower.following = users.id WHERE follower.follower = ${req.userId}`, (err, data) => {
        if (err) {
            console.log(`Error occured in searching following\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        } else {
            const temp = [];
            data.rows.forEach(element => {
                const { following, followingrusername, profilephoto } = element;
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
    client.query(`SELECT * FROM follower INNER JOIN users ON follower.follower = users.id WHERE follower.following = ${req.userId}`, (err, data) => {
        if (err) {
            console.log(`Error occured in searching follower\n ${err}`);
            res.status(500).json({ message: 'Internal Server Error Please Try Again', });
        } else {
            const temp = [];
            data.rows.forEach(element => {
                const { follower, followerusername, profilephoto } = element;
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
    client.query(`SELECT id, username, email, likes, profilephoto FROM users`, (err, users) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error', });
        } else {
            res.status(200).json({
                message: 'Users Reterived Successfully',
                users,
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

    client.query(`INSERT INTO follower VALUES (${req.userId},'${req.username}',${following},'${followingrusername}')`, err => {
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

    client.query(`DELETE FROM follower WHERE follower = ${req.userId} AND following = ${following}`, err => {
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