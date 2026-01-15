import sequelize from "../config/database.js";
import generateInstituteId from "../utils/instituteNumberGenerator.js";
import { QueryTypes } from "sequelize";

export const createInstituteTable = async () => {
    const instituteNumber = generateInstituteId();
    const tableName = `institute_${instituteNumber}`;

    const query = `
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

    await sequelize.query(query, { type: QueryTypes.RAW });

    return {tableName,instituteNumber};
};

export const createTeacherTable  = async()=>{

}
export const createCourseTable = async ()=>{

}
export const createStudentTable = async ()=>{
    
}