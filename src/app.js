require('dotenv').config({ path: '.env' });

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const morgan = require('morgan');

const AppError = require("./utils/app_error");
const HttpStatusCodes = require("./utils/http_status_codes");
const globalErrorHandler = require("./utils/global_error_handler");  
const blogsRouter = require("./routes/blogs_routes");
const aiChatBotRouter = require("./routes/ai_chat_bot_route");
const habitsRouter = require("./routes/habits_route");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("<h1><center>Healthmate API is up and running</center></h1>");
});

app.use(morgan('tiny'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/blogs', blogsRouter);
app.use('/api/v1/healthmateai', aiChatBotRouter);
app.use("/api/v1/goodhabits", habitsRouter);

app.all('*', (req, res, next) => {
    const err = new AppError(`Can't find ${req.originalUrl} on this server!`, HttpStatusCodes.NOT_FOUND);
    next(err);
});

app.use(globalErrorHandler);

mongoose.connect(process.env.MONGO_DB_CONN_STR.replace('<password>',process.env.MONGO_DB_PASSWORD))
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err);
    });

app.listen(PORT, '0.0.0.0', () => {
    console.log("Server started on port 3000");
});