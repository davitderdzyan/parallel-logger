"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const http_1 = __importDefault(require("http"));
if (!worker_threads_1.parentPort)
    throw new Error("Must run as worker thread");
const PORT = 4000;
const server = http_1.default.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/log") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                const { message } = JSON.parse(body);
                const time = new Date().toISOString();
                worker_threads_1.parentPort.postMessage({ type: "log", data: `[${time}] ${message}` });
                res.writeHead(200);
                res.end("Logged\n");
            }
            catch (err) {
                res.writeHead(400);
                res.end("Invalid JSON\n");
            }
        });
    }
    else {
        res.writeHead(404);
        res.end("Not Found");
    }
});
server.listen(PORT, () => console.log(`Worker API running on port ${PORT}`));
