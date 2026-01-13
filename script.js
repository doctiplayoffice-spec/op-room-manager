// --- State Management ---
const EVENT_TYPES = {
    PATIENT_ENTRY: 'Entrée Patient',
    ANESTHESIA_START: 'Induction Anesthésie',
    INCISION: 'Incision',
    CLOSURE: 'Fermeture',
    PATIENT_EXIT: 'Sortie Patient'
};

const STAFF = [
    { id: 's1', name: 'Dr. Hachem Sayegh', role: 'CHIRURGIEN', specialty: 'Orthopédie' },
    { id: 's2', name: 'Dr. Marie Curie', role: 'CHIRURGIEN', specialty: 'Neurochirurgie' },
    { id: 's3', name: 'Dr. Alain Prost', role: 'CHIRURGIEN', specialty: 'Cardiologie' },
    { id: 's4', name: 'Dr. Sarah Connor', role: 'CHIRURGIEN', specialty: 'Ophtalmologie' },
    { id: 's5', name: 'Dr. Gregory House', role: 'CHIRURGIEN', specialty: 'Diagnostic' },
    { id: 'a1', name: 'Dr. Luc Besson', role: 'ANESTHESISTE' },
    { id: 'a2', name: 'Dr. Claire Redfield', role: 'ANESTHESISTE' },
    { id: 'n1', name: 'Julie Martin', role: 'IBODE' },
    { id: 'n2', name: 'Thomas Bernard', role: 'IADE' },
    { id: 'n3', name: 'Lara Croft', role: 'IBODE' },
    { id: 'n4', name: 'Leon Kennedy', role: 'IADE' }
];

const DEFAULT_CHECKLIST = [
    { id: 'c1', label: 'Identité patient vérifiée', checked: true, phase: 'BEFORE_INDUCTION' },
    { id: 'c2', label: 'Site opératoire marqué', checked: true, phase: 'BEFORE_INDUCTION' },
    { id: 'c3', label: 'Vérification matériel anesthésie', checked: true, phase: 'BEFORE_INDUCTION' },
    { id: 'c4', label: 'Confirmation identité et site par l\'équipe', checked: false, phase: 'BEFORE_INCISION' },
    { id: 'c5', label: 'Antibioprophylaxie faite <60min', checked: false, phase: 'BEFORE_INCISION' },
    { id: 'c6', label: 'Comptage final compresses/aiguilles', checked: false, phase: 'BEFORE_EXIT' },
    { id: 'c7', label: 'Étiquetage des échantillons', checked: false, phase: 'BEFORE_EXIT' },
];

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

const createDate = (baseDate, hours, minutes = 0) => {
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
};

// Global Data Store
let SURGERIES = [
    // --- AUJOURD'HUI ---
    {
        id: 'op-101',
        patientId: 'PT-8821',
        procedureName: 'Arthroplastie Totale de Hanche',
        roomNumber: 1,
        status: 'busy',
        start: createDate(today, 8, 30),
        end: createDate(today, 10, 30),
        surgeon: STAFF[0],
        anesthesiologist: STAFF[5],
        events: [
            { type: EVENT_TYPES.PATIENT_ENTRY, time: createDate(today, 8, 45), user: 'Julie Martin' },
            { type: EVENT_TYPES.ANESTHESIA_START, time: createDate(today, 9, 0), user: 'Thomas Bernard' },
            { type: EVENT_TYPES.INCISION, time: createDate(today, 9, 20), user: 'Dr. Sayegh' }
        ],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-102',
        patientId: 'PT-4432',
        procedureName: 'Craniotomie',
        roomNumber: 2,
        status: 'scheduled',
        start: createDate(today, 13, 0),
        end: createDate(today, 17, 0),
        surgeon: STAFF[1],
        anesthesiologist: STAFF[5],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-103',
        patientId: 'PT-1234',
        procedureName: 'Pontage Coronarien',
        roomNumber: 3,
        status: 'cleaning',
        start: createDate(today, 9, 0),
        end: createDate(today, 14, 0),
        surgeon: STAFF[2],
        anesthesiologist: STAFF[6],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-104',
        patientId: 'PT-5678',
        procedureName: 'Cataracte Phaco',
        roomNumber: 4,
        status: 'free',
        start: createDate(today, 8, 0),
        end: createDate(today, 9, 0),
        surgeon: STAFF[3],
        anesthesiologist: STAFF[6],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-105',
        patientId: 'PT-5679',
        procedureName: 'Cataracte (2e œil)',
        roomNumber: 4,
        status: 'busy',
        start: createDate(today, 9, 30),
        end: createDate(today, 10, 30),
        surgeon: STAFF[3],
        anesthesiologist: STAFF[6],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    },
    {
        id: 'op-107',
        patientId: 'PT-0001',
        procedureName: 'Laminectomie',
        roomNumber: 6,
        status: 'scheduled',
        start: createDate(today, 11, 0),
        end: createDate(today, 13, 30),
        surgeon: STAFF[1],
        anesthesiologist: STAFF[5],
        events: [],
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST))
    }
];

