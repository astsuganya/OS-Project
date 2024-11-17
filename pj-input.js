let processIdCounter = 1;
let processes = [];
let timeQuantum = null;

function handleAlgorithmChange() {
    const algorithm = document.getElementById("algorithmSelect").value;

    document.getElementById("priorityInput").style.display = algorithm === "priority" ? "block" : "none";
    document.getElementById("quantumInput").style.display = algorithm === "rr" ? "block" : "none";
    document.getElementById("multilevelQuantumInput").style.display = algorithm === "multilevel" ? "block" : "none";

    const dynamicHeader = document.getElementById("dynamicHeader");

    if (algorithm === "priority") {
        dynamicHeader.textContent = "Priority";
        dynamicHeader.style.display = "";
    } else if (algorithm === "rr" || algorithm === "multilevel") {
        dynamicHeader.textContent = "Time Quantum";
        dynamicHeader.style.display = "";
    } else {
        dynamicHeader.style.display = "none";
    }

    updateTableVisibility(algorithm);
}

function updateTableVisibility(algorithm) {
    const tableRows = document.querySelectorAll("#processListTable tbody tr");
    tableRows.forEach(row => {
        const dynamicCell = row.cells[3];
        if (algorithm === "priority" || algorithm === "rr" || algorithm === "multilevel") {
            dynamicCell.style.display = "";
        } else {
            dynamicCell.style.display = "none";
        }
    });
}

function addProcess() {
    const arrivalTime = parseInt(document.getElementById("arrivalTime").value);
    const burstTime = parseInt(document.getElementById("burstTime").value);
    const algorithm = document.getElementById("algorithmSelect").value;
    const priority = algorithm === "priority" ? parseInt(document.getElementById("priority").value) : null;
    const timeQuantum = algorithm === "rr" ? parseInt(document.getElementById("timeQuantum").value) : 
                        algorithm === "multilevel" ? parseInt(document.getElementById("multiTimeQuantum").value) : null;

    if (algorithm === "rr") {
        roundRobinQuantum = timeQuantum; // Update the global time quantum for consistency
    }

    // ตรวจสอบค่าที่กรอก
    if (isNaN(arrivalTime) || arrivalTime < 0 || isNaN(burstTime) || burstTime < 0 || 
        (algorithm === "priority" && (isNaN(priority) || priority < 0)) || 
        ((algorithm === "rr" || algorithm === "multilevel") && (isNaN(timeQuantum) || timeQuantum < 0))) {
        alert("Please enter valid values for all fields. All values must be greater than or equal to 0.");
        return;
    }

    const process = {
        id: processIdCounter++,
        arrivalTime,
        burstTime,
        priority,
        timeQuantum
    };

    processes.push(process);
    updateProcessTable();
    clearInputs();
}

function clearInputs() {
    document.getElementById("arrivalTime").value = '';
    document.getElementById("burstTime").value = '';
    document.getElementById("priority").value = '';
    document.getElementById("multiTimeQuantum").value = '';
}

let roundRobinQuantum = null; // Global variable to store a consistent time quantum for Round Robin

function generateProcesses() {
    const algorithm = document.getElementById("algorithmSelect").value;

    if (algorithm === "rr") {
        const userInputQuantum = parseInt(document.getElementById("timeQuantum").value);
        if (userInputQuantum && userInputQuantum > 0) {
            roundRobinQuantum = userInputQuantum; // Use user-inputted quantum if valid
        } else if (!roundRobinQuantum) {
            roundRobinQuantum = Math.floor(Math.random() * 10) + 1; // Generate random quantum if not set
        }
    }

    const arrivalTime = Math.floor(Math.random() * 10);
    const burstTime = Math.floor(Math.random() * 10) + 1;
    const priority = algorithm === "priority" ? Math.floor(Math.random() * 10) + 1 : null;
    const timeQuantum = algorithm === "rr" ? roundRobinQuantum : 
                        algorithm === "multilevel" ? Math.floor(Math.random() * 10) + 1 : null;

    const process = {
        id: processIdCounter++,
        arrivalTime,
        burstTime,
        priority,
        timeQuantum
    };

    processes.push(process);
    updateProcessTable();
}

function updateProcessTable() {
    const tableBody = document.getElementById("processListTable").getElementsByTagName("tbody")[0];
    const algorithm = document.getElementById("algorithmSelect").value;
    tableBody.innerHTML = ""; 

    // Sort the processes array by ID before rendering
    processes.sort((a, b) => a.id - b.id);

    // Reassign sequential IDs dynamically
    processes.forEach(process => {
        const row = tableBody.insertRow();

        row.insertCell(0).innerText = `P${process.id}`; 
        row.insertCell(1).innerText = process.arrivalTime;
        row.insertCell(2).innerText = process.burstTime;

        const dynamicCell = row.insertCell(3);
        if (algorithm === "priority") {
            dynamicCell.innerText = process.priority;
        } else if (algorithm === "rr" || algorithm === "multilevel") {
            dynamicCell.innerText = process.timeQuantum;
        } else {
            dynamicCell.style.display = "none";
        }

        const deleteCell = row.insertCell(4);
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.onclick = () => deleteProcess(process.id);
        deleteCell.appendChild(deleteButton);
    });

    updateTableVisibility(algorithm);
}

