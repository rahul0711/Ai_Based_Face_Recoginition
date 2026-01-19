import pool from "../config/db.js";

export const createUser = async ({
  firstName,
  lastName,
  email,
  gender,
  mobileNumber,
  dateOfBirth,
  organization,
  azurePersonId,
  referredBy,
  faceImageBase64,
  faceImagePath,
}) => {
  const [result] = await pool.execute(
    `
    INSERT INTO FaceregistringUsers (
      FirstName,
      LastName,
      Email,
      Gender,
      MobileNumber,
      DateOfBirth,
      Organization,
      azure_person_id,
      ReferedBy,
      face_image_base64,
      face_image_path
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      firstName,
      lastName,
      email,
      gender,
      mobileNumber,
      dateOfBirth,
      organization,
      azurePersonId,
      referredBy,
      faceImageBase64,
      faceImagePath,
    ]
  );

  return {
    id: result.insertId,
    firstName,
    lastName,
    email,
    azurePersonId,
  };
};


export const getUserByAzurePersonId = async (azurePersonId) => {
  const [rows] = await pool.execute(
    `SELECT id, FirstName, LastName, UpdateDate
     FROM FaceregistringUsers
     WHERE azure_person_id = ?`,
    [azurePersonId]
  );

  return rows[0];
};

export const updateLastSeen = async (id) => {
  await pool.execute(
    `UPDATE FaceregistringUsers
     SET UpdateDate = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id]
  );
};




export const getVisitByPersonId = async (azurePersonId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM FaceVisits WHERE azure_person_id = ?`,
    [azurePersonId]
  );
  return rows[0];
};

export const createVisit = async (userId, azurePersonId) => {
  await pool.execute(
    `INSERT INTO FaceVisits (user_id, azure_person_id)
     VALUES (?, ?)`,
    [userId, azurePersonId]
  );
};

export const updateVisit = async (id) => {
  await pool.execute(
    `UPDATE FaceVisits
     SET visit_count = visit_count + 1,
         last_seen = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id]
  );
};