// Initialize State from Data
const rooms = Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    const activeOp = SURGERIES.find(op => op.roomNumber === id && (op.status === 'busy' || op.status === 'cleaning'));

    if (activeOp) {
        return {
            id: id,
            name: `Salle ${id}`,
            status: activeOp.status,
            currentProcedure: activeOp.procedureName,
            surgeon: activeOp.surgeon.name,
            endTime: activeOp.end,
            events: activeOp.events,
            checklist: activeOp.checklist,
            currentSurgeryId: activeOp.id
        };
    } else {
        return {
            id: id,
            name: `Salle ${id}`,
            status: 'free',
            currentProcedure: null,
            surgeon: null,
            endTime: null,
            events: [],
            checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST)),
            currentSurgeryId: null
        };
    }
});

// ... (Navigation, Cockpit, Calendar, Stats functions unchanged) ...

// --- Timeline Rendering ---
let currentRoomForTimeline = null;

function renderTimeline(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    currentRoomForTimeline = roomId;

    document.getElementById('timelineRoomTitle').innerText = `${room.name} - ${room.currentProcedure || 'Sans titre'}`;
    const container = document.getElementById('timelineContent');
    container.innerHTML = '';

    if (room.events.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Aucun événement enregistré.</p>';
    } else {
        // Render events line
        room.events.forEach((evt, idx) => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.gap = '1rem';
            item.style.position = 'relative';
            item.style.paddingBottom = '1.5rem';

            // Vertical line
            if (idx !== room.events.length - 1) {
                const line = document.createElement('div');
                line.style.position = 'absolute';
                line.style.left = '16px';
                line.style.top = '32px';
                line.style.bottom = '0';
                line.style.width = '2px';
                line.style.background = '#f1f5f9';
                item.appendChild(line);
            }

            // Icon
            const icon = document.createElement('div');
            icon.style.width = '32px';
            icon.style.height = '32px';
            icon.style.borderRadius = '50%';
            icon.style.background = '#eff6ff';
            icon.style.color = '#2563eb';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.fontSize = '12px';
            icon.style.border = '1px solid #dbeafe';
            icon.innerText = '✓'; // Simple check for now
            item.appendChild(icon);

            // Text
            const content = document.createElement('div');
            content.innerHTML = `
                <div style="font-weight:600; color:#1e293b;">${evt.type}</div>
                <div style="font-size:0.75rem; color:#64748b;">${evt.time.toLocaleTimeString()} - Par ${evt.user}</div>
            `;
            item.appendChild(content);

            container.appendChild(item);
        });
    }

    // Render Actions
    const actionsContainer = document.getElementById('timelineActions');
    actionsContainer.innerHTML = '';
    Object.values(EVENT_TYPES).forEach(type => {
        const btn = document.createElement('button');
        const exists = room.events.some(e => e.type === type);

        btn.innerText = type;
        btn.style.padding = '0.5rem';
        btn.style.border = '1px solid var(--border)';
        btn.style.borderRadius = '0.5rem';
        btn.style.fontSize = '0.75rem';
        btn.style.cursor = exists ? 'not-allowed' : 'pointer';
        btn.style.background = exists ? '#f1f5f9' : 'white';
        btn.style.color = exists ? '#94a3b8' : '#334155';

        if (!exists) {
            btn.onmouseenter = () => btn.style.borderColor = '#3b82f6';
            btn.onmouseleave = () => btn.style.borderColor = 'var(--border)';
            btn.onclick = () => addEvent(roomId, type);
        }

        actionsContainer.appendChild(btn);
    });

    document.getElementById('timelineModalOverlay').style.display = 'flex';
}

