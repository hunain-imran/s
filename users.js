const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const JWT_SECRET = "test";

const pool = new Pool({
  user: "postgres",        
  host: "localhost",       
  database: "postgres", 
  password: "root", 
  port: 5432
});



router.post("/register", async (req, res) => {
  const { name, email, password, address } = req.body;

 
  try {
    const result = await pool.query(
      "INSERT INTO users(name,email,password,address,role) VALUES($1,$2,$3,$4,$5) RETURNING name,email,role",
      [name, email, password, address, "normal"]
    );

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {y
      res.status(400).json({ msg: "Email already registered" });
    } else {
      res.status(500).json({ msg: "Server error" });
    }
  }
});




router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userRes = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  if (userRes.rows.length === 0)
    return res.status(400).json({ msg: "User not found" });

  const user = userRes.rows[0];

  if (password!=user.password) return res.status(400).json({ msg: "Wrong password" });

  // JWT
  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});



// check jwt
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ msg: "Invalid token" });
  }
}

// admin only
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  next();
}

//Get all users (admin only)
router.get("/users", auth, adminOnly, async (req, res) => {
  const result = await pool.query("SELECT name,email,address,role FROM users");
  res.json(result.rows);
});



/*
const nodemailer = require("nodemailer");

//forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    
    const userRes = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }

    
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });


    const transporter = nodemailer.createTransport({
      
    });

    const resetLink = `http://localhost:3000/reset-password?t=${resetToken}`;

    await transporter.sendMail({
      from: '"Assignment App" <your-email@gmail.com>',
      to: email,
      html: `<p>Click the link below to reset your pass:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ msg: "Password reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// reset-password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    // Update password
    await pool.query("UPDATE users SET password=$1 WHERE email=$2", [newPassword, email]);

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Invalid or expired token" });
  }
});
*/

module.exports = router;