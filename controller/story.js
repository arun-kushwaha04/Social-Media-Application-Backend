const client = require('../configs/db');

exports.getStoryList = (req, res) => {
    client.query(`SELECT 
    t1.id,story.storyid,story.images,story.likes,story.views,t1.username,t1.profilephoto
    FROM story INNER JOIN follower ON story.userid = follower.following AND follower.follower = ${req.userId}
    JOIN users t1 on t1.id = story.userid
    WHERE created_at >= NOW() - INTERVAL '24 HOURS'
    ORDER BY story.storyid DESC; `, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.status(200).json({
                message: 'Sotry of following Reterived Successfully',
                story: data.rows,
            })
        }
    })
}


exports.addStory = (req, res) => {
    const images = req.body.storyImageUrl;
    client.query(`INSERT INTO story (userid,images,likes,views) VALUES (${req.userId},'{${images}}',0,0)`, err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.status(200).json({
                message: 'Story Uploaded Successfully'
            })
        }
    })
}

exports.getUserStory = (req, res) => {
    const userId = req.body.userId;
    client.query(`SELECT 
    story.storyid,story.images,story.likes,story.views,t1.username,t1.profilephoto
    FROM story 
    JOIN users t1 on t1.id = story.userid
    WHERE userid = ${userId} AND created_at >= NOW() - INTERVAL '24 HOURS'
    `, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (data.rowCount === 0) {
                res.status(200).json({
                    message: 'No Story Found',
                })
            } else {
                res.status(200).json({
                    message: 'Sotry of following Reterived Successfully',
                    element: data.rows[0],
                    story: data.rows[0].images,
                })
            }
        }
    })
}

exports.isImageLiked = (req, res) => {
    const { image } = req.body;
    client.query(`SELECT * FROM likeonstory WHERE image = '${image}' AND userid = ${req.userId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (data.rowCount === 1) {
                res.status(200).json({ message: "Liked" });
            } else {
                res.status(200).json({ message: "Not Liked" });
            }
        }
    })
}

exports.updateLikeStory = (req, res) => {
    console.log(req.body);
    const { storyId, image } = req.body;
    let value;
    let message;
    let query;
    client.query(`SELECT * FROM likeonstory WHERE image = '${image}' AND userid = ${req.userId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (data.rows.length === 1) {
                query = `DELETE FROM likeonstory WHERE image = '${image}' AND userid = ${req.userId};`
                value = -1;
                message = `Image Disliked`;
            } else {
                query = `INSERT INTO likeonstory VALUES ('${image}',${req.userId});`
                value = 1;
                message = `Image Liked`;
            }
            client.query(`
        BEGIN TRANSACTION;
            UPDATE story SET likes = story.likes + ${value} WHERE storyid = ${storyId};            
            ${query}
        COMMIT;
            `, err => {
                if (err) {
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

exports.updateViewStory = (req, res) => {
    const { storyId, } = req.body;
    let query;
    client.query(`SELECT * FROM viewonstory WHERE storyid = ${storyId} AND userid = ${req.userId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (data.rows.length === 1) {
                res.status(200).json({
                    message: 'Story Already Viewed'
                })
            } else {
                query = `INSERT INTO viewonstory VALUES (${storyId},${req.userId});`
                client.query(`
            BEGIN TRANSACTION;
                UPDATE story SET views = story.views + 1 WHERE storyid = ${storyId};            
                ${query}
            COMMIT;
                `, err => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ message: "Internal Server Error" });
                    } else {
                        res.status(200).json({
                            message: 'Story Viewed'
                        });
                    }
                })
            }
        }
    })
}