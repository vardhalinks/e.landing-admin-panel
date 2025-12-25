import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// create a Razorpay order and persist a local Order record
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    const saved = await Order.create({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: "created",
    });

    res.json({ order, saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// verify payment
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      await Order.findOneAndUpdate({ razorpay_order_id }, { status: "paid", razorpay_payment_id });
      return res.json({ ok: true });
    }

    return res.status(400).json({ ok: false, message: "Invalid signature" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// JWT Link Generator (one-time + IP-lock)
const usedTokens = new Set();

router.post("/generate-link", (req, res) => {
  const { payment_id } = req.body;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  if (!payment_id) return res.status(400).json({ error: "payment_id is required" });

  try {
    const token = jwt.sign({ payment_id, ip }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const base = process.env.PUBLIC_BASE_URL || process.env.BASE_URL || "";
    return res.json({ secure_link: `${base}/secure-session?token=${token}` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to generate link" });
  }
});

router.get("/secure-session", (req, res) => {
  const token = req.query.token;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  if (!token) return res.status(400).send("Token missing!");

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (usedTokens.has(token)) return res.status(403).send("⛔ Access Expired!");
    if (data.ip !== ip) return res.status(403).send("⛔ Invalid Device or IP!");
    usedTokens.add(token);
    return res.redirect(process.env.SESSION_REDIRECT || "https://calendly.com/linksvardha/60min");
  } catch (e) {
    return res.status(403).send("⛔ Session Access Denied");
  }
});

export default router;
