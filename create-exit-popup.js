// Create exit_popup_section in database
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Section } from "./src/models/Section.js";

dotenv.config();

const createSection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const section = await Section.create({
      key: "exit_popup_section",
      title: "Exit Popup",
      subtitle: "",
      content: "",
      extraData: {
        heading: "Wait! Before You Leave",
        subheading: "Your ₹99 Guidance session is still available. Don't miss this chance!",
        continueButtonText: "Continue",
        registerButtonText: "Register Now",
        registerAmount: 99,
        headingColor: "text-yellow-700",
        subheadingColor: "text-zinc-700",
        bgColor: "bg-white",
        borderColor: "border-yellow-300"
      }
    });

    console.log("✅ Created exit_popup_section:", section);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

createSection();
