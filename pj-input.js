let processIdCounter = 1;
let processes = [];
let timeQuantum = null;
let priorityGanttChart = [];
class Process {
    constructor(name, at, bt) {
        this.name = name; // ชื่อ process
        this.at = at;     // Arrival Time
        this.bt = bt;     // Burst Time
        this.stime = 0;   // Start Time (เวลาที่เริ่มทำงาน)
        this.ctime = 0;   // Completion Time (เวลาที่เสร็จสิ้น)
        this.wt = 0;      // Waiting Time
        this.tt = 0;      // Turnaround Time
        this.completed = false;
        this.ntt = 0;     // Normalized Turnaround Time
    }
}

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
        (algorithm === "priority" && (isNaN(priority) || priority < 0))  
        ) {
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
// โค้ดคำนวณ RR
const rrScheduling = (arrivalTime, burstTime, timeQuantum) => {
    const processesInfo = arrivalTime.map((item, index) => {
        return {
          job: `P${index + 1}`,
          at: item,
          bt: burstTime[index],
        };
      })
      .sort((obj1, obj2) => {
        if (obj1.at > obj2.at) return 1;
        if (obj1.at < obj2.at) return -1;
        return 0;
      });
  
    const solvedProcessesInfo = [];
    const ganttChartInfo = [];
    const readyQueue = [];
    let currentTime = processesInfo[0].at;
    const unfinishedJobs = [...processesInfo];
  
    const remainingTime = processesInfo.reduce((acc, process) => {
      acc[process.job] = process.bt;
      return acc;
    }, {});
  
    readyQueue.push(unfinishedJobs[0]);
  
    while (
      Object.values(remainingTime).reduce((acc, cur) => acc + cur, 0) > 0 &&
      unfinishedJobs.length > 0
    ) {
      if (readyQueue.length === 0 && unfinishedJobs.length > 0) {
        readyQueue.push(unfinishedJobs[0]);
        currentTime = readyQueue[0].at;
      }
  
      const processToExecute = readyQueue[0];
  
      if (remainingTime[processToExecute.job] <= timeQuantum) {
        const remainingT = remainingTime[processToExecute.job];
        remainingTime[processToExecute.job] -= remainingT;
        const prevCurrentTime = currentTime;
        currentTime += remainingT;
  
        ganttChartInfo.push({
          job: processToExecute.job,
          start: prevCurrentTime,
          stop: currentTime,
        });
      } else {
        remainingTime[processToExecute.job] -= timeQuantum;
        const prevCurrentTime = currentTime;
        currentTime += timeQuantum;
  
        ganttChartInfo.push({
          job: processToExecute.job,
          start: prevCurrentTime,
          stop: currentTime,
        });
      }
  
      const processToArriveInThisCycle = processesInfo.filter((p) => {
        return (
          p.at <= currentTime &&
          p !== processToExecute &&
          !readyQueue.includes(p) &&
          unfinishedJobs.includes(p)
        );
      });
  
      readyQueue.push(...processToArriveInThisCycle);
      readyQueue.push(readyQueue.shift());
  
      if (remainingTime[processToExecute.job] === 0) {
        const indexToRemoveUJ = unfinishedJobs.indexOf(processToExecute);
        if (indexToRemoveUJ > -1) {
          unfinishedJobs.splice(indexToRemoveUJ, 1);
        }
        const indexToRemoveRQ = readyQueue.indexOf(processToExecute);
        if (indexToRemoveRQ > -1) {
          readyQueue.splice(indexToRemoveRQ, 1);
        }
  
        solvedProcessesInfo.push({
          ...processToExecute,
          ft: currentTime,
          tat: currentTime - processToExecute.at,
          wat: currentTime - processToExecute.at - processToExecute.bt,
        });
      }
    }
  
    solvedProcessesInfo.sort((obj1, obj2) => {
      if (obj1.at > obj2.at) return 1;
      if (obj1.at < obj2.at) return -1;
      if (obj1.job > obj2.job) return 1;
      if (obj1.job < obj2.job) return -1;
      return 0;
    });
  
    return {
      processes: solvedProcessesInfo,
      ganttChartInfo,
    };
  };
  
// Round Robin Algorithm
function rr(processes, timeQuantumRR) {
    const arrivalTimeRR = processes.map((p) => p.arrivalTime);
    const burstTimeRR = processes.map((p) => p.burstTime);

    // เรียกใช้ rrScheduling
    const { processes: solvedProcesses, ganttChartInfo } = rrScheduling(arrivalTimeRR, burstTimeRR, timeQuantumRR);

    // สร้างข้อมูลในรูปแบบที่ต้องการสำหรับ displayResults
    const results = solvedProcesses.map((proc) => ({
        id: proc.job.replace("P", ""), // ลบ "P" เพื่อให้ id ตรงกับ format
        arrival: proc.at,
        burst: proc.bt,
        finish: proc.ft,
        turnaround: proc.tat,
        waiting: proc.wat,
    }));

    // สร้าง Gantt Chart สำหรับ displayResults
    priorityGanttChart = ganttChartInfo.map((entry) => ({
        id: entry.job.replace("P", ""), // ลบ "P" เพื่อให้ตรงกับ format
        startTime: entry.start,
        endTime: entry.stop,
    }));

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
//priority  Algorithm
function priorityScheduling() {
    let currentTime = 0;
    let completed = 0;
    let results = [];
    let ganttChart = [];
    let isProcessRunning = false;
    let currentProcess = null;
    let totalProcesses = processes.length;
    let processesCopy = processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
    }));

    // Sort processes by arrival time
    processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);

    while (completed !== totalProcesses) {
        // Get available processes
        let availableProcesses = processesCopy.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

        if (availableProcesses.length > 0) {
            // Select the process with the highest priority (lowest priority number)
            availableProcesses.sort((a, b) => a.priority - b.priority);
            currentProcess = availableProcesses[0];

            // Execute the process
            if (!isProcessRunning || currentProcess.id !== ganttChart[ganttChart.length - 1]?.id) {
                ganttChart.push({
                    id: currentProcess.id,
                    startTime: currentTime,
                });
            }

            isProcessRunning = true;
            currentProcess.remainingTime--;
            currentTime++;

            // Check if the process is completed
            if (currentProcess.remainingTime === 0) {
                currentProcess.completionTime = currentTime;
                currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
                currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;

                results.push({
                    id: currentProcess.id,
                    arrival: currentProcess.arrivalTime,
                    burst: currentProcess.burstTime,
                    finish: currentProcess.completionTime,
                    turnaround: currentProcess.turnaroundTime,
                    waiting: currentProcess.waitingTime,
                });

                completed++;
                isProcessRunning = false;
            }
        } else {
            // CPU is idle
            if (!isProcessRunning || ganttChart[ganttChart.length - 1]?.id !== 'Idle') {
                ganttChart.push({
                    id: 'Idle',
                    startTime: currentTime,
                });
            }
            isProcessRunning = false;
            currentTime++;
        }
    }

    // Set end times for Gantt chart entries
    for (let i = 0; i < ganttChart.length; i++) {
        if (i < ganttChart.length - 1) {
            ganttChart[i].endTime = ganttChart[i + 1].startTime;
        } else {
            ganttChart[i].endTime = currentTime;
        }
    }

    // Store Gantt chart data for display
    priorityGanttChart = ganttChart;

    return results;
}
//HRRN Algorithm
function hrrnScheduling() {
    const n = processes.length;
    const processList = processes.map((process, index) => 
        new Process(`${index + 1}`, process.arrivalTime, process.burstTime));
    let ganttChart = [];
    let t = Math.min(...processList.map(p => p.at));
    let totalBurstTime = processList.reduce((sum, process) => sum + process.bt, 0);
    let results = [];
    let avgwt = 0, avgtt = 0;

    while (processList.some(p => !p.completed)) {
        let hrr = -1, loc = -1;

        for (let i = 0; i < n; i++) {
            if (processList[i].at <= t && !processList[i].completed) {
                let responseRatio = (processList[i].bt + (t - processList[i].at)) / processList[i].bt;
                if (responseRatio > hrr) {
                    hrr = responseRatio;
                    loc = i;
                }
            }
        }

        if (loc === -1) {
            // ไม่มีโปรเซสที่พร้อม ทำให้ CPU Idle
            ganttChart.push({ id: 'Idle', startTime: t, endTime: t + 1 });
            t++;
            continue;
        }

        let current = processList[loc];
        ganttChart.push({ id: current.name, startTime: t, endTime: t + current.bt });
        current.stime = t;
        t += current.bt;
        current.ctime = t;
        current.completed = true;
        current.wt = current.stime - current.at;
        current.tt = current.ctime - current.at;
        current.ntt = current.tt / current.bt;

        results.push({
            id: current.name,
            arrival: current.at,
            burst: current.bt,
            start: current.stime,
            finish: current.ctime,
            turnaround: current.tt,
            waiting: current.wt,
        });

        avgwt += current.wt;
        avgtt += current.tt;
    }

    // Gantt Chart Output
    priorityGanttChart = ganttChart;

    // Output Table Data
    return results;
}




