import app from "./app.js";
import {connectDB }from "./db/connection.js";
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running at : localhost:${PORT}`);
        });
    } catch (error) {
        console.log("There is some problem starting the server.",error);
        process.exit(1)
    }
}
startServer();