function addEvent(roomId, type) {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        room.events.push({
            type: type,
            time: new Date(),
            user: 'Dr. Admin'
        });
        renderTimeline(roomId); // Re-render
    }
}

function closeTimelineModal() {
    document.getElementById('timelineModalOverlay').style.display = 'none';
    currentRoomForTimeline = null;
}

// Update renderCockpit to open timeline for BUSY rooms
const originalRenderCockpit = renderCockpit; // keep ref if needed, but we rewrite it here for clarity or just update onclick logic

// Override the interaction logic in renderCockpit 
// (We can't easily override inside the function, so we must rely on the fact that I can edit the whole file or just the function if I target it. 
//  Since I am replacing the TOP of the file, I will rewrite renderCockpit logic in next tool call or assume I am editing the whole logic block again.
//  Wait, I am replacing lines 1-380 roughly? No, let's be strategic.)

// IMPORTANT: The previous tool call view_file showed lines 300-380. I will insert the Timeline logic and update renderCockpit OnClick in one go.


// --- Navigation ---
function navigateTo(viewId) {
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // Ideally select based on clicked, but simplified here:
    const icon = viewId === 'cockpit' ? '🖥️' : (viewId === 'planning' ? '📅' : '📊');
    // Using simple text match for menu items since we don't have IDs

    // Switch View
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    // Update Title
    const titles = {
        'cockpit': 'Cockpit Temps Réel',
        'planning': 'Planning des Interventions',
        'stats': 'Tableau de Bord Statistiques'
    };
    document.getElementById('pageTitle').innerText = titles[viewId];
}

// --- Cockpit Rendering ---
function renderCockpit() {
    const grid = document.getElementById('cockpitGrid');
    grid.innerHTML = '';

    rooms.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';

        // Status config
        let statusClass = 'status-free';
        let statusText = 'LIBRE';
        if (room.status === 'busy') { statusClass = 'status-busy'; statusText = 'EN COURS'; }
        if (room.status === 'cleaning') { statusClass = 'status-cleaning'; statusText = 'NETTOYAGE'; }
        if (room.status === 'closed') { statusClass = 'status-closed'; statusText = 'FERMÉE'; }

        // Content
        let content = '';
        if (room.status === 'busy') {
            const timeLeft = Math.max(0, Math.floor((room.endTime - Date.now()) / 60000));
            content = `
                <div class="detail-row"><strong>${room.currentProcedure}</strong></div>
                <div class="detail-row">${room.surgeon}</div>
                <div class="countdown">⏱ Fin : ${timeLeft} min</div>
            `;
        } else if (room.status === 'cleaning') {
            const timeLeft = Math.max(0, Math.floor((room.endTime - Date.now()) / 60000));
            content = `<div class="detail-row" style="margin-top:auto">Fin : ${timeLeft} min</div>`;
        } else {
            content = `<div class="detail-row" style="margin-top:auto; color:var(--success)">Prête</div>`;
        }

        card.innerHTML = `
            <div class="room-header">
                <span class="room-number">${room.name}</span>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="room-details">
                ${content}
            </div>
        `;

        // Interaction
        card.onclick = () => {
            if (room.status === 'free') {
                openModal(room.id);
            } else if (room.status === 'busy') {
                renderTimeline(room.id);
            }
        };

        grid.appendChild(card);
    });
}

// --- Init ---
setInterval(() => {
    // Refresh cockpit timers every minute
    if (document.getElementById('cockpit').classList.contains('active')) {
        renderCockpit();
    }
}, 60000);

// Initial render
renderCockpit();
renderCalendar();
renderStats();