// Updated runScheduler Function
function runScheduler() {
    const algorithm = document.getElementById("algorithmSelect").value;
    
    if (processes.length === 0) {
        alert("No processes available to schedule.");
        return;
    }

    // ดึงค่า Time Quantum สำหรับ RR
    const timeQuantumRR = processes[0]?.timeQuantum || 0;

    console.log("Algorithm Selected:", algorithm);
    console.log("Time Quantum for RR:", timeQuantumRR);

   
    let results = [];
    switch (algorithm) {
        case "fcfs":
            results = fcfs();
            break;
        case "rr":
            results = rr(processes, timeQuantumRR);  // ตรวจสอบการส่งค่า Time Quantum
            break;
        case "sjf":
            results = sjf();
            break;
        case "srtf":
            results = srtf();
            break;
        case "priority":
            results = priorityScheduling();
            break;
        case "hrrn": 
            results = hrrnScheduling();
            break;
            case "multilevel":
                // ดึง Time Quantum จาก process list
                const timeQuantum1 = processes[0]?.timeQuantum || 3; // ใช้ค่าจาก process หรือค่าเริ่มต้น 3
                const timeQuantum2 = timeQuantum1 * 2; // Time Quantum สำหรับ Queue 2
    
                // เรียกใช้ MLQ
                const multilevelResults = mqf(processes, timeQuantum1, timeQuantum2);
    
                // Update Gantt Chart
                priorityGanttChart = multilevelResults.ganttChartInfo;
    
                // Format the results for display
                results = multilevelResults.processes.map(proc => ({
                    id: proc.job,
                    arrival: proc.at,
                    burst: proc.bt,
                    finish: proc.ft,
                    turnaround: proc.tat,
                    waiting: proc.wt,
                }));
                break;
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
    let totalTurnaround = 0;
    let totalWaiting = 0;

    if (priorityGanttChart && priorityGanttChart.length > 0) {
        // ใส่โค้ดของคุณที่นี่ เพื่อสร้าง Gantt Chart
        priorityGanttChart.forEach((entry, index) => {
            const processName =  entry.job ? `P${entry.job}`: entry.id === 'Idle' ? 'Idle' : entry.id ? `P${entry.id}` : 'Unknown';
            console.log(`Gantt Chart Entry [${index}]:`, entry); // Debugging

            const duration = entry.endTime - entry.startTime;
            const isIdle = processName === 'Idle';

            const cssClass = isIdle ? 'gantt-process gap' : 'gantt-process';
            ganttChart += `<div class="${cssClass}" style="flex:${duration}">${processName}</div>`;
            ganttLabels += `<div style="flex:${duration}">${entry.startTime}</div>`;
        });

        // Add final time marker
        if (priorityGanttChart.length > 0) {
            ganttLabels += `<div>${priorityGanttChart[priorityGanttChart.length - 1].endTime}</div>`;
        }
    } else {
        // Existing code for other algorithms
        let currentTime = 0;
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
        });

        // Add final time marker
        ganttLabels += `<div>${currentTime}</div>`;
    }

    // Build the output table
    results.forEach(result => {
        const dynamicId = `P${result.id}`;
        tableRows += `
            <tr>
                <td>${dynamicId}</td>
                <td>${result.arrival}</td>
                <td>${result.burst}</td>
                <td>${result.finish}</td>
                <td>${result.turnaround}</td>
                <td>${result.waiting}</td>
            </tr>`;

        totalTurnaround += result.turnaround;
        totalWaiting += result.waiting;
    });

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
