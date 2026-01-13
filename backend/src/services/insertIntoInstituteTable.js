import sequelize from "../config/database.js";
import { QueryTypes } from "sequelize";

const insertIntoInstituteTable = async (columnValues) => {
    const {
        tableName,
        instituteName,
        instituteEmail,
        institutePhoneNumber,
        instituteAddress,
        vatNumber,
        panNumber,
    } = columnValues;
    const query = `INSERT  INTO ${tableName} (  
            name,
            email,
            phone_number,
            address,
            vatNumber,
            panNumber) VALUES (
            ?,?,?,?,?,?
        )`;
    await sequelize.query(query, {
        type: QueryTypes.INSERT,
        replacements:[ 
            instituteName,
            instituteEmail,
            institutePhoneNumber,
            instituteAddress,
            vatNumber,
            panNumber,
        ],
    });
};

export default insertIntoInstituteTable;
