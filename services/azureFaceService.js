import axios from "axios";

const endpoint = process.env.FACE_API_ENDPOINT;
const key = process.env.FACE_API_KEY;
const personGroupId = process.env.PERSON_GROUP_ID;

const axiosInstance = axios.create({
  baseURL: endpoint,
  timeout: 5000
});

if (!endpoint || !key || !personGroupId) {
  console.warn("⚠️ Azure Face env vars missing. Check .env");
}

const jsonHeaders = {
  "Ocp-Apim-Subscription-Key": key,
  "Content-Type": "application/json"
};

const imageHeaders = {
  "Ocp-Apim-Subscription-Key": key,
  "Content-Type": "application/octet-stream"
};

// ---------------- PERSON GROUP ----------------

export const ensureGroupExists = async () => {
  try {
    await axiosInstance.put(
      `/face/v1.0/persongroups/${personGroupId}`,
      {
        name: personGroupId,
        recognitionModel: "recognition_04"
      },
      { headers: jsonHeaders }
    );
    console.log("✅ PersonGroup ensured:", personGroupId);
  } catch (err) {
    if (err.response?.status === 409) {
      console.log("ℹ️ PersonGroup already exists");
    } else {
      console.error("⚠️ Failed to ensure PersonGroup:", err.response?.data || err.message);
      throw err;
    }
  }
};

// ---------------- PERSON ----------------

export const createPerson = async (name) => {
  const res = await axiosInstance.post(
    `/face/v1.0/persongroups/${personGroupId}/persons`,
    { name },
    { headers: jsonHeaders }
  );
  return res.data.personId;
};

export const addPersonFace = async (personId, imageBuffer) => {
  const res = await axiosInstance.post(
    `/face/v1.0/persongroups/${personGroupId}/persons/${personId}/persistedFaces`,
    imageBuffer,
    { headers: imageHeaders }
  );
  return res.data.persistedFaceId;
};

// ---------------- DETECT ----------------

export const detectFace = async (imageBuffer) => {
  const res = await axiosInstance.post(
    `/face/v1.0/detect`,
    imageBuffer,
    {
      headers: imageHeaders,
      params: {
        returnFaceId: true,
        recognitionModel: "recognition_04",
        detectionModel: "detection_03"
      }
    }
  );
  return res.data;
};

// ---------------- IDENTIFY ----------------

export const identifyFace = async (faceIds) => {
  const res = await axiosInstance.post(
    `/face/v1.0/identify`,
    {
      personGroupId,
      faceIds,
      maxNumOfCandidatesReturned: 1,
      confidenceThreshold: 0.6
    },
    { headers: jsonHeaders }
  );
  return res.data;
};

// ---------------- TRAIN ----------------

export const trainGroup = async () => {
  try {
    await axiosInstance.post(
      `/face/v1.0/persongroups/${personGroupId}/train`,
      {},
      { headers: jsonHeaders }
    );
    console.log("✅ Azure training started");
  } catch (err) {
    console.error("⚠️ Azure training failed:", err.response?.data || err.message);
  }
};
