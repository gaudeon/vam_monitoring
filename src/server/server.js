const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");
const spawn = require("child_process").spawn;
const exec = require("child_process").exec;
const fs = require("fs");

const streamDir = path.join(__dirname, "..", "..", "stream");
const streamFile = path.join(streamDir, "image_stream.jpg");
const gpioPort = 4;
const gpioFile = path.join("/sys/class/gpio", "gpio" + gpioPort.toString(), "value");

const captureSpeed = 1000; // spead at which the camera captures images in milliseconds and we emit a update image message to clients

let proc;
let procTimer;
let emitTimer;
let gpioWatcher;
let movementDetected = false;
 
app.use("/stream", express.static(streamDir));
 
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});
 
var sockets = {};
 
io.on("connection", function(socket) {
 
    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);
 
    socket.on("disconnect", function() {
        stopStreaming(socket);
    });
 
    socket.on("start-stream", function() {
        startStreaming(io);
    });
 
});

// setup gpio before we start listening 
setupGPIO(() => {
    http.listen(3000, function() {
        console.log("listening on *:3000");
    });
});
 
function stopStreaming(socket) {
    delete sockets[socket.id];
    
    if (Object.keys(sockets).length == 0) {
        console.log("No body is watching so stopping stream...");
        app.set("isStreaming", false);
        if (procTimer) clearInterval(procTimer);
        if (emitTimer) clearInterval(emitTimer);
    }
}
 
function startStreaming(io) {
 
    if (app.get("isStreaming")) {
        io.sockets.emit("liveStream", liveStreamResponse());
        return;
    }

    console.log("Starting stream...");
 
    app.set("isStreaming", true);

    resetCamera(); // start it up

    // every 30 seconds reset camera
    procTimer = setInterval(() => { resetCamera(); }, 30 * 1000);

    // emit update to client every half second
    emitTimer = setInterval(() => {
        io.sockets.emit("liveStream", liveStreamResponse());
    }, captureSpeed);
}

function resetCamera() {
    console.log("Resetting raspistill proc...");

    if (proc) proc.kill(); // if we are still running raspistill (likely) kill it

    let args = ["-w", "640", "-h", "480", "-o", streamFile, "-q", "5", "-t", "31000", "-tl", captureSpeed, "-n", "-ex", "auto"];
    proc = spawn("raspistill", args);
    // debugging proc..
    proc.stdout.on("data", (data) => { console.log(data.toString("utf8")); });
    proc.stderr.on("data", (data) => { console.log(data.toString("utf8")); });
}

function setupGPIO(callback) {
    if (typeof callback !== "function") callback = () => {};

    let gpioProc = exec("gpio edge " + gpioPort + " rising", undefined, (error, stdout, stderr) => {
        callback();
    });
}

function liveStreamResponse() {
    return {
        image: "/stream/image_stream.jpg?_t=" + (Math.random() * 100000),
        motion: fs.readFileSync(gpioFile).toString().match(/1/) ? true : false
    };
}
