import sequelize from "../config/database.js";
import asyncHandler from "../utils/asyncHandler.js";
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
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            instituteName VARCHAR(255) NOT NULL,
            instituteEmail VARCHAR(255) NOT NULL,
            institutePhoneNumber VARCHAR(255) NOT NULL,
            instituteAddress VARCHAR(255) NOT NULL,
            institutePanNo VARCHAR(255),
            instituteVatNo VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
        const createQuery = `CREATE TABLE IF NOT EXISTS user_institutes (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            userId CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
            instituteNumber INT NOT NULL,

            CONSTRAINT fk_user_institute
            FOREIGN KEY (userId)
            REFERENCES users(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
            ) ENGINE=InnoDB`;
        await sequelize.query(createQuery);
        const insertQuery = `INSERT INTO user_institutes(userId,instituteNumber) VALUES(?,?)`;
        await sequelize.query(
            insertQuery,
            {
                replacements: [userId, instituteNumber],
            },
            {
                type: QueryTypes.INSERT,
            },
        );
    } catch (error) {
        console.log(
            "WARNING!WARNING! ERROR ALERT XXX! user institute junction failed!",
        );
        console.log(error);
    }
};

export const createInstituteCategoryTable = async (instituteNumber) => {
    const query = `
      CREATE TABLE IF NOT EXISTS category_${instituteNumber} (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      categoryName VARCHAR(100) NOT NULL,
      categoryDescription TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    `;
    await sequelize.query(query, {
        type: QueryTypes.CREATE,
    });
};

export const createInstituteTeacherTable = async (instituteNumber) => {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS teachers_${instituteNumber} (
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
            teacherName VARCHAR(255) NOT NULL,
            teacherEmail VARCHAR(255) NOT NULL UNIQUE,
            teacherPhoneNumber VARCHAR(255) NOT NULL UNIQUE,
            teacherExperience VARCHAR(255),
            joinedDate DATE,
            salary VARCHAR(100),
            teacherPhoto VARCHAR(255),
            teacherPassword VARCHAR(255),
            courseId VARCHAR(100),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        
        
            
                    )`;
        await sequelize.query(query, {
            type: QueryTypes.CREATE,
        });
    } catch (error) {
        console.log(error);
    }
};

export const createInstituteCourseTable = async (instituteNumber) => {
    const query = `
    CREATE TABLE IF NOT EXISTS courses_${instituteNumber}(
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      courseName VARCHAR(255) NOT NULL UNIQUE,
      coursePrice VARCHAR(255) NOT NULL,
      courseDuration VARCHAR(100) NOT NULL,
      courseLevel ENUM('beginner','intermediate','advance') NOT NULL,
      courseThumbnail VARCHAR(200),
      courseDescription TEXT,
      teacherId VARCHAR(36),
      categoryId VARCHAR(36) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
    `;
    await sequelize.query(query, {
        type: QueryTypes.CREATE,
    });
};

export const createInstituteChapterTable = async (instituteNumber) => {
    const query = `
    CREATE TABLE IF NOT EXISTS course_chapter_${instituteNumber}(
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        chapterName VARCHAR(255) NOT NULL,
        chapterDescription TEXT,
        chapterLevel ENUM('beginner','intermediate','advance') NOT NULL,
        courseId VARCHAR(36) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    )`
}
export const createInstituteStudentTable = async (instituteNumber) => {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS student_${instituteNumber}(
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                studentName VARCHAR(255) NOT NULL, 
                studentPhoneNo VARCHAR(255) NOT NULL UNIQUE, 
                studentAddress TEXT, 
                enrolledDate DATE, 
                studentImage VARCHAR(255),

                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        `;
        await sequelize.query(query, {
            type: QueryTypes.CREATE,
        });
    } catch (error) {
        console.log(error);
    }
};