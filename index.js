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
const cors = require('cors');
const PORT = 5000; //process.env.PORT || 5000;

const app = express();

const corsOption = {
    origin: ['http://localhost:4000'],
    credentials: true,
};

app.use(cors(corsOption));

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

app.listen(PORT, () => { console.log(`server is running on ${PORT}`); });