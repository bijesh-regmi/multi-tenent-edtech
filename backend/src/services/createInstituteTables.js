import sequelize from "../config/database.js";
import generateInstituteId from "../utils/instituteNumberGenerator.js";
import { QueryTypes } from "sequelize";

export const createInstituteTable = async (
    instituteName,
    instituteEmail,
    institutePhoneNumber,
    instituteAddress,
    vatNumber,
    panNumber,
) => {
    const instituteNumber = generateInstituteId();
    const tableName = `institute_${instituteNumber}`;

    const createQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY  ,
            external_id CHAR(36) UNIQUE DEFAULT (UUID()),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone_number VARCHAR(20) NOT NULL,
            address TEXT NOT NULL,
            panNumber VARCHAR(100) UNIQUE,
            vatNumber VARCHAR(100) UNIQUE,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    await sequelize.query(createQuery, { type: QueryTypes.RAW });

    const insertQuery = `INSERT  INTO ${tableName} (  
            name,
            email,
            phone_number,
            address,
            vatNumber,
            panNumber) VALUES (
            ?,?,?,?,?,?
        )`;
    await sequelize.query(insertQuery, {
        type: QueryTypes.INSERT,
        replacements: [
            instituteName,
            instituteEmail,
            institutePhoneNumber,
            instituteAddress,
            vatNumber,
            panNumber,
        ],
    });
    return { tableName, instituteNumber };
};

export const createUserInstituteTable = async (userId, instituteNumber) => {
    try {
        const createQuery = `CREATE TABLE IF NOT EXISTS user_institute (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            instituteNumber INT NOT NULL,
            CONSTRAINT fk_user_institute
            FOREIGN KEY (userId)
            REFERENCES users(id)
            ON DELETE CASCADE
            )`;
        await sequelize.query(createQuery);
        const insertQuery = `INSERT INTO user_institute(userId,instituteNumber) VALUES(?,?)`;
        await sequelize.query(insertQuery, {
            replacements: [userId, instituteNumber],
        });
    } catch (error) {
        console.log(
            "WARNING!WARNING! ERROR ALERT XXX! user institute junction failed!",
        );
        console.log(error);
    }
};

export const createInstituteTeacherTable = async () => {};
export const createInstituteCourseTable = async () => {};
export const createInstituteStudentTable = async () => {};
