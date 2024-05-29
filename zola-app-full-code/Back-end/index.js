const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const db = require("./src/db/mongodb");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const {socket} = require("./src/app/socket");
const compression = require("compression");
const routes = require("./src/routes");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
// const whitelist = ['http://localhost:3000'];
dotenv.config();
// Middleware
app.use(
    cors({
        credentials: true,
        origin: "http://localhost:3000",
        methods: ["POST", "PUT", "GET", "PATCH", "OPTIONS", "HEAD", "DELETE"],
    })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));
app.use(compression());

db.connectDB();
app.get("/", (req, res) => {
    res.send("Hello, world!");
});

//socket
const httpServer = createServer();
httpServer.listen(8900);
const io = new Server(httpServer);
const users = new Map();// users._id = socketId
socket(io, users);
routes(app,io, users);


const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
  