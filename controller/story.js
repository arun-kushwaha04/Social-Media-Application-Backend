const client = require('../configs/db');

exports.addStory = (req, res) => {
    const images = req.body.images;
    client.query(`INSERT INRO story (userid,images,likes) VALUES (${req.userId},'{${images}}',0)`, err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.status(200).json({
                message: 'Story Uplaoaded Successfully'
            })
        }
    })
}

exports.getUserStory = (req, res) => {
    const userId = req.body.userId;
    client.query(`SELECT 
    story.storyid,story.images,story.likes,t1.username,t1.profilephoto
    FROM story 
    JOIN users t1 on t1.id = story.userid
    WHERE userid = ${userId} AND created_at < NOW() - '1 DAY'
    ORDER BY story.userid DESC; `, (err, data) => {
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

exports.isImageLiked = (req, res) => {
    const { userId, imageId } = req.body;
    const image = userId + imageId
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
    const { userId, imageId } = req.body;
    const image = userId + imageId
    let value;
    let message;
    let query;
    client.query(`SELECT * FROM likeonstory WHERE image = '${image}' AND userid = ${req.userId};`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (data.rows.length === 1) {
                query = `DELETE FROM likes WHERE image = '${image}' AND userid = ${req.userId};`
                value = -1;
                message = `Image Disliked`;
            } else {
                query = `INSERT INTO likes VALUES ('${image}',${req.userId});`
                value = 1;
                message = `Image Liked`;
            }
            client.query(`
        BEGIN TRANSACTION;
            UPDATE story SET likes = story.likes + ${value} WHERE userid = ${userId};            
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