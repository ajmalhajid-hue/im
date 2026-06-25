import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port = 3000;

/* Home Route */
app.get("/prethiv", (req, res) => {
  res.send("Server says Hello prethiv");
});

/* ================= STUDENT ================= */

const studentsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
});

const Student = mongoose.model("Student", studentsSchema);

/* Add Student */
app.post("/students", async (req, res) => {
  try {
    const { name, rollNo } = req.body;

    if (!name || !rollNo) {
      return res.status(400).json({
        message: "name and rollNo are required",
      });
    }

    const student = new Student({ name, rollNo });
    const savedStudent = await student.save();

    res.status(201).json({
      message: "Student saved successfully",
      student: savedStudent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save student",
      error: error.message,
    });
  }
});

/* Get All Students */
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
});

/* ================= ATTENDANCE ================= */

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["P", "A"],
    required: true,
  },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

/* Mark Attendance */
app.post("/attendance", async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    const attendance = await Attendance.findOneAndUpdate(
      {
        studentId,
        date,
      },
      {
        studentId,
        date,
        status,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* Get All Attendance */
app.get("/attendance", async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("studentId");

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* Get Today's Attendance */
app.get("/attendance/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.find({
      date: today,
    }).populate("studentId");

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* Reset Today's Attendance */
app.delete("/attendance/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const result = await Attendance.deleteMany({
      date: today,
    });

    res.status(200).json({
      message: "Today's attendance has been completely reset.",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* ================= DATABASE ================= */

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Database Connection Error:", err);
  });
