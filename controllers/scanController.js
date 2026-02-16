import {
  getUserByAzurePersonId,
  updateLastSeen,
  getVisitByPersonId,
  createVisit,
  updateVisit
} from "../models/userModel.js";

import * as azureFace from "../services/azureFaceService.js";
import { sendWelcomeEmail } from "../services/nodemailer.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

const { detectFace, identifyFace } = azureFace;

export const scanFace = async (req, res, next) => {
  console.log("🔥 /api/scan/welcome HIT");

  try {
    /* ───────────── 1️⃣ Validate image ───────────── */
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Face image is required"
      });
    }

    const imageBuffer = req.file.buffer;

    /* ───────────── 2️⃣ Detect faces ───────────── */
    const detectedFaces = await detectFace(imageBuffer);

    if (!detectedFaces || detectedFaces.length === 0) {
      return res.status(200).json({
        success: true,
        greetings: ["Sorry you havent been registered"]
      });
    }

    const faceIds = detectedFaces.map(f => f.faceId);

    /* ───────────── 3️⃣ Identify faces ───────────── */
    const identifyResults = await identifyFace(faceIds);

    const names = [];
    const greetings = [];
    const processedPersons = new Set();

    /* ───────────── 4️⃣ Process each face ───────────── */
    for (const result of identifyResults) {
      if (!result.candidates || result.candidates.length === 0) continue;

      const azurePersonId = result.candidates[0].personId;

      // prevent duplicate processing in same frame
      if (processedPersons.has(azurePersonId)) continue;
      processedPersons.add(azurePersonId);

      const user = await getUserByAzurePersonId(azurePersonId);
      if (!user) continue;

      const visit = await getVisitByPersonId(azurePersonId);
      const isFirstVisit = !visit;

      /* ───────────── 5️⃣ Visit tracking ───────────── */
      if (isFirstVisit) {
        await createVisit(user.id, azurePersonId);

        /* 📧 EMAIL (first scan only) */
        if (user.Email) {
          sendWelcomeEmail({
            to: user.Email,
            firstName: user.FirstName
          }).catch(err =>
            console.error("📧 Email failed:", err.message)
          );
        }

        /* 📱 WHATSAPP (first scan only) */
        if (user.MobileNumber) {
          const phone = user.MobileNumber.startsWith("+")
            ? user.MobileNumber
            : `+${user.MobileNumber}`;

          sendWhatsAppMessage({
            to: phone,
            message: `Hi ${user.FirstName}, welcome to AI Summit! 🎉`
          }).catch(err =>
            console.error("📱 WhatsApp failed:", err.message)
          );
        }

      } else {
        await updateVisit(visit.id);
      }

      await updateLastSeen(user.id);

      /* ───────────── 6️⃣ Privacy rule (DISPLAY ONLY) ───────────── */
      if (user.ShowName === 1) {
        names.push(user.FirstName);

        greetings.push(
          isFirstVisit
            ? `Welcome ${user.FirstName} to AI pre-summit event.`
            : `Hi ${user.FirstName}, welcome back.`
        );
      }
    }

    /* ───────────── 7️⃣ Fallback ───────────── */
    if (greetings.length === 0) {
      return res.status(200).json({
        success: true,
        greetings: ["Sorry you have not been registered"]
      });
    }

    /* ───────────── 8️⃣ Crowd control ───────────── */
    const MAX = 5;

    console.log("👋 Greetings sent:", greetings);

    return res.status(200).json({
      success: true,
      names: names.slice(0, MAX),
      greetings: greetings.slice(0, MAX)
    });

  } catch (err) {
    console.error("❌ scanFace error:", err);
    next(err);
  }
};
