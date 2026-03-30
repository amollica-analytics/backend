const { db } = require('./setup');

async function setupDatabase() {
    try {
        await db.authenticate();
        console.log("Database connected");

        await db.sync({ force: false });
        console.log("Database tables created");

        process.exit();
    } catch (error) {
        console.error("Database setup failed:", error);
        process.exit(1);
    }
}

setupDatabase();