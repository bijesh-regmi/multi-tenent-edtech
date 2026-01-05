import  sequelize  from "../config/databse.js";
import "../models/user.model.js"; //necessary for association

export const connectDB = async () => {
    try {
        const response = await sequelize.authenticate();
        console.log(
            `Database connection successful on host:${process.env.DB_HOST}.`,
        );
        //necessary for pushing the changes 
        await sequelize.sync({ force: false });
        console.log("Database synchronized successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
