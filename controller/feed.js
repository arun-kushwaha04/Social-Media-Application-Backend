const client = require('../configs/db');

//Adding the post of the user
exports.addPost = (req, res) => {
    const { description, image } = req.body;
    // const images = '[';
    // image.forEach(element => {
    //     const temp = `${element}`;
    //     images += temp;
    // });
    const images = image;
    client.query(`BEGIN TRANSACTION;
    INSERT INTO posts (userId, userusername, originalUserId, originalUsername, description, images, postlikes, postcomments, postshare) VALUES (${req.userId}, '${req.username}', ${req.userId}, '${req.username}', '${description}', '{${images}}', 0, 0, 0);
    UPDATE users SET postmade = users.postmade + 1 WHERE id = ${req.userId};
    COMMIT;
    `, err => {
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

//getting user post
exports.getUserPost = (req, res) => {
    client.query(`SELECT * FROM users inner join posts ON posts.userid = users.id WHERE posts.userid = ${req.userId}`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Posts Reterived Successfully",
                post: data.rows,
            });
        }
    });
}

//edit the user post
exports.editUserPost = (req, res) => {
    const { postid, description, image } = req.body;
    client.query(`UPDATE posts SET description = ${description} image = ${image} WHERE postid = ${postid};`, err => {
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

//deleting the user post
exports.deleteUserPost = (req, res) => {
    const { postId } = req.body;
    client.query(`
    BEGIN TRANSACTION;
    DELETE FROM posts WHERE postid = ${postId} and userId = ${req.userId};
    UPDATE users SET postcount = users.postcount-1 WHERE userid = ${userid};
    COMMIT;
    `, (err, data) => {
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

//get the post of following user
exports.getFollowingPosts = (req, res) => {
    client.query(`SELECT * FROM posts INNER JOIN follower ON posts.userid = follower.following AND follower.follower = ${req.userId};`, (err, data) => {
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

//update like on a post
exports.updateLike = (req, res) => {
    const { postId, value, userid, originaluserid } = req.body;
    client.query(`BEGIN TRANSACTION;
            update users
            SET likes = users.likes + ${value} 
            where
            id = ${userid} or id = ${originaluserid};
            update posts
            SET postlikes = posts.postlikes + ${value} 
            where
            postid = ${postId} 
            COMMIT;
            `, err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "You Liked The Post ",
            });
        }
    })
}

//share a post of the user
exports.updateshare = (req, res) => {
    const { postId } = req.body;
    client.query(`SELECT * FROM posts WHERE postID = ${postId}`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            client.query(`INSERT INTO posts (userId, userusername, originaialUserId, originalUsername, description, images, postlikes, postcomments, postshares) VALUES (${req.userId}, '${req.username}', ${data.rows[0].userId}, '${data.rows[0].userusername}', '${data.rows[0].description}', '{${data.rows[0].images}}', 0, 0, 0);`, err => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ message: "Internal Server Error" });
                } else {
                    client.query(`BEGIN TRANSACTION;
                    update users
                    SET share = users.share + 1
                    where
                    id = ${userid} or id = ${originaluserid};
                    update posts
                    SET postshare = posts.postshare + 1 
                    where
                    postid = ${postId} 
                    COMMIT;
                    `, err => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: "Internal Server Error" });
                        } else {
                            res.status(200).json({
                                message: "You Shared The Post ",
                            });
                        }
                    })
                }
            })
        }
    })
}

//making comment on the post of the user
exports.commentPost = (req, res) => {
    const { postId, comment } = req.body;
    client.query(`BEGIN TRANSACTION;
            update users
            SET share = users.comment + 1
            WHERE
            id = ${userid} or id = ${originaluserid};
            update posts
            SET postshare = posts.postcomment + 1 
            where
            postid = ${postId} 
            COMMIT;
            `, err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            client.query(`INSERT INTO comment (postId, userid, username, comment) VALUES (${postId},${userid},'${username}','${comment}');`);
            res.status(200).json({
                message: "Comment Made Successfully",
            });
        }
    })
}

//getting the comment on a post
exports.getAllPostComment = (req, res) => {
    postId = req.body.postId;
    client.query(`SELECT * FROM comment WHERE postId = ${postId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Comment For The Post Retrieved Successfully",
                comment: data.rows,
            })
        }
    })
}

//a user follower count
exports.getFollower = (req, res) => {
    client.query(`SELECT * FROM users WHERE username = '${req.user.username}';`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Follower count returned successfully",
                followerCount: data.rows[0].followercount,
            })
        }
    })
}

//a user post count
exports.getPost = (req, res) => {
    client.query(`SELECT * FROM users WHERE username = '${req.user.username}';`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Post count returned successfully",
                postCount: data.rows[0].postcount,
            })
        }
    })
}