const env = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());
const client = require('./configs/db');
const imageRoute = require('./routes/uploadImage');
const authRoute = require('./routes/auth');
const feedRoute = require('./routes/feed');
const userRoute = require('./routes/profile');


//connecting to database
client.connect(err => {
    if (err) {
        console.log('Error connecting to database\n');
        console.log(err);
    } else { console.log('Connected to database'); }
})

app.get('/', (req, res) => {
    res.status(200).json({
        message: `Server up and running at ${port}`,
    });
})
app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/feed', feedRoute);
app.use('/uploadImage', imageRoute);


app.listen(port, () => {
    console.log(`Server up and running at ${port}`);
});