#!/usr/bin/env node
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import { Command } from "commander";

dotenv.config();

const program = new Command();

program
  .command("send")
  .requiredOption("--payment_id <id>")
  .requiredOption("--status <status>")
  .option("--amount <amount>", "100")
  .option("--url <url>", "http://localhost:8000/api/payment/ipn-callback")
  .action(async (opts) => {
    const payload = {
      payment_id: Number(opts.payment_id),
      payment_status: opts.status,
      actually_paid: Number(opts.amount),
      price_currency: "usd",
      pay_currency: "usdttrc20"
    };

    const signature = crypto
      .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");

    console.log("📤 Sending IPN:", payload);

    const res = await axios.post(opts.url, payload, {
      headers: {
        "x-nowpayments-sig": signature,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Response:", res.data);
  });

program.parse();
