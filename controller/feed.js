const client = require('../configs/db');

//Adding the post of the user
exports.addPost = (req, res) => {
    const { description, image, profilePhoto, dateTime, imageRef } = req.body;
    console.log(image);
    const images = image;
    client.query(`BEGIN TRANSACTION;
    INSERT INTO posts (userId, originalUserId, description, images, postlikes, postcomments, postshare, datetime) VALUES (${req.userId}, ${req.userId},$$${description}$$, '{${images}}', 0, 0, 0, '${dateTime}');
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
    client.query(`SELECT postid,originalpostid,userid,originaluserid,description,images,postlikes,postcomments,postshare,datetime,t1.username,t1.profilephoto,t2.originalusername 
    FROM posts inner join users t1 on t1.id = userid 
    JOIN users t2 on posts.originaluserid = t2.id 
    WHERE t1.username = '${req.body.username}' AND t1.id = ${req.body.userId} ORDER BY postid DESC;`, (err, data) => {
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
    const { postId, description, image } = req.body;
    client.query(`UPDATE posts SET description = $$${description}$$, images = '{${image}}' WHERE postid = ${postId};`, err => {
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
    DELETE FROM posts WHERE postid = ${postId} or originalpostid = ${postId};
    `, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (data.rowCount === 1) {
                res.status(200).json({
                    message: "Post Deleted",
                });
            } else if (data.rowCount >= 1) {
                res.status(200).json({
                    message: "Post And All Shared Links Deleted",
                });
            } else if (data.rowCount === 0) {
                res.status(200).json({
                    message: "Your Not Authoriized To Delete This Post",
                });
            }

        }
    });
}

//get the post of following user
exports.getFollowingPosts = (req, res) => {
    client.query(`SELECT 
    posts.postid,posts.originalpostid,posts.userid,posts.originaluserid,posts.description,posts.images,posts.postlikes,posts.postcomments,posts.postshare,posts.datetime,t1.username,t1.profilephoto,t2.originalusername
    FROM posts INNER JOIN follower ON posts.userid = follower.following AND follower.follower = ${req.userId}
    JOIN users t1 on t1.id = posts.userid
    JOIN users t2 on posts.originaluserid = t2.id
    ORDER BY postid DESC;`, (err, data) => {
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

// SELECT * FROM posts INNER JOIN follower ON posts.userid = follower.following AND follower.follower = 2 JOIN users on ​posts.userid = users.id ORDER BY postid DESC;

//update like on a post
exports.updateLike = (req, res) => {
    const { postid, originaluserid, userid, originalpostid } = req.body;
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
            update posts SET postlikes = posts.postlikes + ${value} WHERE postid = ${postid} or postid = ${originalpostid};
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
exports.sharePost = (req, res) => {
    const { postid, profilephoto, dateTime, originalpostid } = req.body;
    client.query(`SELECT * FROM shareposts WHERE userid = ${req.userId} and postid = ${originalpostid}`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            console.log(data.rows);
            if (data.rows.length != 0) {
                res.status(200).json({
                    message: "Post Is Already Shared",
                })
            } else {
                client.query(`SELECT * FROM posts WHERE postid = ${postid}`, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ message: "Internal Server Error" });
                    } else {
                        client.query(`INSERT INTO posts (originalpostid,userId, originaluserid,  description, images, postlikes, postcomments, postshare, datetime) VALUES (${originalpostid},${req.userId},  ${data.rows[0].originaluserid},  $$${data.rows[0].description}$$, '{${data.rows[0].images}}', 0, 0, 0, '${dateTime}');`, err => {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ message: "Internal Server Error" });
                            } else {
                                client.query(`BEGIN TRANSACTION;
                                update users
                                SET share = users.share + 1
                                where
                                id = ${req.userId} or id = ${data.rows[0].userid};
                                update posts
                                SET postshare = posts.postshare + 1 
                                where
                                postid = ${postid} or postid = ${originalpostid}; 
                                INSERT INTO shareposts
                                VALUES (${originalpostid},${req.userId});
                                COMMIT;
                                `, err => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).json({ message: "Internal Server Error" });
                                    } else {
                                        res.status(200).json({
                                            message: "You Shared The Post",
                                        });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    })


}

//making comment on the post of the user
exports.commentPost = (req, res) => {
    const { postid, comment, originaluserid, dateTime, originalpostid } = req.body;
    client.query(`
    BEGIN TRANSACTION;
        UPDATE users SET comments = users.comments + 1 WHERE id = ${req.userId} or id = ${originaluserid};
        UPDATE posts SET postcomments = posts.postcomments + 1 WHERE postid = ${postid} or postid = ${originalpostid};
        INSERT INTO comment (postid, originalpostid, userid,  comment, datetime) VALUES (${postid}, ${originalpostid},${req.userId},$$${comment}$$,'${dateTime}');
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
    const { postid, originalpostid } = req.body;
    client.query(`SELECT userid,comment,users.username,users.profilephoto,datetime FROM comment INNER JOIN users ON userid = users.id WHERE postId = ${postid} or postid = ${originalpostid} or originalpostid = ${postid} or originalpostid = ${originalpostid};`, (err, data) => {
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
    client.query(`SELECT postmade FROM users WHERE username = '${req.username}';`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Post count returned successfully",
                postCount: data.rows[0].postmade,
            })
        }
    })
}

//get a post by postId
exports.getPostById = (req, res) => {
    client.query(`SELECT postid,originalpostid,userid,originaluserid,description,images,postlikes,postcomments,postshare,datetime,username,profilephoto FROM posts inner join users on id = userid  WHERE postid = ${req.body.postid}`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(200).json({
                message: "Posts Reterived Successfully",
                post: data.rows[0],
            });
        }
    });
}