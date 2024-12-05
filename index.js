const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/dashboard", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const DataSchema = new mongoose.Schema({ key: String, value: Number });
const DataModel = mongoose.model("Data", DataSchema);

// REST API
app.get("/data", async (req, res) => {
  const data = await DataModel.find();
  res.json(data);
});

app.post("/data", async (req, res) => {
  const newData = new DataModel(req.body);
  await newData.save();
  io.emit("update", newData); // Emit real-time updates
  res.status(201).json(newData);
});

// Real-time connection
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => console.log("A user disconnected"));
});

server.listen(5000, () => console.log("Server running on port 5000"));
