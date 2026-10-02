/**
 * CLINIC MANAGEMENT SYSTEM - FRONTEND APPLICATION JAVASCRIPT
 * Fully integrated with Express REST API and MySQL database.
 */

// Global API Base URL (relative path works automatically whether served on port 3000 or behind proxy)
const API_BASE = "";

// =========================================================
// 1. TOAST NOTIFICATIONS
// =========================================================

function showToast(title, message, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-circle-exclamation";
    if (type === "info") iconClass = "fa-circle-info";

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// =========================================================
// 2. GLOBAL INIT (SIDEBAR, DATE, MOBILE MENU)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    // Current date display in sidebar
    const dateElem = document.getElementById("currentDateDisplay");
    if (dateElem) {
        const now = new Date();
        const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
        dateElem.textContent = now.toLocaleDateString("en-US", options);
    }

    // Mobile menu toggle
    const toggleBtn = document.getElementById("mobileMenuToggle");
    const sidebar = document.getElementById("sidebar");
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
        });
    }

    // Auto initialize page-specific logic based on present DOM elements
    if (document.getElementById("statPatients")) {
        initDashboardPage();
    }

    if (document.getElementById("patientTableBody")) {
        initPatientsPage();
    }

    if (document.getElementById("doctorTableBody")) {
        initDoctorsPage();
    }

    if (document.getElementById("appointmentTableBody")) {
        initAppointmentsPage();
    }
});

// Helper for status badge HTML
function getStatusBadge(status) {
    const s = (status || "Pending").toLowerCase();
    let badgeClass = "status-pending";
    if (s === "confirmed") badgeClass = "status-confirmed";
    if (s === "completed") badgeClass = "status-completed";
    if (s === "cancelled") badgeClass = "status-cancelled";

    return `<span class="status-pill ${badgeClass}">${status}</span>`;
}

// =========================================================
// 3. DASHBOARD PAGE
// =========================================================

async function initDashboardPage() {
    await loadDashboardStats();
    await loadRecentAppointments();
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard/stats`);
        const json = await response.json();

        if (json.success) {
            const data = json.data;
            document.getElementById("statPatients").textContent = data.totalPatients || 0;
            document.getElementById("statDoctors").textContent = data.totalDoctors || 0;
            document.getElementById("statAppointments").textContent = data.totalAppointments || 0;
            document.getElementById("statPending").textContent = data.pendingAppointments || 0;
        }
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

async function loadRecentAppointments() {
    const tbody = document.getElementById("recentAppointmentsTableBody");
    if (!tbody) return;

    try {
        const response = await fetch(`${API_BASE}/api/dashboard/recent-appointments`);
        const json = await response.json();

        if (json.success && json.data.length > 0) {
            tbody.innerHTML = json.data.map(appt => `
                <tr>
                    <td><strong>#${appt.id}</strong></td>
                    <td>
                        <div class="table-user-info">
                            <div class="table-avatar">${(appt.patient_name || "P").charAt(0).toUpperCase()}</div>
                            <div class="table-user-details">
                                <strong>${appt.patient_name || "Unknown Patient"}</strong>
                                <span>${appt.patient_phone || "No phone"}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="table-user-details">
                            <strong>${appt.doctor_name || "Not assigned"}</strong>
                            <span>${appt.doctor_specialization || "General"}</span>
                        </div>
                    </td>
                    <td>
                        <div><i class="fa-regular fa-calendar"></i> ${appt.appointment_date}</div>
                        <small style="color:var(--text-muted);"><i class="fa-regular fa-clock"></i> ${appt.appointment_time}</small>
                    </td>
                    <td>${appt.reason || "General Consultation"}</td>
                    <td>${getStatusBadge(appt.status)}</td>
                    <td>
                        <a href="appointments.html" class="btn btn-outline btn-sm">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Details
                        </a>
                    </td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fa-solid fa-calendar-xmark"></i>
                            <h3>No Recent Appointments</h3>
                            <p>Schedule your first clinic appointment to see it here.</p>
                            <a href="appointments.html" class="btn btn-primary btn-sm">
                                <i class="fa-solid fa-plus"></i> Book Appointment
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error("Error loading recent appointments:", error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;padding:20px;">Failed to load recent appointments.</td></tr>`;
    }
}

// =========================================================
// 4. PATIENTS PAGE
// =========================================================

