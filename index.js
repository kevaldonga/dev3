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
const { createServer } = require('http');
const serviceAccount = require('./global/firebaseservice-account.json');
const admin = require('firebase-admin');
const Server = require('socket.io');
require('dotenv').config();
const cors = require('cors');
const PORT = 5000; //process.env.PORT || 5000;

const app = express();

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const firebaseMessaging = firebaseApp.messaging();

global.firebaseMessaging = firebaseMessaging;

const corsOption = {
    origin: ['https://38fe9d2e.devfe.pages.dev'],
    credentials: true
};

const server = createServer(app);

const io = Server(server, { cors: corsOption });

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

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    global.socket = socket;
});

server.listen(PORT, () => { console.log(`server is running on ${PORT}`); });