// --- Calendar Rendering ---
// --- Calendar Rendering ---
function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    container.innerHTML = '';

    // Config: 8h to 20h
    const startHour = 8;
    const endHour = 20;
    const totalHours = endHour - startHour + 1;
    const hours = Array.from({ length: totalHours }, (_, i) => i + startHour);

    const wrapper = document.createElement('div');
    wrapper.className = 'calendar-container';

    // Header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = '<div class="time-slot-header room-row-header">Salle</div>';
    hours.forEach(h => {
        header.innerHTML += `<div class="time-slot-header" style="flex:1">${h}h00</div>`;
    });
    wrapper.appendChild(header);

    // Rows
    rooms.forEach(room => {
        const row = document.createElement('div');
        row.className = 'calendar-row';
        row.style.height = '60px';

        // Room Label
        const label = document.createElement('div');
        label.className = 'time-slot-header room-row-header';
        label.innerText = room.name;
        row.appendChild(label);

        // Events Container
        const eventsContainer = document.createElement('div');
        eventsContainer.style.flex = "1";
        eventsContainer.style.position = "relative";
        eventsContainer.style.display = "flex";

        // Grid Lines / Click Zones
        hours.forEach((h) => {
            const slot = document.createElement('div');
            slot.style.flex = "1";
            slot.style.borderRight = "1px solid #e2e8f0";
            slot.style.height = "100%";
            slot.style.cursor = "pointer";
            slot.title = `Planifier ${room.name} à ${h}h`;

            slot.onmouseenter = () => slot.style.background = "rgba(59, 130, 246, 0.05)";
            slot.onmouseleave = () => slot.style.background = "transparent";
            slot.onclick = () => openModalWithPreselection(room.id, `${h}:00`);

            eventsContainer.appendChild(slot);
        });

        // Render Actual Surgeries for this room
        const roomSurgeries = SURGERIES.filter(s => s.roomNumber === room.id);

        roomSurgeries.forEach(op => {
            const opStart = op.start.getHours() + op.start.getMinutes() / 60;
            const opEnd = op.end.getHours() + op.end.getMinutes() / 60;

            // Check visibility in range [8, 20]
            if (opEnd <= startHour || opStart >= endHour) return;

            const effectiveStart = Math.max(opStart, startHour);
            const effectiveEnd = Math.min(opEnd, (endHour + 1)); // allow up to end of last slot

            const duration = effectiveEnd - effectiveStart;
            if (duration <= 0) return;

            const leftPerc = ((effectiveStart - startHour) / totalHours) * 100;
            const widthPerc = (duration / totalHours) * 100;

            const evt = document.createElement('div');
            evt.style.position = 'absolute';
            evt.style.top = '10%';
            evt.style.bottom = '10%';
            evt.style.left = `${leftPerc}%`;
            evt.style.width = `${widthPerc}%`;
            evt.style.borderRadius = '4px';
            evt.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
            evt.style.zIndex = '10';
            evt.style.padding = '4px 6px';
            evt.style.overflow = 'hidden';
            evt.style.fontSize = '0.7rem';
            evt.style.lineHeight = '1.1';
            evt.style.color = 'white';

            // Color coding
            if (op.status === 'busy') evt.style.background = '#3b82f6'; // Blue
            else if (op.status === 'cleaning') evt.style.background = '#f59e0b'; // Orange
            else if (op.status === 'free') evt.style.background = '#10b981'; // Green (Completed?)
            else evt.style.background = '#64748b'; // Scheduled (Slate)

            evt.innerHTML = `<strong>${op.procedureName}</strong><br>${op.surgeon.name}`;

            eventsContainer.appendChild(evt);
        });

        row.appendChild(eventsContainer);
        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
}

let utilizationChart = null;
let timeChart = null;

function renderStats() {
    const container = document.getElementById('statsContainer');

    // Stats calculation based on simulated data
    const activeRooms = rooms.filter(r => r.status === 'busy').length;
    const occupancy = Math.round((activeRooms / 20) * 100);
    const plannedToday = surgeries ? surgeries.length : 12; // fallback if surgeries not fully populated yet

    // HTML Structure matching the React component layout
    container.innerHTML = `
        <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; margin-bottom:2rem;">
            <div class="kpi-card" style="padding:1.5rem; background:white; border-radius:1rem; border:1px solid var(--border); box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span style="font-size:0.875rem; color:var(--text-muted); font-weight:600;">Taux d'Utilisation</span>
                    <span style="color:#10b981;">📈</span>
                </div>
                <div style="font-size:1.5rem; font-weight:800; color:var(--text);">${occupancy}%</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">+5% vs semaine dernière</div>
            </div>
            <div class="kpi-card" style="padding:1.5rem; background:white; border-radius:1rem; border:1px solid var(--border); box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span style="font-size:0.875rem; color:var(--text-muted); font-weight:600;">Procédures Totales</span>
                    <span style="color:#3b82f6;">👥</span>
                </div>
                <div style="font-size:1.5rem; font-weight:800; color:var(--text);">${plannedToday}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">Aujourd'hui</div>
            </div>
            <div class="kpi-card" style="padding:1.5rem; background:white; border-radius:1rem; border:1px solid var(--border); box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span style="font-size:0.875rem; color:var(--text-muted); font-weight:600;">Turnover Moyen</span>
                    <span style="color:#a855f7;">⏱️</span>
                </div>
                <div style="font-size:1.5rem; font-weight:800; color:var(--text);">22m</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">-3m d'amélioration</div>
            </div>
             <div class="kpi-card" style="padding:1.5rem; background:white; border-radius:1rem; border:1px solid var(--border); box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span style="font-size:0.875rem; color:var(--text-muted); font-weight:600;">Alertes Retard</span>
                    <span style="color:#f59e0b;">⚠️</span>
                </div>
                <div style="font-size:1.5rem; font-weight:800; color:var(--text);">2</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">Risque élevé Salle 02</div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem;">
            <div class="card" style="padding:1.5rem; background:white; border-radius:1rem; border:1px solid var(--border);">
                <h3 style="margin-bottom:1rem; font-size:1.125rem; font-weight:700;">Taux d'Utilisation par Salle (%)</h3>
                <div class="chart-container" style="height:300px;">
                    <canvas id="barChart"></canvas>
                </div>
            </div>
             <div class="card" style="padding:1.5rem; background:white; border-radius:1rem; border:1px solid var(--border);">
                <h3 style="margin-bottom:1rem; font-size:1.125rem; font-weight:700;">Répartition du Temps</h3>
                 <div class="chart-container" style="height:300px; display:flex; justify-content:center;">
                    <canvas id="pieChart"></canvas>
                </div>
            </div>
        </div>
    `;

    // Initialize Charts (Simulating the React Data)
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxPie = document.getElementById('pieChart').getContext('2d');

    if (utilizationChart) utilizationChart.destroy();
    if (timeChart) timeChart.destroy();

    utilizationChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Salle 01', 'Salle 02', 'Salle 03', 'Salle 04'],
            datasets: [
                {
                    label: 'Réel',
                    data: [85, 62, 45, 92],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                },
                {
                    label: 'Prévu',
                    data: [90, 75, 60, 95],
                    backgroundColor: '#cbd5e1',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });

    timeChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Chirurgie', 'Nettoyage', 'Attente/Retard'],
            datasets: [{
                data: [70, 15, 15],
                backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Modal Functions
function openModal(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // Set Room Select
    const select = document.querySelector('select');
    select.innerHTML = ''; // Reset options
    rooms.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.name} (${r.status === 'free' ? 'Libre' : 'Occupée'})`;
        if (r.id === roomId) opt.selected = true;
        if (r.status !== 'free') opt.disabled = true; // Prevent selecting busy rooms for NOW
        select.appendChild(opt);
    });

    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('interventionForm').reset();
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Get values
    const inputs = e.target.getElementsByClassName('input-field');
    const patientName = inputs[0].value; // Ugly index access but works for this structure
    const surgeonName = inputs[1].value;
    const roomId = parseInt(document.querySelector('select').value);
    const duration = parseInt(inputs[2].value) || 60;

    // Logic: In a real app we would check conflicts with dates.
    // Here we just "Start" the surgery immediately on that room for the demo.

    const room = rooms.find(r => r.id === roomId);
    if (room && room.status === 'free') {
        // Update Room State
        room.status = 'busy';
        room.currentProcedure = 'Intervention (Nouvelle)';
        room.surgeon = surgeonName;
        // Use custom duration
        room.endTime = new Date(Date.now() + duration * 60000);

        // Refresh UI
        renderCockpit();
        renderCalendar(); // Should add the new block
        renderStats();

        alert(`Intervention pour ${patientName} planifiée en Salle ${roomId}.`);
        closeModal();
    } else {
        alert("Erreur : Cette salle n'est plus disponible.");
    }
}
