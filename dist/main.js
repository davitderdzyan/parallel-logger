"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logFile = path_1.default.join(__dirname, "logs.txt");
const worker = new worker_threads_1.Worker("./worker.js", { execArgv: ["-r", "ts-node/register"] });
let writing = false;
const logQueue = [];
// Listen for logs from the worker
worker.on("message", async (msg) => {
    if (msg.type === "log") {
        logQueue.push(msg.data);
        await processQueue();
    }
});
async function processQueue() {
    if (writing)
        return;
    writing = true;
    while (logQueue.length > 0) {
        const message = logQueue.shift();
        await writeToFile(message);
    }
    writing = false;
}
function writeToFile(message) {
    return new Promise((resolve, reject) => {
        fs_1.default.appendFile(logFile, message + "\n", (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
console.log("Main logger started. Waiting for log messages...");
