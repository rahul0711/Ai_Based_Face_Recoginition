import {   getUserByAzurePersonId,
  updateLastSeen ,  getVisitByPersonId,
  createVisit,
  updateVisit} from "../models/userModel.js";
import * as azureFace from "../services/azureFaceService.js";

const { identifyFace, detectFace } = azureFace;

// High-resolution timer (ms)
const now = () => Number(process.hrtime.bigint() / 1000000n);

export const scanFace = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Face image is required"
      });
    }

    const imageBuffer = req.file.buffer;

    // 1️⃣ Detect face
    const detectedFaces = await detectFace(imageBuffer);

    if (!detectedFaces.length) {
      return res.status(404).json({
        success: false,
        message: "No face detected"
      });
    }

    const faceIds = detectedFaces.map(f => f.faceId);

    // 2️⃣ Identify face
    const identifyResult = await identifyFace(faceIds);

    if (
      !identifyResult.length ||
      !identifyResult[0].candidates.length
    ) {
      return res.status(200).json({
        success: true,
        message: "Face not recognized",
        greeting: "Welcome to AI Summit"
      });
    }

    const azurePersonId = identifyResult[0].candidates[0].personId;

    // 3️⃣ Get registered user
    const user = await getUserByAzurePersonId(azurePersonId);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "User not registered",
        greeting: "Welcome to AI Summit"
      });
    }

    // 4️⃣ Check visit table
    const visit = await getVisitByPersonId(azurePersonId);

    if (!visit) {
      // 🔥 FIRST TIME VISIT
      await createVisit(user.id, azurePersonId);
      await updateLastSeen(user.id);

      return res.status(200).json({
        success: true,
        isFirstTime: true,
        greeting: `Welcome ${user.FirstName} to AI pre-summit event.`,
        name: user.FirstName
      });
    }

    // 🔁 REPEAT VISIT
    await updateVisit(visit.id);
    await updateLastSeen(user.id);

    return res.status(200).json({
      success: true,
      isFirstTime: false,
      greeting: `Hi ${user.FirstName}, you have already scanned.`,
      name: user.FirstName,
      visitCount: visit.visit_count + 1
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};
