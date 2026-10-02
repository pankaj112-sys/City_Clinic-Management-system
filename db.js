require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "clinic_management",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL database pool successfully.");

        // Create patients table if not exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                age INT NOT NULL,
                gender VARCHAR(20) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100),
                address VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create doctors table if not exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                specialization VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100) NOT NULL,
                experience INT DEFAULT 0,
                available_time VARCHAR(100) DEFAULT '10:00 AM - 05:00 PM',
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create appointments table if not exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                doctor_id INT NOT NULL,
                appointment_date DATE NOT NULL,
                appointment_time VARCHAR(20) NOT NULL,
                reason VARCHAR(255) NOT NULL,
                status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
            )
        `);

        // Check if doctors table has records; if not, seed realistic data
        const [docRows] = await connection.query("SELECT COUNT(*) AS count FROM doctors");
        if (docRows[0].count === 0) {
            console.log("Seeding initial doctors...");
            await connection.query(`
                INSERT INTO doctors (name, specialization, phone, email, experience, available_time)
                VALUES 
                ('Dr. Rajesh Sharma', 'Cardiologist', '9876543210', 'rajesh.sharma@clinic.com', 12, '09:00 AM - 02:00 PM'),
                ('Dr. Sneha Verma', 'Dermatologist', '9876543211', 'sneha.verma@clinic.com', 8, '10:00 AM - 04:00 PM'),
                ('Dr. Amit Patel', 'General Physician', '9876543212', 'amit.patel@clinic.com', 15, '08:00 AM - 01:00 PM'),
                ('Dr. Priya Singh', 'Pediatrician', '9876543213', 'priya.singh@clinic.com', 6, '01:00 PM - 07:00 PM'),
                ('Dr. Vikram Joshi', 'Orthopedic', '9876543214', 'vikram.joshi@clinic.com', 10, '11:00 AM - 05:00 PM')
            `);
        }

        // Check if patients table has records; if only 1 test or empty, seed sample patients
        const [patRows] = await connection.query("SELECT COUNT(*) AS count FROM patients");
        if (patRows[0].count <= 1) {
            console.log("Seeding sample patients...");
            await connection.query(`
                INSERT INTO patients (name, age, gender, phone, email, address)
                VALUES
                ('Rahul Verma', 34, 'Male', '9811223344', 'rahul.verma@gmail.com', 'Flat 402, Green Park, Mumbai'),
                ('Ananya Sharma', 28, 'Female', '9822334455', 'ananya.s@outlook.com', '12 Lake View Road, Delhi'),
                ('Sunil Kumar', 52, 'Male', '9833445566', 'sunil.kumar@yahoo.com', 'Sector 15, Noida'),
                ('Pooja Mehta', 24, 'Female', '9844556677', 'pooja.mehta@gmail.com', '7th Cross, Indiranagar, Bangalore')
            `);
        }

        // Check if appointments has records; if not, seed realistic appointments
        const [appRows] = await connection.query("SELECT COUNT(*) AS count FROM appointments");
        if (appRows[0].count === 0) {
            console.log("Seeding sample appointments...");
            const [pats] = await connection.query("SELECT id FROM patients LIMIT 4");
            const [docs] = await connection.query("SELECT id FROM doctors LIMIT 4");

            if (pats.length > 0 && docs.length > 0) {
                const today = new Date().toISOString().split("T")[0];
                await connection.query(`
                    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
                    VALUES
                    (${pats[0].id}, ${docs[0].id}, '${today}', '10:00 AM', 'Routine Heart Checkup', 'Confirmed'),
                    (${pats[1 % pats.length].id}, ${docs[1 % docs.length].id}, '${today}', '11:30 AM', 'Skin Allergy Consultation', 'Pending'),
                    (${pats[2 % pats.length].id}, ${docs[2 % docs.length].id}, '${today}', '02:00 PM', 'Fever and Flu Symptoms', 'Pending'),
                    (${pats[3 % pats.length].id}, ${docs[3 % docs.length].id}, '${today}', '04:30 PM', 'Childhood Vaccination Check', 'Completed')
                `);
            }
        }

        connection.release();
        console.log("Database initialized and verified successfully.");
    } catch (err) {
        console.error("Database initialization failed:", err.message);
    }
}

initDatabase();

module.exports = pool;