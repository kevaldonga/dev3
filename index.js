const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users');
const profileRouter = require('./routes/profiles');
const userRelationRouter = require('./routes/friends');
const postRouter = require('./routes/posts');
const reactionRouter = require('./routes/reactions');
const tagListRouter = require('./routes/taglist');
const commentRouter = require('./routes/comments');
const categoryRouter = require('./routes/categories');
const bookmarkRouter = require('./routes/bookmarks');

const PORT = 4000;

let app = express();

app.use(bodyParser.json());

// Routes

// users
app.use('/users', userRouter);

// profiles
app.use('/profiles', profileRouter);

// userRelations
app.use('/relations', userRelationRouter);

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