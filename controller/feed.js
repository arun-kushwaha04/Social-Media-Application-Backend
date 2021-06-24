const client = require('../configs/db');

//Adding the post of the user
exports.addPost = (req, res) => {
    const { description, image, profilePhoto, dateTime } = req.body;
    console.log(image);
    const images = image;
    client.query(`BEGIN TRANSACTION;
    INSERT INTO posts (userId, userusername, originalUserId, originalUsername, description, images, postlikes, postcomments, postshare, profilephoto,datetime) VALUES (${req.userId}, '${req.username}', ${req.userId}, '${req.username}', '${description}', '{${images}}', 0, 0, 0, '${profilePhoto}','${dateTime}');
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
    client.query(`SELECT * FROM posts WHERE userid = ${req.userId}`, (err, data) => {
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
    const { postid, originaluserid, userid } = req.body;
    let value;
    let message;
    let query;
    client.query(`SELECT * FROM likes WHERE postid = ${postid} and userid = ${req.userId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (data.rows.length === 1) {
                query = `DELETE FROM likes WHERE postid = ${postid} and userid = ${req.userId};`
                value = -1;
                message = `Post Disliked`;
            } else {
                query = `INSERT INTO likes VALUES (${postid},${req.userId});`
                value = 1;
                message = `Post Liked`;
            }
            client.query(`
        BEGIN TRANSACTION;
            UPDATE users SET likes = users.likes + ${value} WHERE id = ${userid} or id = ${originaluserid};
            update posts SET postlikes = posts.postlikes + ${value} WHERE postid = ${postid};
            ${query}
        COMMIT;
            `, err => {
                if (err) {
                    console.log('hi');
                    console.log(err);
                    res.status(500).json({ message: "Internal Server Error" });
                } else {
                    res.status(200).json({
                        message,
                        value,
                    });
                }
            })
        }
    })
}

//is post Liked
exports.isLiked = (req, res) => {
    const postid = req.body.postid;
    client.query(`SELECT * FROM likes WHERE postid = ${postid} and userid = ${req.userId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (data.rows.length === 1) {
                res.status(200).json({ message: "Post Is Liked" });
            } else {
                res.status(200).json({ message: "Post Is Not Liked" });
            }
        }
    })

}


//share a post of the user
exports.updateShare = (req, res) => {
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
    const { postid, comment, originaluserid, dateTime, profilePhoto } = req.body;
    console.log(req.body);
    client.query(`
    BEGIN TRANSACTION;
        UPDATE users SET comments = users.comments + 1 WHERE id = ${req.userId} or id = ${originaluserid};
        UPDATE posts SET postcomments = posts.postcomments + 1 WHERE postid = ${postid};
        INSERT INTO comment (postid, userid, username, comment, datetime, profilephoto) VALUES (${postid},${req.userId},'${req.username}','${comment}','${dateTime}','${profilePhoto}');
    COMMIT;
            `, err => {
        if (err) {
            console.log('error here');
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Comment Made Successfully",
            });
        }
    })
}

//getting the comment on a post
exports.getAllPostComment = (req, res) => {
    postid = req.body.postid;
    client.query(`SELECT * FROM comment WHERE postId = ${postid};`, (err, data) => {
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