function deleteProcess(id) {
    processes = processes.filter(process => process.id !== id);
    updateProcessTable();
}

// First-Come, First-Serve Algorithm
function fcfs() {
    let currentTime = 0;
    let results = [];
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    processes.forEach(process => {
        currentTime = Math.max(currentTime, process.arrivalTime) + process.burstTime;
        process.completionTime = currentTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;

        results.push({
            id: process.id,
            arrival: process.arrivalTime,
            burst: process.burstTime,
            finish: process.completionTime,
            turnaround: process.turnaroundTime,
            waiting: process.waitingTime
        });
    });

    return results;
}

// Round Robin Algorithm
function rr(processes, timeQuantum) {
    if (!timeQuantum || timeQuantum <= 0) {
        console.error("Invalid Time Quantum for Round Robin.");
        return [];
    }

    if (!Array.isArray(processes) || processes.length === 0) {
        console.error("Processes must be a non-empty array.");
        return [];
    }

    // Create a copy of processes to avoid modifying the original data
    const processesCopy = processes.map(p => ({
        ...p,
        remainingTime: p.burstTime, // track remaining burst time
        startTime: -1, // track the start time
        finishTime: 0, // track finish time
        waitingTime: 0, // track waiting time
        turnaroundTime: 0, // track turnaround time
    }));

    let results = [];
    let timeline = [];
    let readyQueue = [];
    let currentTime = 0;
    let index = 0; // process arrival index

    // Run the algorithm until all processes are completed
    while (processesCopy.some(p => p.remainingTime > 0)) {
        // Add processes to ready queue that have arrived and not yet executed
        while (index < processesCopy.length && processesCopy[index].arrivalTime <= currentTime) {
            readyQueue.push(processesCopy[index]);
            index++;
        }

        // If no process is in the ready queue, idle until the next process arrives
        if (readyQueue.length === 0) {
            const nextArrival = processesCopy
                .filter(p => p.remainingTime > 0)
                .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);
            if (nextArrival !== Infinity) {
                timeline.push({ process: "Idle", duration: nextArrival - currentTime });
                currentTime = nextArrival;
            }
            continue;
        }

        // Process the first process in the ready queue
        const currentProcess = readyQueue.shift(); // Fetch the first process from the queue
        const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);

        // Track the start time when the process is first executed
        if (currentProcess.startTime === -1) {
            currentProcess.startTime = currentTime;
        }

        // Add the process execution to the Gantt chart
        timeline.push({ process: `P${currentProcess.id}`, duration: executionTime });

        // Update remaining burst time and current time
        currentProcess.remainingTime -= executionTime;
        currentTime += executionTime;

        // If the process is not finished, add it back to the ready queue at the end of the cycle
        if (currentProcess.remainingTime > 0) {
            readyQueue.push(currentProcess);
        } else {
            // If the process is finished, calculate its finish time, turnaround time, and waiting time
            currentProcess.finishTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.finishTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;

            // Store the result for the finished process
            results.push({
                id: currentProcess.id,
                arrival: currentProcess.arrivalTime,
                burst: currentProcess.burstTime,
                finish: currentProcess.finishTime,
                turnaround: currentProcess.turnaroundTime,
                waiting: currentProcess.waitingTime
            });
        }

        // Re-add the process back at the end of the queue after one full cycle (only if not finished)
        if (readyQueue.length > 0) {
            readyQueue.push(currentProcess);
        }
    }

    // Output the Gantt chart
    console.log("Gantt Chart:", timeline.map(entry => `${entry.process} (${entry.duration})`).join(" | "));
    return results;
}

// Shortest Job First Algorithm
function sjf() {
    let currentTime = 0;
    let results = [];
    processes.forEach(p => (p.remainingTime = p.burstTime));
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    while (processes.some(p => p.remainingTime > 0)) {
        const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

        if (availableProcesses.length > 0) {
            const shortestProcess = availableProcesses.reduce((prev, curr) => prev.remainingTime < curr.remainingTime ? prev : curr);
            currentTime = Math.max(currentTime, shortestProcess.arrivalTime) + shortestProcess.remainingTime;
            shortestProcess.remainingTime = 0;

            shortestProcess.completionTime = currentTime;
            shortestProcess.turnaroundTime = currentTime - shortestProcess.arrivalTime;
            shortestProcess.waitingTime = shortestProcess.turnaroundTime - shortestProcess.burstTime;

            results.push({
                id: shortestProcess.id,
                arrival: shortestProcess.arrivalTime,
                burst: shortestProcess.burstTime,
                finish: shortestProcess.completionTime,
                turnaround: shortestProcess.turnaroundTime,
                waiting: shortestProcess.waitingTime
            });
        } else {
            currentTime++;
        }
    }

    return results;
}

