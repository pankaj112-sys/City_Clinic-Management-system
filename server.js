require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(__dirname));

// Friendly page routes
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/patients-page", (req, res) => {
    res.sendFile(path.join(__dirname, "patients.html"));
});
app.get("/doctors-page", (req, res) => {
    res.sendFile(path.join(__dirname, "doctors.html"));
});
app.get("/appointments-page", (req, res) => {
    res.sendFile(path.join(__dirname, "appointments.html"));
});


// ==========================================
// 1. DASHBOARD APIS
// ==========================================

app.get("/api/dashboard/stats", async (req, res) => {
    try {
        const [patientsCount] = await pool.query("SELECT COUNT(*) AS total FROM patients");
        const [doctorsCount] = await pool.query("SELECT COUNT(*) AS total FROM doctors");
        const [appointmentsCount] = await pool.query("SELECT COUNT(*) AS total FROM appointments");
        const [pendingCount] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE status = 'Pending'");
        const [confirmedCount] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE status = 'Confirmed'");
        const [completedCount] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE status = 'Completed'");
        const [cancelledCount] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE status = 'Cancelled'");

        const today = new Date().toISOString().split("T")[0];
        const [todayCount] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE appointment_date = ?", [today]);

        res.json({
            success: true,
            data: {
                totalPatients: patientsCount[0].total,
                totalDoctors: doctorsCount[0].total,
                totalAppointments: appointmentsCount[0].total,
                pendingAppointments: pendingCount[0].total,
                confirmedAppointments: confirmedCount[0].total,
                completedAppointments: completedCount[0].total,
                cancelledAppointments: cancelledCount[0].total,
                todayAppointments: todayCount[0].total
            }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ success: false, message: "Failed to load dashboard statistics" });
    }
});

app.get("/api/dashboard/recent-appointments", async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.reason,
                a.status,
                p.id AS patient_id,
                p.name AS patient_name,
                p.phone AS patient_phone,
                d.id AS doctor_id,
                d.name AS doctor_name,
                d.specialization AS doctor_specialization
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            ORDER BY a.appointment_date DESC, a.id DESC
            LIMIT 6
        `;
        const [rows] = await pool.query(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Recent appointments error:", error);
        res.status(500).json({ success: false, message: "Failed to load recent appointments" });
    }
});

// ==========================================
// 2. PATIENTS APIS
// ==========================================

// Get all patients with optional search
app.get("/api/patients", async (req, res) => {
    try {
        const { search } = req.query;
        let query = "SELECT * FROM patients";
        let params = [];

        if (search && search.trim() !== "") {
            const searchTerm = `%${search.trim()}%`;
            query += " WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? OR address LIKE ?";
            params = [searchTerm, searchTerm, searchTerm, searchTerm];
        }

        query += " ORDER BY id DESC";
        const [patients] = await pool.query(query, params);
        res.json({ success: true, data: patients });
    } catch (error) {
        console.error("Fetch patients error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch patients" });
    }
});

// Get single patient by ID
app.get("/api/patients/:id", async (req, res) => {
    try {
        const [patient] = await pool.query("SELECT * FROM patients WHERE id = ?", [req.params.id]);
        if (patient.length === 0) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        res.json({ success: true, data: patient[0] });
    } catch (error) {
        console.error("Fetch patient error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch patient" });
    }
});

// Add new patient
app.post("/api/patients", async (req, res) => {
    try {
        const { name, age, gender, phone, email, address } = req.body;

        if (!name || !age || !gender || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, age, gender, and phone number are required."
            });
        }

        const sql = `
            INSERT INTO patients (name, age, gender, phone, email, address)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [
            name.trim(),
            parseInt(age, 10),
            gender,
            phone.trim(),
            email ? email.trim() : null,
            address ? address.trim() : null
        ]);

        res.status(201).json({
            success: true,
            message: "Patient added successfully",
            patientId: result.insertId
        });
    } catch (error) {
        console.error("Add patient error:", error);
        res.status(500).json({ success: false, message: "Could not add patient to database" });
    }
});

// Update patient
app.put("/api/patients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, gender, phone, email, address } = req.body;

        if (!name || !age || !gender || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, age, gender, and phone are required."
            });
        }

        const sql = `
            UPDATE patients 
            SET name = ?, age = ?, gender = ?, phone = ?, email = ?, address = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(sql, [
            name.trim(),
            parseInt(age, 10),
            gender,
            phone.trim(),
            email ? email.trim() : null,
            address ? address.trim() : null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        res.json({ success: true, message: "Patient updated successfully" });
    } catch (error) {
        console.error("Update patient error:", error);
        res.status(500).json({ success: false, message: "Could not update patient details" });
    }
});

// Delete patient
app.delete("/api/patients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM patients WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        res.json({ success: true, message: "Patient deleted successfully" });
    } catch (error) {
        console.error("Delete patient error:", error);
        res.status(500).json({ success: false, message: "Could not delete patient" });
    }
});

// ==========================================
// 3. DOCTORS APIS
// ==========================================

// Get all doctors with optional search
app.get("/api/doctors", async (req, res) => {
    try {
        const { search } = req.query;
        let query = "SELECT * FROM doctors";
        let params = [];

        if (search && search.trim() !== "") {
            const searchTerm = `%${search.trim()}%`;
            query += " WHERE name LIKE ? OR specialization LIKE ? OR phone LIKE ? OR email LIKE ?";
            params = [searchTerm, searchTerm, searchTerm, searchTerm];
        }

        query += " ORDER BY id DESC";
        const [doctors] = await pool.query(query, params);
        res.json({ success: true, data: doctors });
    } catch (error) {
        console.error("Fetch doctors error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch doctors" });
    }
});

// Get single doctor by ID
app.get("/api/doctors/:id", async (req, res) => {
    try {
        const [doctor] = await pool.query("SELECT * FROM doctors WHERE id = ?", [req.params.id]);
        if (doctor.length === 0) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        res.json({ success: true, data: doctor[0] });
    } catch (error) {
        console.error("Fetch doctor error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch doctor" });
    }
});

// Add new doctor
app.post("/api/doctors", async (req, res) => {
    try {
        const { name, specialization, phone, email, experience, available_time } = req.body;

        if (!name || !specialization || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: "Name, specialization, phone, and email are required."
            });
        }

        const sql = `
            INSERT INTO doctors (name, specialization, phone, email, experience, available_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [
            name.trim(),
            specialization.trim(),
            phone.trim(),
            email.trim(),
            experience ? parseInt(experience, 10) : 0,
            available_time ? available_time.trim() : "10:00 AM - 05:00 PM"
        ]);

        res.status(201).json({
            success: true,
            message: "Doctor added successfully",
            doctorId: result.insertId
        });
    } catch (error) {
        console.error("Add doctor error:", error);
        res.status(500).json({ success: false, message: "Could not add doctor" });
    }
});

