import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/inbox", requireAuth, async (req, res) => {
})

router.get("/unread-count", requireAuth, async (req, res) => {
})

router.patch("/:id/read", requireAuth, async (req, res) => {
})

router.post("/", requireAuth, async (req, res) => {
    if (req.user.role !== "recruiter") {
    return res.status(403).json({ message: "Only recruiter can use" });
  }
})