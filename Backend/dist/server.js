"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const sitterRoute_1 = __importDefault(require("./Routes/sitterRoute"));
const adminRoute_1 = __importDefault(require("./Routes/adminRoute"));
const parentRoute_1 = __importDefault(require("./Routes/parentRoute"));
const connection_1 = require("./Connections/connection");
const socket_1 = require("./Connections/socket");
dotenv_1.default.config();
const port = process.env.PORT || 5003;
const app = (0, express_1.default)();
(0, connection_1.connectDB)();
const server = http_1.default.createServer(app);
console.log(server, 'server');
(0, socket_1.initializeSocketIO)(server);
const corsOptions = {
    origin: [process.env.CLIENT_SITE_URLS, 'http://localhost:5003', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    crossOriginOpenerPolicy: 'same-origin'
};
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
}); //middleware used to log the incoming request for a specific route ,it will execute for all the routes.
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use('/api/sitter', sitterRoute_1.default);
app.use('/api/admin', adminRoute_1.default);
app.use('/api/parent', parentRoute_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, "../Frontend/dist")));
app.get("*", (req, res) => res.sendFile(path_1.default.resolve(__dirname, "../Frontend/dist", "index.html")));
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
