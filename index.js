const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const reactionRouter = require('./routes/reactions');
const tagListRouter = require('./routes/taglist');
const commentRouter = require('./routes/comments');
const categoryRouter = require('./routes/categories');
const bookmarkRouter = require('./routes/bookmarks');

const { users } = require('./models');

const PORT = 4000;

let app = express();

app.use(bodyParser.json());

app.get('/', async (req, res) => {
    result = await users.findAll({
        include: "profiles"
    });
    res.json(result);
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

// bookmarks
app.use("/bookmarks", bookmarkRouter);

// categories
app.use("/categories", categoryRouter);

// comments
app.use("/comments", commentRouter);

app.listen(PORT, () => { console.log('server is running...') });