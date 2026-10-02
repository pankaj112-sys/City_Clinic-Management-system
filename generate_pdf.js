const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function buildSynopsisPDF() {
    const outputPath = path.join(__dirname, 'CityCare_Clinic_Management_System_Synopsis.pdf');
    const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 36, bottom: 36, left: 40, right: 40 },
        bufferPages: true,
        autoFirstPage: true
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const contentWidth = pageWidth - 80; // 515.28

    // Colors
    const primaryBlue = '#1d4ed8';
    const darkNavy = '#0f172a';
    const textDark = '#1e293b';
    const textMuted = '#475569';
    const borderLight = '#cbd5e1';
    const bgLight = '#f8fafc';

    function drawHeader(pageTitle) {
        doc.save();
        doc.fillColor(primaryBlue)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text('CITYCARE CLINIC MANAGEMENT SYSTEM', 40, 22, { lineBreak: false });
        doc.fillColor(textMuted)
           .fontSize(8)
           .font('Helvetica')
           .text(`|  Full-Stack Project Synopsis  |  ${pageTitle}`, 215, 22, { align: 'right', width: contentWidth - 175 });
        doc.strokeColor(borderLight)
           .lineWidth(0.75)
           .moveTo(40, 32)
           .lineTo(pageWidth - 40, 32)
           .stroke();
        doc.restore();
    }

    // ==========================================
    // PAGE 1: PROJECT OVERVIEW & OBJECTIVES
    // ==========================================
    drawHeader('Overview & Objectives');

    // Title Card
    doc.roundedRect(40, 42, contentWidth, 75, 6)
       .fillAndStroke('#eff6ff', '#bfdbfe');
    
    doc.fillColor(primaryBlue)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('CITYCARE: AUTOMATED CLINIC MANAGEMENT SYSTEM', 52, 52, { width: contentWidth - 24 });
    doc.fillColor(textMuted)
       .fontSize(9.5)
       .font('Helvetica-Oblique')
       .text('A Production-Ready Full-Stack Web Application for Outpatient Healthcare Facilities', 52, 73);
    doc.fillColor(textDark)
       .fontSize(8.5)
       .font('Helvetica-Bold')
       .text('Tech Stack: Node.js (v22) | Express 5.x | MySQL 8.0 | Vanilla ES6+ | CSS3 Design System', 52, 92);

    // Section 1: Abstract
    let y = 130;
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('1. PROJECT ABSTRACT', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 13).lineTo(180, y + 13).stroke();
    
    y += 18;
    const abstractText = 'In contemporary outpatient facilities, manual paperwork and disorganized spreadsheets lead to severe administrative friction, appointment overlap, and loss of patient history. CityCare is a production-grade full-stack web application engineered to centralize patient registrations, manage medical specialist rosters, schedule conflict-free appointments, track consultation lifecycles in real time (Pending -> Confirmed -> Completed -> Cancelled), and deliver instant operational business intelligence through an administrative dashboard.';
    doc.fillColor(textDark).fontSize(9).font('Helvetica').text(abstractText, 40, y, { width: contentWidth, lineGap: 2.5, align: 'justify' });

    // Section 2: Problem Statement
    y += 68;
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('2. PROBLEM STATEMENT', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 13).lineTo(180, y + 13).stroke();

    y += 18;
    const problems = [
        'Paperwork Overhead: Physical registries cause high record retrieval times, duplicate entries, and data loss.',
        'Scheduling Conflicts: Lack of dynamic doctor schedule synchronization causes double-booking and patient delays.',
        'Zero Real-Time Visibility: Clinic administrators lack unified metrics on daily patient load, doctor queues, and visit statuses.',
        'Referential Disconnection: Deleting or modifying patient records manually leaves orphaned booking files and audit issues.'
    ];
    problems.forEach(p => {
        doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text('• ', 46, y);
        doc.fillColor(textDark).fontSize(8.5).font('Helvetica').text(p, 58, y, { width: contentWidth - 18, lineGap: 1.5 });
        y += 16;
    });

    // Section 3: Scope & Key Objectives
    y += 10;
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('3. PROJECT SCOPE & CORE OBJECTIVES', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 13).lineTo(250, y + 13).stroke();

    y += 18;
    const objectives = [
        'Centralized Relational Database: A secure MySQL 8.0 schema storing patients, doctors, and appointment logs.',
        'Instant Record Querying: Client-side debounced search filtering records by name, contact, email, or department.',
        'Dynamic Appointment Engine: Dropdown selectors populated directly from active registered patients and specialists in DB.',
        'Full CRUD Operations: Complete Create, Read, Update, and Delete capabilities with pre-filled editing modals across all modules.',
        'Mobile-Responsive UI: Zero-dependency responsive interface with custom CSS Grid, Flexbox, and mobile drawer navigation.'
    ];
    objectives.forEach(obj => {
        doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text('✓ ', 46, y);
        doc.fillColor(textDark).fontSize(8.5).font('Helvetica').text(obj, 58, y, { width: contentWidth - 18, lineGap: 1.5 });
        y += 16;
    });

    // Section 4: Target Stakeholders Table
    y += 10;
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('4. TARGET STAKEHOLDERS & BENEFIT MATRIX', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 13).lineTo(290, y + 13).stroke();

    y += 18;
    // Table Header
    doc.rect(40, y, contentWidth, 18).fillAndStroke('#e2e8f0', '#cbd5e1');
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
       .text('Stakeholder Role', 48, y + 5)
       .text('Key Modules Utilized', 180, y + 5)
       .text('Primary Practical Value', 340, y + 5);

    y += 18;
    const stakeholders = [
        ['Front Desk Receptionists', 'Patients Directory, Book Appointments', 'Rapid patient registration & zero paperwork delays'],
        ['Consulting Doctors', 'Daily Appointments, Patient History', 'Organized daily patient queue & consultation notes'],
        ['Clinic Administrators', 'Dashboard Analytics, Doctor Roster', 'Real-time operational monitoring & specialist management']
    ];
    stakeholders.forEach((row, idx) => {
        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, y, contentWidth, 20).fillAndStroke(rowBg, '#e2e8f0');
        doc.fillColor(primaryBlue).fontSize(8).font('Helvetica-Bold').text(row[0], 48, y + 6);
        doc.fillColor(textDark).fontSize(8).font('Helvetica').text(row[1], 180, y + 6);
        doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(row[2], 340, y + 6, { width: 170 });
        y += 20;
    });


    // ==========================================
    // PAGE 2: SYSTEM ARCHITECTURE & TECH STACK
    // ==========================================
    doc.addPage();
    drawHeader('Architecture & Tech Stack');

    y = 44;
    doc.fillColor(primaryBlue).fontSize(12).font('Helvetica-Bold').text('1. THREE-TIER SYSTEM ARCHITECTURE', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 14).lineTo(250, y + 14).stroke();

    y += 22;
    // Tier 1 Box
    doc.roundedRect(40, y, contentWidth, 54, 4).fillAndStroke('#eff6ff', '#bfdbfe');
    doc.fillColor(primaryBlue).fontSize(9.5).font('Helvetica-Bold').text('TIER 1: PRESENTATION LAYER (CLIENT BROWSER)', 48, y + 6);
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica')
       .text('HTML5 semantic structure, Custom CSS3 Design System with responsive Grid & Flexbox, Vanilla JavaScript ES6+ fetch engine, real-time debounced search, modal dialogue system, and asynchronous toast notifications.', 48, y + 20, { width: contentWidth - 16, lineGap: 1.5 });

    y += 62;
    // Tier 2 Box
    doc.roundedRect(40, y, contentWidth, 54, 4).fillAndStroke('#f0fdf4', '#bbf7d0');
    doc.fillColor('#15803d').fontSize(9.5).font('Helvetica-Bold').text('TIER 2: APPLICATION & BUSINESS LOGIC LAYER (EXPRESS 5.x)', 48, y + 6);
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica')
       .text('High-performance Node.js runtime hosting Express 5.x REST framework. Provides parameterized SQL query dispatching, request validation, CORS security headers, error-handling middleware, and static asset streaming.', 48, y + 20, { width: contentWidth - 16, lineGap: 1.5 });

    y += 62;
    // Tier 3 Box
    doc.roundedRect(40, y, contentWidth, 54, 4).fillAndStroke('#faf5ff', '#e9d5ff');
    doc.fillColor('#7e22ce').fontSize(9.5).font('Helvetica-Bold').text('TIER 3: DATA PERSISTENCE LAYER (MYSQL 8.0 RELATIONAL DB)', 48, y + 6);
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica')
       .text('MySQL 8.0 relational database managed via mysql2/promise connection pooling (10 concurrent pooled connections). Guarantees ACID compliance, foreign-key referential integrity (ON DELETE CASCADE), and automatic table creation.', 48, y + 20, { width: contentWidth - 16, lineGap: 1.5 });

    // Section 2: Technology Stack Summary
    y += 72;
    doc.fillColor(primaryBlue).fontSize(12).font('Helvetica-Bold').text('2. DETAILED TECHNOLOGY SPECIFICATIONS', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 14).lineTo(280, y + 14).stroke();

    y += 22;
    const techSpecs = [
        ['Frontend Markup & Design', 'HTML5 Semantic Elements, CSS3 Variables, CSS Grid (2-column forms), Flexbox, FontAwesome 6'],
        ['Client-Side Scripting', 'Vanilla JavaScript ES6+ (Async/Await, Fetch API, DOM manipulation, Debouncing - Zero frameworks)'],
        ['Backend Web Framework', 'Express 5.2.1 running on Node.js v22.14 LTS with express.json() & express.urlencoded() middleware'],
        ['Database & Pool Driver', 'MySQL 8.0 Community Server with mysql2/promise connection pool (auto-reconnect enabled)'],
        ['Configuration & Security', 'dotenv environment variable isolation, CORS handling, prepared parameterized statements']
    ];
    techSpecs.forEach(([k, v]) => {
        doc.fillColor(darkNavy).fontSize(8.5).font('Helvetica-Bold').text(`• ${k}: `, 44, y, { lineBreak: false });
        doc.fillColor(textDark).fontSize(8.5).font('Helvetica').text(v, 185, y, { width: contentWidth - 145, lineGap: 1 });
        y += 18;
    });

    // Section 3: REST API Matrix
    y += 12;
    doc.fillColor(primaryBlue).fontSize(12).font('Helvetica-Bold').text('3. RESTFUL API ENDPOINT MATRIX', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 14).lineTo(240, y + 14).stroke();

    y += 22;
    doc.rect(40, y, contentWidth, 18).fillAndStroke('#e2e8f0', '#cbd5e1');
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
       .text('Method', 46, y + 5)
       .text('Endpoint Route', 105, y + 5)
       .text('Description & Parameters', 245, y + 5);

    y += 18;
    const apiRoutes = [
        ['GET', '/api/dashboard/stats', 'Aggregates counts: total patients, doctors, bookings, pending visits'],
        ['GET', '/api/dashboard/recent-appointments', 'Relational join returning latest 6 appointments with patient/doctor info'],
        ['GET', '/api/patients', 'Returns patient records (supports real-time ?search= query parameter)'],
        ['POST', '/api/patients', 'Validates and inserts a new patient profile (name, age, phone, email)'],
        ['PUT', '/api/patients/:id', 'Updates demographic and contact details of an existing patient'],
        ['DELETE', '/api/patients/:id', 'Deletes patient profile; cascades removal to associated appointments'],
        ['GET', '/api/doctors', 'Lists all doctors (supports ?search= keyword and ?spec= department filter)'],
        ['POST', '/api/doctors', 'Registers a new medical specialist with consulting hours and experience'],
        ['PUT', '/api/doctors/:id', 'Updates doctor details, assigned consulting schedule, and active status'],
        ['DELETE', '/api/doctors/:id', 'Removes doctor specialist record from clinic roster'],
        ['GET', '/api/appointments', 'Relational query joining patients and doctors tables (?status=, ?search=)'],
        ['POST', '/api/appointments', 'Creates consultation booking linking patient_id and doctor_id'],
        ['PUT', '/api/appointments/:id', 'Updates appointment schedule date, time, clinical reason, or notes'],
        ['PATCH', '/api/appointments/:id/status', 'Fast status changer (Pending, Confirmed, Completed, Cancelled)'],
        ['DELETE', '/api/appointments/:id', 'Cancels and permanently purges appointment consultation record']
    ];

    apiRoutes.forEach((route, idx) => {
        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, y, contentWidth, 14.5).fillAndStroke(rowBg, '#e2e8f0');
        let mColor = primaryBlue;
        if (route[0] === 'POST') mColor = '#15803d';
        if (route[0] === 'DELETE') mColor = '#b91c1c';
        if (route[0] === 'PATCH' || route[0] === 'PUT') mColor = '#b45309';

        doc.fillColor(mColor).fontSize(7.5).font('Helvetica-Bold').text(route[0], 46, y + 3.5);
        doc.fillColor(darkNavy).fontSize(7.5).font('Helvetica-Bold').text(route[1], 105, y + 3.5);
        doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text(route[2], 245, y + 3.5, { width: 260 });
        y += 14.5;
    });


    // ==========================================
    // PAGE 3: MODULE WALKTHROUGH & SCREENSHOTS (PART 1)
    // ==========================================
    doc.addPage();
    drawHeader('Module Walkthrough: Dashboard & Patients');

    y = 42;
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('MODULE 1: EXECUTIVE DASHBOARD (index.html)', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.2).moveTo(40, y + 13).lineTo(310, y + 13).stroke();

    // Embed Dashboard Screenshot
    y += 18;
    const dashImg = path.join(__dirname, 'screenshots', 'dashboard.jpg');
    if (fs.existsSync(dashImg)) {
        doc.image(dashImg, 40, y, { width: contentWidth, height: 165 });
        y += 172;
    }

    // Dashboard Content Underneath
    doc.fillColor(primaryBlue).fontSize(8.5).font('Helvetica-Bold').text('Functional Breakdown & Operational Workflow (Dashboard):', 40, y);
    y += 12;
    const dashFeatures = [
        'Live KPI Metric Cards: Fetches /api/dashboard/stats on page load. Renders 4 high-contrast cards: Total Patients (5), Total Doctors (5), Total Bookings (4), and Pending Visits (2), updating dynamically whenever database rows change.',
        'Recent Consultations Feed: Displays a relational table showing the latest 6 appointments with Patient Name, Attending Doctor & Specialization, Scheduled Date/Time, Clinical Reason, and Pill Status Badges.',
        'Color-Coded Status Pills: Visual indicators distinguish appointment states: Blue (Confirmed), Yellow (Pending), Green (Completed), Red (Cancelled).',
        'Top Header & Navigation: Displays clinic branding ("CityCare Clinic"), green "System Online" pulse badge, and instant action shortcuts.'
    ];
    dashFeatures.forEach(feat => {
        doc.fillColor(primaryBlue).fontSize(8).font('Helvetica-Bold').text('• ', 44, y);
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(feat, 54, y, { width: contentWidth - 14, lineGap: 1.5 });
        y += 17;
    });

    // Module 2: Patients Management
    y += 10;
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('MODULE 2: PATIENTS MANAGEMENT (patients.html)', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.2).moveTo(40, y + 13).lineTo(320, y + 13).stroke();

    // Embed Patients Screenshot
    y += 18;
    const patImg = path.join(__dirname, 'screenshots', 'patients.jpg');
    if (fs.existsSync(patImg)) {
        doc.image(patImg, 40, y, { width: contentWidth, height: 165 });
        y += 172;
    }

    // Patients Content Underneath
    doc.fillColor(primaryBlue).fontSize(8.5).font('Helvetica-Bold').text('Functional Breakdown & Operational Workflow (Patients Directory):', 40, y);
    y += 12;
    const patFeatures = [
        'Patient Roster Table: Renders all enrolled patients with system-generated ID (#1, #2), initial-letter avatar badge, age, gender, contact phone, email, and address.',
        'Debounced Real-Time Search: Instant querying as the user types in the search bar. Performs server-side wildcard SQL matching (name, phone, email, address) with zero page reloading.',
        'Slide-Down Registration Form: Accessible via "+ Add New Patient". Clean 2-column grid with strict HTML5 validation ensuring valid phone numbers, positive age, and required fields.',
        'Patient Edit Modal & Cascade Deletion: Clicking the pencil icon opens an interactive modal to modify contact details. The delete action includes confirmation and automatically cleans up related bookings via MySQL ON DELETE CASCADE.'
    ];
    patFeatures.forEach(feat => {
        doc.fillColor(primaryBlue).fontSize(8).font('Helvetica-Bold').text('• ', 44, y);
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(feat, 54, y, { width: contentWidth - 14, lineGap: 1.5 });
        y += 17;
    });


    // ==========================================
    // PAGE 4: MODULE WALKTHROUGH & SCREENSHOTS (PART 2)
    // ==========================================
    doc.addPage();
    drawHeader('Module Walkthrough: Doctors & Appointments');

    y = 42;
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('MODULE 3: DOCTORS MANAGEMENT (doctors.html)', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.2).moveTo(40, y + 13).lineTo(310, y + 13).stroke();

    // Embed Doctors Screenshot
    y += 18;
    const docImg = path.join(__dirname, 'screenshots', 'doctors.jpg');
    if (fs.existsSync(docImg)) {
        doc.image(docImg, 40, y, { width: contentWidth, height: 165 });
        y += 172;
    }

    // Doctors Content Underneath
    doc.fillColor(primaryBlue).fontSize(8.5).font('Helvetica-Bold').text('Functional Breakdown & Operational Workflow (Doctors Roster):', 40, y);
    y += 12;
    const docFeatures = [
        'Medical Specialist Directory: Tabular view displaying certified doctors, assigned medical departments (Cardiology, Dermatology, General Practice, Pediatrics, Orthopedics), clinical experience, direct phone, and consulting hours.',
        'Department Specialization Filter: Instant dropdown selector enabling receptionists to filter specialists by clinical domain without roundtrip reloads.',
        'Doctor Onboarding Workflow: Dedicated registration form capturing doctor name, medical department, contact info, shift timings, and initial active duty state.',
        'Duty Status Management: Tracks whether a doctor is "Active" or "On Leave", preventing receptionists from assigning patient visits to unavailable physicians.'
    ];
    docFeatures.forEach(feat => {
        doc.fillColor(primaryBlue).fontSize(8).font('Helvetica-Bold').text('• ', 44, y);
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(feat, 54, y, { width: contentWidth - 14, lineGap: 1.5 });
        y += 17;
    });

    // Module 4: Appointments Scheduling
    y += 10;
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('MODULE 4: APPOINTMENTS & SCHEDULING (appointments.html)', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.2).moveTo(40, y + 13).lineTo(380, y + 13).stroke();

    // Embed Appointments Screenshot
    y += 18;
    const apptImg = path.join(__dirname, 'screenshots', 'appointments.jpg');
    if (fs.existsSync(apptImg)) {
        doc.image(apptImg, 40, y, { width: contentWidth, height: 165 });
        y += 172;
    }

    // Appointments Content Underneath
    doc.fillColor(primaryBlue).fontSize(8.5).font('Helvetica-Bold').text('Functional Breakdown & Operational Workflow (Appointments Booking):', 40, y);
    y += 12;
    const apptFeatures = [
        'Dynamic Relational Dropdowns: The booking form dynamically fetches registered patients and active doctors from MySQL upon initialization, preventing invalid foreign key submissions.',
        'In-Table Quick Status Switcher: Receptionists can click the status dropdown directly within the table row to transition an appointment (e.g. from Pending to Confirmed or Completed). This dispatches an asynchronous PATCH request and displays a toast notification.',
        'Multi-Filter Engine: Allows filtering appointment bookings by status (All, Pending, Confirmed, Completed, Cancelled) combined with textual search on patient name or clinical symptom.',
        'Rescheduling Modal & Consultation Notes: A dedicated edit modal enables modifying date, consultation slot time, reassigning doctors, and appending diagnostic symptoms.'
    ];
    apptFeatures.forEach(feat => {
        doc.fillColor(primaryBlue).fontSize(8).font('Helvetica-Bold').text('• ', 44, y);
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(feat, 54, y, { width: contentWidth - 14, lineGap: 1.5 });
        y += 17;
    });


    // ==========================================
    // PAGE 5: DATABASE DESIGN, TESTING & FUTURE SCOPE
    // ==========================================
    doc.addPage();
    drawHeader('Database Design, Testing & Future Scope');

    y = 44;
    doc.fillColor(primaryBlue).fontSize(11.5).font('Helvetica-Bold').text('1. RELATIONAL DATABASE SCHEMA & CONSTRAINTS', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 14).lineTo(310, y + 14).stroke();

    y += 20;
    // Database tables summary in cards
    const colW = (contentWidth - 16) / 3;
    
    // Patients table box
    doc.roundedRect(40, y, colW, 90, 4).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor(primaryBlue).fontSize(8.5).font('Helvetica-Bold').text('TABLE: patients', 46, y + 6);
    doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
       .text('• id: INT (PK, AUTO_INC)\n• name: VARCHAR(100)\n• age: INT\n• gender: VARCHAR(20)\n• phone: VARCHAR(20)\n• email: VARCHAR(100)\n• address: VARCHAR(255)\n• created_at: TIMESTAMP', 46, y + 18, { lineGap: 1.5 });

    // Doctors table box
    doc.roundedRect(40 + colW + 8, y, colW, 90, 4).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor(primaryBlue).fontSize(8.5).font('Helvetica-Bold').text('TABLE: doctors', 46 + colW + 8, y + 6);
    doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
       .text('• id: INT (PK, AUTO_INC)\n• name: VARCHAR(100)\n• specialization: VARCHAR(100)\n• phone: VARCHAR(20)\n• email: VARCHAR(100)\n• experience: INT\n• available_time: VARCHAR(100)\n• status: VARCHAR(20)', 46 + colW + 8, y + 18, { lineGap: 1.5 });

    // Appointments table box
    doc.roundedRect(40 + (colW + 8) * 2, y, colW, 90, 4).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor(primaryBlue).fontSize(8.5).font('Helvetica-Bold').text('TABLE: appointments', 46 + (colW + 8) * 2, y + 6);
    doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
       .text('• id: INT (PK, AUTO_INC)\n• patient_id: INT (FK -> patients)\n• doctor_id: INT (FK -> doctors)\n• appointment_date: DATE\n• appointment_time: VARCHAR(20)\n• reason: VARCHAR(255)\n• status: ENUM\n• notes: TEXT', 46 + (colW + 8) * 2, y + 18, { lineGap: 1.5 });

    // Section 2: Verification & Testing Results
    y += 105;
    doc.fillColor(primaryBlue).fontSize(11.5).font('Helvetica-Bold').text('2. COMPREHENSIVE TEST SUITE & VERIFICATION', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 14).lineTo(310, y + 14).stroke();

    y += 20;
    doc.rect(40, y, contentWidth, 16).fillAndStroke('#e2e8f0', '#cbd5e1');
    doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
       .text('Test Category', 46, y + 4.5)
       .text('Test Case & Scenario', 130, y + 4.5)
       .text('Expected Result', 330, y + 4.5)
       .text('Outcome', 475, y + 4.5);

    y += 16;
    const testCases = [
        ['API Testing', 'GET /api/dashboard/stats', 'Returns JSON counters for all categories', 'PASS (200 OK)'],
        ['CRUD Insert', 'POST /api/patients with payload', 'Inserts into MySQL, returns insertId', 'PASS (201 Created)'],
        ['Relational Join', 'GET /api/appointments', 'Joins patients and doctors correctly', 'PASS (200 OK)'],
        ['Status Patch', 'PATCH /api/appointments/:id/status', 'Updates status to Completed in DB', 'PASS (200 OK)'],
        ['Cascade Delete', 'DELETE /api/patients/:id', 'Removes patient & deletes related bookings', 'PASS (Cascade OK)'],
        ['Live Search', 'Query /api/patients?search=Rahul', 'Matches relevant records dynamically', 'PASS (< 15ms)'],
        ['Mobile Viewport', 'Screen width < 768px in browser', 'Sidebar collapses into responsive drawer', 'PASS (Drawer OK)']
    ];

    testCases.forEach((t, idx) => {
        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, y, contentWidth, 14.5).fillAndStroke(rowBg, '#e2e8f0');
        doc.fillColor(darkNavy).fontSize(7.5).font('Helvetica-Bold').text(t[0], 46, y + 3.5);
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(t[1], 130, y + 3.5);
        doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text(t[2], 330, y + 3.5);
        doc.fillColor('#15803d').fontSize(7.5).font('Helvetica-Bold').text(t[3], 475, y + 3.5);
        y += 14.5;
    });

    // Section 3: Security & Performance
    y += 14;
    doc.fillColor(primaryBlue).fontSize(11.5).font('Helvetica-Bold').text('3. SECURITY & PERFORMANCE OPTIMIZATIONS', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 14).lineTo(290, y + 14).stroke();

    y += 20;
    const securityItems = [
        'SQL Injection Immunity: 100% of database queries execute parameterized prepared statements (? placeholders), isolating data from executable SQL commands.',
        'Asynchronous Non-Blocking Toast Alerts: Native blocking alert() dialogs were replaced by custom CSS animated toast elements that auto-dismiss in 4 seconds.',
        'Connection Pool Efficiency: Auto-managed pool with 10 concurrent connections and automatic health recycling prevents socket exhaustion during busy clinic hours.'
    ];
    securityItems.forEach(item => {
        doc.fillColor(primaryBlue).fontSize(8).font('Helvetica-Bold').text('• ', 44, y);
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(item, 54, y, { width: contentWidth - 14, lineGap: 1 });
        y += 14.5;
    });

    // Section 4: Future Scope Roadmap
    y += 10;
    doc.fillColor(primaryBlue).fontSize(11.5).font('Helvetica-Bold').text('4. CONCLUSION & FUTURE SCOPE ROADMAP', 40, y);
    doc.strokeColor(primaryBlue).lineWidth(1.5).moveTo(40, y + 14).lineTo(270, y + 14).stroke();

    y += 20;
    const roadmap = [
        'Automated SMS & WhatsApp Reminders: Integration with Twilio/WhatsApp Business API to send automatic appointment reminders 2 hours prior to scheduled visits.',
        'Electronic Health Records (EHR) & Prescription Generator: Doctor module allowing digital prescription drafting and downloadable patient consultation PDFs.',
        'Online Billing & Payment Gateway: Integration of Razorpay/Stripe to issue computerised invoices and collect consultation fees digitally.',
        'Telemedicine Video Consultation: Browser-based WebRTC encrypted video calling enabling remote consultations directly inside the portal.'
    ];
    roadmap.forEach(item => {
        doc.fillColor('#15803d').fontSize(8).font('Helvetica-Bold').text('➔ ', 44, y);
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(item, 56, y, { width: contentWidth - 16, lineGap: 1 });
        y += 14.5;
    });


    // ==========================================
    // GLOBAL FOOTERS (PAGE X OF 5)
    // ==========================================
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < (range.start + range.count); i++) {
        doc.switchToPage(i);
        doc.strokeColor(borderLight)
           .lineWidth(0.75)
           .moveTo(40, pageHeight - 32)
           .lineTo(pageWidth - 40, pageHeight - 32)
           .stroke();

        doc.fillColor(textMuted)
           .fontSize(7.5)
           .font('Helvetica')
           .text('CityCare Clinic Management System  •  Node.js | Express 5 | MySQL 8.0', 40, pageHeight - 24, { lineBreak: false });

        doc.fillColor(primaryBlue)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text(`Page ${i + 1} of ${range.count}`, pageWidth - 100, pageHeight - 24, { align: 'right', width: 60 });
    }

    doc.end();

    writeStream.on('finish', () => {
        console.log('PDF successfully generated at:', outputPath);
    });

    writeStream.on('error', (err) => {
        console.error('PDF generation error:', err);
    });
}

buildSynopsisPDF();