function initPatientsPage() {
    loadPatients();

    // Toggle Add Patient form visibility
    const toggleBtn = document.getElementById("toggleAddPatientFormBtn");
    const closeBtn = document.getElementById("closeAddPatientFormBtn");
    const formSection = document.getElementById("patientFormSection");

    if (toggleBtn && formSection) {
        toggleBtn.addEventListener("click", () => {
            const isHidden = formSection.style.display === "none" || !formSection.style.display;
            formSection.style.display = isHidden ? "block" : "none";
            if (isHidden) {
                document.getElementById("patientName").focus();
            }
        });
    }

    if (closeBtn && formSection) {
        closeBtn.addEventListener("click", () => {
            formSection.style.display = "none";
        });
    }

    // Add Patient Form Submit
    const patientForm = document.getElementById("patientForm");
    if (patientForm) {
        patientForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = patientForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

            const payload = {
                name: document.getElementById("patientName").value.trim(),
                age: document.getElementById("patientAge").value,
                gender: document.getElementById("patientGender").value,
                phone: document.getElementById("patientPhone").value.trim(),
                email: document.getElementById("patientEmail").value.trim(),
                address: document.getElementById("patientAddress").value.trim()
            };

            try {
                const response = await fetch(`${API_BASE}/api/patients`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast("Success", "Patient registered successfully!", "success");
                    patientForm.reset();
                    formSection.style.display = "none";
                    loadPatients();
                } else {
                    showToast("Error", result.message || "Failed to add patient", "error");
                }
            } catch (err) {
                console.error("Patient add error:", err);
                showToast("Connection Error", "Could not connect to server.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Register Patient`;
            }
        });
    }

    // Live search input
    const searchInput = document.getElementById("searchPatient");
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadPatients(searchInput.value);
            }, 300);
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById("refreshPatientsBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            loadPatients();
            showToast("Refreshed", "Patient list updated.", "info");
        });
    }

    // Edit modal event listeners
    const editModal = document.getElementById("editPatientModal");
    const closeEditBtn = document.getElementById("closeEditPatientModalBtn");
    const cancelEditBtn = document.getElementById("cancelEditPatientBtn");
    const editForm = document.getElementById("editPatientForm");

    if (closeEditBtn && editModal) {
        closeEditBtn.addEventListener("click", () => editModal.classList.remove("active"));
    }
    if (cancelEditBtn && editModal) {
        cancelEditBtn.addEventListener("click", () => editModal.classList.remove("active"));
    }

    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("editPatientId").value;
            const payload = {
                name: document.getElementById("editPatientName").value.trim(),
                age: document.getElementById("editPatientAge").value,
                gender: document.getElementById("editPatientGender").value,
                phone: document.getElementById("editPatientPhone").value.trim(),
                email: document.getElementById("editPatientEmail").value.trim(),
                address: document.getElementById("editPatientAddress").value.trim()
            };

            try {
                const response = await fetch(`${API_BASE}/api/patients/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast("Updated", "Patient details updated successfully!", "success");
                    editModal.classList.remove("active");
                    loadPatients(searchInput ? searchInput.value : "");
                } else {
                    showToast("Error", result.message || "Failed to update patient", "error");
                }
            } catch (err) {
                console.error("Patient update error:", err);
                showToast("Error", "Could not connect to server", "error");
            }
        });
    }
}

async function loadPatients(search = "") {
    const tbody = document.getElementById("patientTableBody");
    const countElem = document.getElementById("patientCount");
    if (!tbody) return;

    try {
        const url = search.trim() ? `${API_BASE}/api/patients?search=${encodeURIComponent(search.trim())}` : `${API_BASE}/api/patients`;
        const response = await fetch(url);
        const json = await response.json();

        if (json.success) {
            const patients = json.data;
            if (countElem) {
                countElem.textContent = `${patients.length} Patient${patients.length === 1 ? "" : "s"}`;
            }

            if (patients.length > 0) {
                tbody.innerHTML = patients.map(p => `
                    <tr>
                        <td><strong>#${p.id}</strong></td>
                        <td>
                            <div class="table-user-info">
                                <div class="table-avatar">${(p.name || "P").charAt(0).toUpperCase()}</div>
                                <div class="table-user-details">
                                    <strong>${p.name}</strong>
                                    <span>Joined ${p.created_at ? p.created_at.split(" ")[0] : "Recent"}</span>
                                </div>
                            </div>
                        </td>
                        <td>${p.age} yrs / ${p.gender}</td>
                        <td><i class="fa-solid fa-phone" style="color:var(--primary); font-size:12px;"></i> ${p.phone}</td>
                        <td>${p.email || "<span style='color:var(--text-muted)'>N/A</span>"}</td>
                        <td>${p.address || "<span style='color:var(--text-muted)'>N/A</span>"}</td>
                        <td>
                            <div class="action-btns">
                                <button class="action-btn action-edit" title="Edit Patient" onclick="openEditPatientModal(${p.id})">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="action-btn action-delete" title="Delete Patient" onclick="deletePatient(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join("");
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7">
                            <div class="empty-state">
                                <i class="fa-solid fa-hospital-user"></i>
                                <h3>No Patients Found</h3>
                                <p>${search ? "No patients matched your search query." : "No patients have been registered yet."}</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    } catch (err) {
        console.error("Load patients error:", err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;padding:20px;">Failed to load patients.</td></tr>`;
    }
}

async function openEditPatientModal(id) {
    try {
        const response = await fetch(`${API_BASE}/api/patients/${id}`);
        const json = await response.json();
        if (json.success) {
            const p = json.data;
            document.getElementById("editPatientId").value = p.id;
            document.getElementById("editPatientName").value = p.name;
            document.getElementById("editPatientAge").value = p.age;
            document.getElementById("editPatientGender").value = p.gender;
            document.getElementById("editPatientPhone").value = p.phone;
            document.getElementById("editPatientEmail").value = p.email || "";
            document.getElementById("editPatientAddress").value = p.address || "";

            const modal = document.getElementById("editPatientModal");
            modal.classList.add("active");
        }
    } catch (err) {
        showToast("Error", "Could not fetch patient details", "error");
    }
}

async function deletePatient(id, name) {
    if (!confirm(`Are you sure you want to delete patient "${name}" (ID #${id})?\nAll related appointments will also be removed.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/patients/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (response.ok && result.success) {
            showToast("Deleted", `Patient "${name}" has been removed.`, "success");
            const search = document.getElementById("searchPatient") ? document.getElementById("searchPatient").value : "";
            loadPatients(search);
        } else {
            showToast("Error", result.message || "Could not delete patient", "error");
        }
    } catch (err) {
        console.error("Delete error:", err);
        showToast("Error", "Server connection failed", "error");
    }
}

// =========================================
// 5. DOCTORS PAGE
// =========================================

function initDoctorsPage() {
    loadDoctors();

    // Toggle Add Doctor Form
    const toggleBtn = document.getElementById("toggleAddDoctorFormBtn");
    const closeBtn = document.getElementById("closeAddDoctorFormBtn");
    const formSection = document.getElementById("doctorFormSection");

    if (toggleBtn && formSection) {
        toggleBtn.addEventListener("click", () => {
            const isHidden = formSection.style.display === "none" || !formSection.style.display;
            formSection.style.display = isHidden ? "block" : "none";
            if (isHidden) {
                document.getElementById("doctorName").focus();
            }
        });
    }

    if (closeBtn && formSection) {
        closeBtn.addEventListener("click", () => {
            formSection.style.display = "none";
        });
    }

    // Add Doctor Form Submit
    const doctorForm = document.getElementById("doctorForm");
    if (doctorForm) {
        doctorForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = doctorForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

            const payload = {
                name: document.getElementById("doctorName").value.trim(),
                specialization: document.getElementById("specialization").value,
                phone: document.getElementById("doctorPhone").value.trim(),
                email: document.getElementById("doctorEmail").value.trim(),
                experience: document.getElementById("experience").value || 0,
                available_time: document.getElementById("availableTime").value.trim() || "10:00 AM - 05:00 PM"
            };

            try {
                const response = await fetch(`${API_BASE}/api/doctors`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast("Success", "Doctor registered successfully!", "success");
                    doctorForm.reset();
                    formSection.style.display = "none";
                    loadDoctors();
                } else {
                    showToast("Error", result.message || "Failed to add doctor", "error");
                }
            } catch (err) {
                console.error("Doctor add error:", err);
                showToast("Error", "Could not connect to server", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Register Doctor`;
            }
        });
    }

    // Search and filter
    const searchInput = document.getElementById("searchDoctor");
    const specFilter = document.getElementById("filterSpecialization");

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadDoctors(searchInput.value, specFilter ? specFilter.value : "All");
            }, 300);
        });
    }

    if (specFilter) {
        specFilter.addEventListener("change", () => {
            loadDoctors(searchInput ? searchInput.value : "", specFilter.value);
        });
    }

    const refreshBtn = document.getElementById("refreshDoctorsBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (specFilter) specFilter.value = "All";
            loadDoctors();
            showToast("Refreshed", "Doctor roster updated.", "info");
        });
    }

    // Edit Doctor Modal
    const editModal = document.getElementById("editDoctorModal");
    const closeEditBtn = document.getElementById("closeEditDoctorModalBtn");
    const cancelEditBtn = document.getElementById("cancelEditDoctorBtn");
    const editForm = document.getElementById("editDoctorForm");

    if (closeEditBtn && editModal) {
        closeEditBtn.addEventListener("click", () => editModal.classList.remove("active"));
    }
    if (cancelEditBtn && editModal) {
        cancelEditBtn.addEventListener("click", () => editModal.classList.remove("active"));
    }

    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("editDoctorId").value;
            const payload = {
                name: document.getElementById("editDoctorName").value.trim(),
                specialization: document.getElementById("editSpecialization").value,
                phone: document.getElementById("editDoctorPhone").value.trim(),
                email: document.getElementById("editDoctorEmail").value.trim(),
                experience: document.getElementById("editExperience").value || 0,
                available_time: document.getElementById("editAvailableTime").value.trim(),
                status: document.getElementById("editDoctorStatus").value
            };

            try {
                const response = await fetch(`${API_BASE}/api/doctors/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast("Updated", "Doctor details updated successfully!", "success");
                    editModal.classList.remove("active");
                    loadDoctors();
                } else {
                    showToast("Error", result.message || "Failed to update doctor", "error");
                }
            } catch (err) {
                console.error("Doctor update error:", err);
                showToast("Error", "Could not connect to server", "error");
            }
        });
    }
}

async function loadDoctors(search = "", specialization = "All") {
    const tbody = document.getElementById("doctorTableBody");
    const countElem = document.getElementById("doctorCount");
    if (!tbody) return;

    try {
        const url = search.trim() ? `${API_BASE}/api/doctors?search=${encodeURIComponent(search.trim())}` : `${API_BASE}/api/doctors`;
        const response = await fetch(url);
        const json = await response.json();

        if (json.success) {
            let doctors = json.data;
            if (specialization && specialization !== "All") {
                doctors = doctors.filter(d => d.specialization === specialization);
            }

            if (countElem) {
                countElem.textContent = `${doctors.length} Doctor${doctors.length === 1 ? "" : "s"}`;
            }

            if (doctors.length > 0) {
                tbody.innerHTML = doctors.map(d => {
                    const statusClass = (d.status === "Active") ? "status-completed" : "status-pending";
                    return `
                        <tr>
                            <td><strong>#${d.id}</strong></td>
                            <td>
                                <div class="table-user-info">
                                    <div class="table-avatar" style="background:#f5f3ff; color:#7c3aed;">
                                        <i class="fa-solid fa-user-doctor"></i>
                                    </div>
                                    <div class="table-user-details">
                                        <strong>${d.name}</strong>
                                        <span>ID #${d.id}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge-count" style="background:#eff6ff;color:#1d4ed8;font-size:12px;">
                                    ${d.specialization}
                                </span>
                            </td>
                            <td>${d.experience || 0} years</td>
                            <td>
                                <div><i class="fa-solid fa-phone" style="color:var(--primary); font-size:12px;"></i> ${d.phone}</div>
                                <small style="color:var(--text-muted);"><i class="fa-regular fa-envelope"></i> ${d.email}</small>
                            </td>
                            <td><i class="fa-regular fa-clock" style="color:var(--warning);"></i> ${d.available_time || "10 AM - 5 PM"}</td>
                            <td><span class="status-pill ${statusClass}">${d.status || "Active"}</span></td>
                            <td>
                                <div class="action-btns">
                                    <button class="action-btn action-edit" title="Edit Doctor" onclick="openEditDoctorModal(${d.id})">
                                        <i class="fa-solid fa-user-pen"></i>
                                    </button>
                                    <button class="action-btn action-delete" title="Delete Doctor" onclick="deleteDoctor(${d.id}, '${d.name.replace(/'/g, "\\'")}')">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join("");
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8">
                            <div class="empty-state">
                                <i class="fa-solid fa-user-doctor"></i>
                                <h3>No Doctors Found</h3>
                                <p>No doctor matched your search or filter criteria.</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    } catch (err) {
        console.error("Load doctors error:", err);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;padding:20px;">Failed to load doctors.</td></tr>`;
    }
}

