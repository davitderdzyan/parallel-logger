const axios = require("axios");

async function sendLog(i) {
  await axios.post("http://localhost:4000/log", {
    message: `Parallel log ${i}`,
  });
}

async function runParallel() {
  const tasks = Array.from({ length: 50 }, (_, i) => sendLog(i + 1));
  await Promise.all(tasks);
  console.log("All logs sent!");
}

runParallel();