// Update doctor
app.put("/api/doctors/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, specialization, phone, email, experience, available_time, status } = req.body;

        if (!name || !specialization || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: "Name, specialization, phone, and email are required."
            });
        }

        const sql = `
            UPDATE doctors 
            SET name = ?, specialization = ?, phone = ?, email = ?, experience = ?, available_time = ?, status = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(sql, [
            name.trim(),
            specialization.trim(),
            phone.trim(),
            email.trim(),
            experience !== undefined ? parseInt(experience, 10) : 0,
            available_time ? available_time.trim() : "10:00 AM - 05:00 PM",
            status || "Active",
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, message: "Doctor updated successfully" });
    } catch (error) {
        console.error("Update doctor error:", error);
        res.status(500).json({ success: false, message: "Could not update doctor" });
    }
});

// Delete doctor
app.delete("/api/doctors/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM doctors WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, message: "Doctor deleted successfully" });
    } catch (error) {
        console.error("Delete doctor error:", error);
        res.status(500).json({ success: false, message: "Could not delete doctor" });
    }
});

// ==========================================
// 4. APPOINTMENTS APIS
// ==========================================

// Get all appointments with optional filters (search, status, date)
app.get("/api/appointments", async (req, res) => {
    try {
        const { search, status, date } = req.query;

        let query = `
            SELECT 
                a.id,
                a.patient_id,
                a.doctor_id,
                a.appointment_date,
                a.appointment_time,
                a.reason,
                a.status,
                a.notes,
                a.created_at,
                p.name AS patient_name,
                p.phone AS patient_phone,
                p.email AS patient_email,
                d.name AS doctor_name,
                d.specialization AS doctor_specialization,
                d.phone AS doctor_phone
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== "All") {
            query += " AND a.status = ?";
            params.push(status);
        }

        if (date) {
            query += " AND a.appointment_date = ?";
            params.push(date);
        }

        if (search && search.trim() !== "") {
            const searchTerm = `%${search.trim()}%`;
            query += " AND (p.name LIKE ? OR d.name LIKE ? OR a.reason LIKE ? OR d.specialization LIKE ?)";
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY a.appointment_date DESC, a.appointment_time ASC, a.id DESC";

        const [appointments] = await pool.query(query, params);
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error("Fetch appointments error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch appointments" });
    }
});

// Get single appointment by ID
app.get("/api/appointments/:id", async (req, res) => {
    try {
        const query = `
            SELECT 
                a.*,
                p.name AS patient_name,
                p.phone AS patient_phone,
                p.email AS patient_email,
                d.name AS doctor_name,
                d.specialization AS doctor_specialization
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            WHERE a.id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Fetch appointment error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch appointment" });
    }
});

// Book new appointment
app.post("/api/appointments", async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes } = req.body;

        if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !reason) {
            return res.status(400).json({
                success: false,
                message: "Patient, Doctor, Date, Time, and Reason are required."
            });
        }

        const sql = `
            INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason.trim(),
            status || "Pending",
            notes ? notes.trim() : null
        ]);

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointmentId: result.insertId
        });
    } catch (error) {
        console.error("Book appointment error:", error);
        res.status(500).json({ success: false, message: "Could not book appointment" });
    }
});

// Update appointment
app.put("/api/appointments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes } = req.body;

        if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !reason) {
            return res.status(400).json({
                success: false,
                message: "Patient, Doctor, Date, Time, and Reason are required."
            });
        }

        const sql = `
            UPDATE appointments
            SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?, reason = ?, status = ?, notes = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(sql, [
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason.trim(),
            status || "Pending",
            notes ? notes.trim() : null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        res.json({ success: true, message: "Appointment updated successfully" });
    } catch (error) {
        console.error("Update appointment error:", error);
        res.status(500).json({ success: false, message: "Could not update appointment" });
    }
});

// Update appointment status only (quick toggle)
app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value. Must be Pending, Confirmed, Completed, or Cancelled."
            });
        }

        const [result] = await pool.query("UPDATE appointments SET status = ? WHERE id = ?", [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ success: false, message: "Could not update status" });
    }
});

// Delete appointment
app.delete("/api/appointments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM appointments WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        res.json({ success: true, message: "Appointment cancelled and deleted successfully" });
    } catch (error) {
        console.error("Delete appointment error:", error);
        res.status(500).json({ success: false, message: "Could not delete appointment" });
    }
});



// 404 Handler for API
app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Fallback for HTML pages
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`Clinic Management System running at:`);
    console.log(`http://localhost:${PORT}`);
    console.log(`=================================================`);
});