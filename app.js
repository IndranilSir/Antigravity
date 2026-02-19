document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // NAVIGATION & VIEW CONTROLLER
    // ---------------------------------------------------------
    const landingPage = document.getElementById('landing-page');
    const portalApp = document.getElementById('portal-app');

    // Buttons that trigger Portal View
    const portalBtns = [
        document.getElementById('btn-portal-login'),
        document.getElementById('btn-hero-portal'),
        document.getElementById('footer-portal-link')
    ];

    // Button to exit Portal
    const backBtn = document.getElementById('btn-back-home');

    // Show Portal
    portalBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showPortal();
            });
        }
    });

    // Hide Portal (Back to Home)
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            hidePortal();
        });
    }

    function showPortal() {
        landingPage.style.display = 'none';
        portalApp.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Lock scroll for app feel
    }

    function hidePortal() {
        portalApp.classList.add('hidden');
        landingPage.style.display = 'block';
        document.body.style.overflow = 'auto';
    }

    // ---------------------------------------------------------
    // PORTAL LOGIC (Original Functionality Enhanced)
    // ---------------------------------------------------------
    const studentForm = document.getElementById('student-form');
    const studentTableBody = document.querySelector('#student-table tbody');
    const noRecordsMessage = document.getElementById('no-records');
    const searchBar = document.getElementById('search-bar');

    // State
    let students = JSON.parse(localStorage.getItem('students')) || [];
    let editingId = null;

    // Initial Render
    renderStudents();

    // Event Listeners
    if (studentForm) studentForm.addEventListener('submit', handleFormSubmit);
    if (searchBar) searchBar.addEventListener('input', handleSearch);

    setupPortalTabs();
    setupPaymentForm();

    // Functions
    function setupPortalTabs() {
        const navBtns = document.querySelectorAll('.app-nav-btn');
        const sections = ['records-section', 'payment-section'];

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update buttons
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show target section
                const targetId = btn.getAttribute('data-target');
                sections.forEach(id => {
                    const el = document.getElementById(id);
                    if (id === targetId) {
                        el.classList.remove('hidden');
                    } else {
                        el.classList.add('hidden');
                    }
                });
            });
        });
    }

    function setupPaymentForm() {
        const studentSearchInput = document.getElementById('payment-student-search');
        const studentList = document.getElementById('student-list');
        const paymentForm = document.getElementById('payment-form');
        const receiptActions = document.getElementById('receipt-actions');

        if (!paymentForm) return;

        // Populate datalist for search
        function updateStudentDatalist() {
            const students = JSON.parse(localStorage.getItem('students')) || [];
            studentList.innerHTML = '';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = `${student.name} (ID: ${student.id})`;
                studentList.appendChild(option);
            });
        }

        // Update datalist when focusing on search
        studentSearchInput.addEventListener('focus', updateStudentDatalist);

        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const studentVal = studentSearchInput.value;
            const course = document.getElementById('course-name').value;
            const amount = document.getElementById('amount-paid').value;
            const mode = document.getElementById('payment-mode').value;
            const remarks = document.getElementById('remarks').value;

            // Generate Receipt Data
            const receiptNo = 'R' + Date.now().toString().slice(-6);
            const date = new Date().toLocaleDateString('en-IN');

            // Update Receipt DOM
            document.getElementById('rcpt-no').textContent = '#' + receiptNo;
            document.getElementById('rcpt-date').textContent = date;
            document.getElementById('rcpt-student').textContent = studentVal || 'Guest Student';
            document.getElementById('rcpt-course').textContent = course;
            document.getElementById('rcpt-mode').textContent = mode;

            // Format Amount in INR
            const formattedAmount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
            }).format(amount);

            document.getElementById('rcpt-amount').textContent = formattedAmount;

            // Show actions
            receiptActions.classList.remove('hidden');

            // WhatsApp Share Handler
            const uniqueBtn = document.getElementById('btn-share-whatsapp');
            // Remove old listeners to avoid duplicates (cloning is a quick hack, or just overwriting onclick)
            uniqueBtn.onclick = () => {
                const text = `*Payment Receipt - Ikon Computer Education* \n\n` +
                    `Receipt No: #${receiptNo} \n` +
                    `Date: ${date} \n` +
                    `Student: ${studentVal} \n` +
                    `Course: ${course} \n` +
                    `Amount Paid: ${formattedAmount} \n` +
                    `Payment Mode: ${mode} \n` +
                    (remarks ? `Remarks: ${remarks} \n` : '') +
                    `\nThank you for choosing Indranil Sir!`;

                const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
            };

            // Print Handler
            document.getElementById('btn-print-receipt').onclick = () => {
                window.print();
            };
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!name || !address || !email || !phone) {
            alert('Please fill in all fields correctly.');
            return;
        }

        if (editingId) {
            // Update existing student
            const index = students.findIndex(s => s.id === editingId);
            if (index !== -1) {
                // Keep original dateOfJoining if available, or set now if missing (migration)
                const originalDate = students[index].dateOfJoining || new Date().toLocaleDateString();
                students[index] = { id: editingId, name, address, email, phone, dateOfJoining: originalDate };
                editingId = null;
                document.querySelector('button[type="submit"]').textContent = 'Add Student';
            }
        } else {
            // Add new student
            const newStudent = {
                id: Date.now().toString(), // Internal unique ID
                address,
                name,
                email,
                phone,
                dateOfJoining: new Date().toLocaleDateString()
            };
            students.push(newStudent);
        }

        saveToStorage();
        renderStudents();
        studentForm.reset();
    }

    function renderStudents(filterText = '') {
        if (!studentTableBody) return;
        studentTableBody.innerHTML = '';

        const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(filterText.toLowerCase()) ||
            (student.address && student.address.toLowerCase().includes(filterText.toLowerCase())) ||
            student.email.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredStudents.length === 0) {
            noRecordsMessage.style.display = 'block';
        } else {
            noRecordsMessage.style.display = 'none';
            filteredStudents.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.address || '-'}</td>
                    <td><strong>${student.name}</strong></td>
                    <td>${student.email}</td>
                    <td>${student.phone || '-'}</td>
                    <td>${student.dateOfJoining || '-'}</td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="startEdit('${student.id}')" aria-label="Edit">
                             <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteStudent('${student.id}')" aria-label="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                studentTableBody.appendChild(row);
            });
        }
    }

    function saveToStorage() {
        localStorage.setItem('students', JSON.stringify(students));
    }

    function handleSearch(e) {
        renderStudents(e.target.value);
    }

    // Expose functions to window for onclick handlers
    window.deleteStudent = function (id) {
        if (confirm('Are you sure you want to delete this student?')) {
            students = students.filter(s => s.id !== id);
            saveToStorage();
            renderStudents(searchBar.value);

            // If we were editing this student, reset form
            if (editingId === id) {
                editingId = null;
                studentForm.reset();
                document.querySelector('button[type="submit"]').textContent = 'Add Student';
            }
        }
    };

    window.startEdit = function (id) {
        const student = students.find(s => s.id === id);
        if (student) {
            document.getElementById('name').value = student.name;
            document.getElementById('address').value = student.address || '';
            document.getElementById('email').value = student.email;
            document.getElementById('phone').value = student.phone || '';

            editingId = id;
            document.querySelector('#student-form button[type="submit"]').textContent = 'Update Student';

            // Scroll to form inside the portal
            document.getElementById('student-form').scrollIntoView({ behavior: 'smooth' });
        }
    };
});
