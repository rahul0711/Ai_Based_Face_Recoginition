
import { createUser } from "../models/userModel.js";
import * as azureFace from "../services/azureFaceService.js";

const {
  ensureGroupExists,
  createPerson,
  addPersonFace,
  trainGroup,
} = azureFace;


console.log("AZURE FACE EXPORTS:", Object.keys(azureFace));

import fs from "fs";

export const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      gender,
      mobileNumber,
      dateOfBirth,
      organization,
      referredBy,
    } = req.body;

    if (!firstName) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Face image is required",
      });
    }

    // ✅ MEMORY STORAGE IMAGE
    const imageBuffer = req.file.buffer;

    // Optional: base64 backup (NOT recommended long-term)
    const faceImageBase64 = imageBuffer.toString("base64");

    // Azure Face flow
    await ensureGroupExists();

    const personId = await createPerson(`${firstName} ${lastName || ""}`);
    await addPersonFace(personId, imageBuffer);
    await trainGroup();

    // Save user (NO disk path)
    const user = await createUser({
      firstName,
      lastName,
      email: email || null,
      gender: gender || null,
      mobileNumber: mobileNumber || null,
      dateOfBirth: dateOfBirth || null,
      organization: organization || null,
      azurePersonId: personId,
      referredBy: referredBy || null,
      faceImageBase64,   // ⚠️ consider removing later
      faceImagePath: null
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};



export const getAttendanceList = async (req, res, next) => {
  try {
    const logs = await getAllAttendance();
    return res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserFaceForManualCheck = async (req, res) => {
  const { userId } = req.params;

  const [rows] = await pool.query(
    "SELECT name, face_image_base64 FROM users WHERE id = ?",
    [userId]
  );

  if (!rows.length) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    name: rows[0].name,
    faceImageBase64: rows[0].face_image_base64,
  });
};