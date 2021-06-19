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