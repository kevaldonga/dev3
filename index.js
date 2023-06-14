const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const reactionRouter = require('./routes/reactions');
const tagListRouter = require('./routes/taglist');

const { users } = require('./models');

const PORT = 4000;

let app = express();

app.use(bodyParser.json());

app.get('/', async (req, res) => {
    result = await users.findAll({
        include: "profiles"
    });
    res.send(result);
});

// Routes

// users
app.use('/users', userRouter);

// posts
app.use("/posts", postRouter);

// reactions
app.use("/reactions", reactionRouter);

// tagList
app.use("/tags", tagListRouter);

app.listen(PORT, () => { console.log('server is running...') });