async function openEditDoctorModal(id) {
    try {
        const response = await fetch(`${API_BASE}/api/doctors/${id}`);
        const json = await response.json();
        if (json.success) {
            const d = json.data;
            document.getElementById("editDoctorId").value = d.id;
            document.getElementById("editDoctorName").value = d.name;
            document.getElementById("editSpecialization").value = d.specialization;
            document.getElementById("editDoctorPhone").value = d.phone;
            document.getElementById("editDoctorEmail").value = d.email;
            document.getElementById("editExperience").value = d.experience || 0;
            document.getElementById("editAvailableTime").value = d.available_time || "";
            document.getElementById("editDoctorStatus").value = d.status || "Active";

            document.getElementById("editDoctorModal").classList.add("active");
        }
    } catch (err) {
        showToast("Error", "Could not fetch doctor details", "error");
    }
}

async function deleteDoctor(id, name) {
    if (!confirm(`Are you sure you want to delete doctor "${name}" (ID #${id})?\nTheir scheduled appointments will also be removed.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/doctors/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (response.ok && result.success) {
            showToast("Deleted", `Doctor "${name}" has been removed.`, "success");
            loadDoctors();
        } else {
            showToast("Error", result.message || "Could not delete doctor", "error");
        }
    } catch (err) {
        console.error("Delete error:", err);
        showToast("Error", "Server connection failed", "error");
    }
}

// =========================================================
// 6. APPOINTMENTS PAGE
// =========================================================

let cachedPatients = [];
let cachedDoctors = [];

async function initAppointmentsPage() {
    // Populate Patients and Doctors dropdowns
    await loadAppointmentDropdowns();

    // Set today's date as default
    const dateInput = document.getElementById("appointmentDate");
    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }
    const timeInput = document.getElementById("appointmentTime");
    if (timeInput && !timeInput.value) {
        timeInput.value = "10:30 AM";
    }

    loadAppointments();

    // Toggle Book Appointment Form
    const toggleBtn = document.getElementById("toggleAddAppointmentBtn");
    const quickBtn = document.getElementById("quickNewApptBtn");
    const closeBtn = document.getElementById("closeAddAppointmentBtn");
    const formSection = document.getElementById("appointmentFormSection");

    const openForm = () => {
        if (formSection) {
            formSection.style.display = "block";
            document.getElementById("appointmentPatient").focus();
        }
    };

    if (toggleBtn) toggleBtn.addEventListener("click", () => {
        const isHidden = formSection.style.display === "none" || !formSection.style.display;
        formSection.style.display = isHidden ? "block" : "none";
    });

    if (quickBtn) quickBtn.addEventListener("click", openForm);
    if (closeBtn && formSection) closeBtn.addEventListener("click", () => formSection.style.display = "none");

    // Add Appointment Form Submit
    const apptForm = document.getElementById("appointmentForm");
    if (apptForm) {
        apptForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = apptForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Booking...`;

            const payload = {
                patient_id: document.getElementById("appointmentPatient").value,
                doctor_id: document.getElementById("appointmentDoctor").value,
                appointment_date: document.getElementById("appointmentDate").value,
                appointment_time: document.getElementById("appointmentTime").value.trim(),
                reason: document.getElementById("appointmentReason").value.trim(),
                status: document.getElementById("appointmentStatus").value,
                notes: document.getElementById("appointmentNotes").value.trim()
            };

            try {
                const response = await fetch(`${API_BASE}/api/appointments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast("Appointment Booked", "Consultation scheduled successfully!", "success");
                    apptForm.reset();
                    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
                    if (timeInput) timeInput.value = "10:30 AM";
                    formSection.style.display = "none";
                    loadAppointments();
                } else {
                    showToast("Error", result.message || "Failed to book appointment", "error");
                }
            } catch (err) {
                console.error("Booking error:", err);
                showToast("Error", "Could not connect to server", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Confirm & Book Appointment`;
            }
        });
    }

    // Filter and search
    const searchInput = document.getElementById("searchAppointment");
    const statusFilter = document.getElementById("filterStatus");

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadAppointments(searchInput.value, statusFilter ? statusFilter.value : "All");
            }, 300);
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", () => {
            loadAppointments(searchInput ? searchInput.value : "", statusFilter.value);
        });
    }

    const refreshBtn = document.getElementById("refreshAppointmentsBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "All";
            loadAppointments();
            showToast("Refreshed", "Appointments list updated.", "info");
        });
    }

    // Edit Appointment Modal
    const editModal = document.getElementById("editAppointmentModal");
    const closeEditBtn = document.getElementById("closeEditAppointmentModalBtn");
    const cancelEditBtn = document.getElementById("cancelEditAppointmentBtn");
    const editForm = document.getElementById("editAppointmentForm");

    if (closeEditBtn && editModal) closeEditBtn.addEventListener("click", () => editModal.classList.remove("active"));
    if (cancelEditBtn && editModal) cancelEditBtn.addEventListener("click", () => editModal.classList.remove("active"));

    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("editAppointmentId").value;
            const payload = {
                patient_id: document.getElementById("editApptPatient").value,
                doctor_id: document.getElementById("editApptDoctor").value,
                appointment_date: document.getElementById("editApptDate").value,
                appointment_time: document.getElementById("editApptTime").value.trim(),
                reason: document.getElementById("editApptReason").value.trim(),
                status: document.getElementById("editApptStatus").value,
                notes: document.getElementById("editApptNotes").value.trim()
            };

            try {
                const response = await fetch(`${API_BASE}/api/appointments/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast("Updated", "Appointment updated successfully!", "success");
                    editModal.classList.remove("active");
                    loadAppointments();
                } else {
                    showToast("Error", result.message || "Failed to update appointment", "error");
                }
            } catch (err) {
                console.error("Appointment update error:", err);
                showToast("Error", "Could not connect to server", "error");
            }
        });
    }
}

async function loadAppointmentDropdowns() {
    try {
        const [patRes, docRes] = await Promise.all([
            fetch(`${API_BASE}/api/patients`),
            fetch(`${API_BASE}/api/doctors`)
        ]);

        const patJson = await patRes.json();
        const docJson = await docRes.json();

        cachedPatients = patJson.success ? patJson.data : [];
        cachedDoctors = docJson.success ? docJson.data : [];

        const patSelect = document.getElementById("appointmentPatient");
        const docSelect = document.getElementById("appointmentDoctor");
        const editPatSelect = document.getElementById("editApptPatient");
        const editDocSelect = document.getElementById("editApptDoctor");

        const patOptions = cachedPatients.length > 0
            ? `<option value="">-- Select Registered Patient --</option>` + cachedPatients.map(p => `<option value="${p.id}">${p.name} (Phone: ${p.phone})</option>`).join("")
            : `<option value="">No patients found. Please add a patient first.</option>`;

        const docOptions = cachedDoctors.length > 0
            ? `<option value="">-- Select Doctor Specialist --</option>` + cachedDoctors.map(d => `<option value="${d.id}">${d.name} (${d.specialization})</option>`).join("")
            : `<option value="">No doctors found. Please add a doctor first.</option>`;

        if (patSelect) patSelect.innerHTML = patOptions;
        if (docSelect) docSelect.innerHTML = docOptions;
        if (editPatSelect) editPatSelect.innerHTML = patOptions;
        if (editDocSelect) editDocSelect.innerHTML = docOptions;

    } catch (err) {
        console.error("Dropdown load error:", err);
    }
}

async function loadAppointments(search = "", status = "All") {
    const tbody = document.getElementById("appointmentTableBody");
    const countElem = document.getElementById("appointmentCount");
    if (!tbody) return;

    try {
        let url = `${API_BASE}/api/appointments?`;
        if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;
        if (status && status !== "All") url += `status=${encodeURIComponent(status)}&`;

        const response = await fetch(url);
        const json = await response.json();

        if (json.success) {
            const appointments = json.data;
            if (countElem) {
                countElem.textContent = `${appointments.length} Appointment${appointments.length === 1 ? "" : "s"}`;
            }

            if (appointments.length > 0) {
                tbody.innerHTML = appointments.map(a => `
                    <tr>
                        <td><strong>#${a.id}</strong></td>
                        <td>
                            <div class="table-user-info">
                                <div class="table-avatar">${(a.patient_name || "P").charAt(0).toUpperCase()}</div>
                                <div class="table-user-details">
                                    <strong>${a.patient_name || "Unknown"}</strong>
                                    <span><i class="fa-solid fa-phone" style="font-size:11px;"></i> ${a.patient_phone || "N/A"}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="table-user-details">
                                <strong>${a.doctor_name || "Unassigned"}</strong>
                                <span class="badge-count" style="background:#f1f5f9;color:#475569;font-size:11px;">
                                    ${a.doctor_specialization || "General"}
                                </span>
                            </div>
                        </td>
                        <td>
                            <div><strong><i class="fa-regular fa-calendar"></i> ${a.appointment_date}</strong></div>
                            <small style="color:var(--text-muted);"><i class="fa-regular fa-clock"></i> ${a.appointment_time}</small>
                        </td>
                        <td>
                            <div>${a.reason || "General Consultation"}</div>
                            ${a.notes ? `<small style="color:var(--text-muted);"><i class="fa-regular fa-note-sticky"></i> ${a.notes}</small>` : ""}
                        </td>
                        <td>
                            <select onchange="updateAppointmentStatus(${a.id}, this.value)" style="padding:4px 8px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border-color);background:white;">
                                <option value="Pending" ${a.status === "Pending" ? "selected" : ""}>Pending</option>
                                <option value="Confirmed" ${a.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                                <option value="Completed" ${a.status === "Completed" ? "selected" : ""}>Completed</option>
                                <option value="Cancelled" ${a.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                            </select>
                        </td>
                        <td>
                            <div class="action-btns">
                                <button class="action-btn action-edit" title="Edit Appointment" onclick="openEditAppointmentModal(${a.id})">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="action-btn action-delete" title="Cancel/Delete Appointment" onclick="deleteAppointment(${a.id})">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join("");
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7">
                            <div class="empty-state">
                                <i class="fa-solid fa-calendar-check"></i>
                                <h3>No Appointments Found</h3>
                                <p>No scheduled visits matched your search or filters.</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    } catch (err) {
        console.error("Load appointments error:", err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;padding:20px;">Failed to load appointments.</td></tr>`;
    }
}

async function updateAppointmentStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/api/appointments/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();

        if (response.ok && result.success) {
            showToast("Status Updated", `Appointment #${id} is now ${newStatus}.`, "success");
        } else {
            showToast("Error", result.message || "Failed to update status", "error");
            loadAppointments();
        }
    } catch (err) {
        console.error("Status update error:", err);
        showToast("Error", "Server connection failed", "error");
    }
}

async function openEditAppointmentModal(id) {
    try {
        const response = await fetch(`${API_BASE}/api/appointments/${id}`);
        const json = await response.json();

        if (json.success) {
            const a = json.data;
            document.getElementById("editAppointmentId").value = a.id;
            document.getElementById("editApptPatient").value = a.patient_id;
            document.getElementById("editApptDoctor").value = a.doctor_id;
            document.getElementById("editApptDate").value = a.appointment_date;
            document.getElementById("editApptTime").value = a.appointment_time;
            document.getElementById("editApptReason").value = a.reason;
            document.getElementById("editApptStatus").value = a.status;
            document.getElementById("editApptNotes").value = a.notes || "";

            document.getElementById("editAppointmentModal").classList.add("active");
        }
    } catch (err) {
        showToast("Error", "Could not fetch appointment details", "error");
    }
}

async function deleteAppointment(id) {
    if (!confirm(`Are you sure you want to cancel and delete appointment #${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/appointments/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (response.ok && result.success) {
            showToast("Appointment Cancelled", `Appointment #${id} has been removed.`, "success");
            loadAppointments();
        } else {
            showToast("Error", result.message || "Could not delete appointment", "error");
        }
    } catch (err) {
        console.error("Delete appointment error:", err);
        showToast("Error", "Server connection failed", "error");
    }
}