// Shortest Remaining Time First Algorithm
function srtf() {
    let currentTime = 0;
    let results = [];
    processes.forEach(p => (p.remainingTime = p.burstTime));

    while (processes.some(p => p.remainingTime > 0)) {
        const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

        if (availableProcesses.length > 0) {
            const shortestRemainingProcess = availableProcesses.reduce((prev, curr) => prev.remainingTime < curr.remainingTime ? prev : curr);
            currentTime++;
            shortestRemainingProcess.remainingTime--;

            if (shortestRemainingProcess.remainingTime === 0) {
                shortestRemainingProcess.completionTime = currentTime;
                shortestRemainingProcess.turnaroundTime = currentTime - shortestRemainingProcess.arrivalTime;
                shortestRemainingProcess.waitingTime = shortestRemainingProcess.turnaroundTime - shortestRemainingProcess.burstTime;

                results.push({
                    id: shortestRemainingProcess.id,
                    arrival: shortestRemainingProcess.arrivalTime,
                    burst: shortestRemainingProcess.burstTime,
                    finish: shortestRemainingProcess.completionTime,
                    turnaround: shortestRemainingProcess.turnaroundTime,
                    waiting: shortestRemainingProcess.waitingTime
                });
            }
        } else {
            currentTime++;
        }
    }

    return results;
}

// Updated runScheduler Function
function runScheduler() {
    const algorithm = document.getElementById("algorithmSelect").value;
    const timeQuantumInput = document.getElementById("timeQuantum").value;  // ตรวจสอบการอ่านค่า Time Quantum
    const timeQuantum = algorithm === "rr" ? parseInt(timeQuantumInput) || roundRobinQuantum : null;

    if (algorithm === "rr" && (!timeQuantum || timeQuantum <= 0)) {
        alert("Please enter a valid Time Quantum for Round Robin.");
        return;
    }

    // Update the global quantum to maintain consistency for RR
    if (algorithm === "rr") {
        roundRobinQuantum = timeQuantum;
    }
    let results = [];
    switch (algorithm) {
        case "fcfs":
            results = fcfs();
            break;
        case "rr":
            results = rr(processes, timeQuantum);  // ตรวจสอบการส่งค่า Time Quantum
            break;
        case "sjf":
            results = sjf();
            break;
        case "srtf":
            results = srtf();
            break;
        default:
            alert("Unsupported algorithm selected.");
            return;  // ถ้าไม่มีการเลือกอัลกอริธึมที่ถูกต้อง
    }

    // เรียกใช้ displayResults เพื่อแสดงผล
    if (results.length > 0) {
        displayResults(results);
    }
}

function displayResults(results) {
    const timeline = document.getElementById("timeline");
    const time = document.getElementById("time");
    const outputTable = document.getElementById("outputTable");

    timeline.innerHTML = "";
    time.innerHTML = "";
    outputTable.innerHTML = "";

    let ganttChart = "";
    let ganttLabels = "";
    let tableRows = "";
    let currentTime = 0;
    let totalTurnaround = 0;
    let totalWaiting = 0;

    // Ensure the results array is sorted by the order of execution (e.g., finish time)
    results.sort((a, b) => a.finish - b.finish);

    results.forEach(result => {
        const dynamicId = `P${result.id}`;

        if (result.arrival > currentTime) {
            ganttChart += `<div class="gantt-process gap" style="flex:${result.arrival - currentTime}">Idle</div>`;
            ganttLabels += `<div style="flex:${result.arrival - currentTime}">${currentTime}</div>`;
            currentTime = result.arrival;
        }

        ganttChart += `<div class="gantt-process" style="flex:${result.burst}">${dynamicId}</div>`;
        ganttLabels += `<div style="flex:${result.burst}">${currentTime}</div>`;

        currentTime += result.burst;

        tableRows += `
            <tr>
                <td>${dynamicId}</td>  <!-- Correctly display the process ID -->
                <td>${result.arrival}</td>
                <td>${result.burst}</td>
                <td>${result.finish}</td>
                <td>${result.turnaround}</td>
                <td>${result.waiting}</td>
            </tr>`;

        totalTurnaround += result.turnaround;
        totalWaiting += result.waiting;
    });

    // Add final time marker to Gantt chart
    ganttLabels += `<div>${currentTime}</div>`;

    const averageTurnaround = totalTurnaround / results.length;
    const averageWaiting = totalWaiting / results.length;

    timeline.innerHTML = ganttChart;
    time.innerHTML = ganttLabels;

    outputTable.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Process</th>
                    <th>Arrival</th>
                    <th>Burst</th>
                    <th>Finish</th>
                    <th>Turnaround</th>
                    <th>Waiting</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
            <tfoot>
                <tr>
                    <td colspan="4">Average</td>
                    <td>${averageTurnaround.toFixed(2)}</td>
                    <td>${averageWaiting.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>`;
}
