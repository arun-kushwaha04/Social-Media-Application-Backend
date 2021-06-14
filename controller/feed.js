const client = require('../configs/db');

exports.addPost = (req, res) => {
    const { description, image } = req.body;
    const images = '[';
    image.forEach(element => {
        const temp = `${element}`;
        images += temp;
    });
    client.query(`INSERT INTO feeds (userId, username, originaialUserId, originalUsername, description, images, likes, comments, shares) VALUES (${req.userId}, '${req.username}', ${req.userId}, '${req.username}', '${description}', '{${images}}', 0, 0, 0);`, err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Post Created",
            });
        }
    });
}

exports.getUserPost = (req, res) => {
    client.query(`SELECT * FROM feeds WHERE userId = ${req.userId}`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Feeds Reterived Successfully",
                feeds: data.rows,
            });
        }
    });
}

exports.editUserPost = (req, res) => {
    const { postid, description, image } = req.body;
    client.query(`UPDATE feeds SET description = ${description} image = ${image} WHERE postid = ${postid};`, err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Post Updtaed",
            });
        }
    });
}

exports.deleteUserPost = (req, res) => {
    const { postId } = req.body;
    client.query(`DELETE FROM feeds WHERE postid = ${postId} and userId = ${req.userId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (data.rowCount === 1) {
                res.status(200).json({
                    message: "Post Deleted",
                });
            }
            if (data.rowCount === 0) {
                res.status(400).json({
                    message: "Your Not Authoriized To Delete This Post",
                });
            }

        }
    });
}

exports.getFollowingPosts = (req, res) => {
    client.query(`SELECT * FROM feeds INNER JOIN follower ON feeds.userid = follower.following AND follower.follower = ${req.userId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Following Post Retervied Successfully",
                post: data.rows,
            });
        }
    })
}