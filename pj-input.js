let processIdCounter = 1;
let roundRobinTimeQuantum = null;
let timeQuantum = null; 

function handleAlgorithmChange() {
    const algorithm = document.getElementById("algorithmSelect").value;
    const quantumInput = document.getElementById("quantumInput");
    const priorityInput = document.getElementById("priorityInput");
    const priorityColumnHeader = document.getElementById("priorityColumnHeader");
    const tqColumnHeader = document.getElementById("tqColumnHeader");
    const processListTable = document.getElementById("processListTable");

    priorityInput.style.display = algorithm === "priority" ? "block" : "none";
    quantumInput.style.display = algorithm === "rr" ? "block" : "none";

    priorityColumnHeader.style.display = algorithm === "priority" ? "table-cell" : "none";
    tqColumnHeader.style.display = algorithm === "rr" ? "table-cell" : "none";

    for (let i = 1; i < processListTable.rows.length; i++) {
        processListTable.rows[i].cells[3].style.display = algorithm === "priority" ? "table-cell" : "none"; // Priority cell
        processListTable.rows[i].cells[4].style.display = algorithm === "rr" ? "table-cell" : "none"; // T.Q. cell
    }
}



function updateTimeQuantum() {
    timeQuantumValue = document.getElementById("timeQuantum").value; 
}


function addProcess() {
    const arrivalTime = document.getElementById("arrivalTime").value;
    const burstTime = document.getElementById("burstTime").value;
    const priority = document.getElementById("priorityInput").style.display === "block" ? document.getElementById("priority").value : null;
    const timeQuantumValue = document.getElementById("timeQuantum").value;
    if (arrivalTime && burstTime) {
        if (burstTime <= 0) {
            alert("Burst Time must be greater than zero.");
            return;
        }

        addProcessToTable(processIdCounter++, arrivalTime, burstTime, priority, timeQuantumValue);
        document.getElementById("arrivalTime").value = '';
        document.getElementById("burstTime").value = '';
        if (priority !== null) {
            document.getElementById("priority").value = '';
        }
    }
}

function generateProcesses() {
    const algorithm = document.getElementById("algorithmSelect").value;

    if (algorithm === "rr" && timeQuantum === null) {
        timeQuantum = Math.floor(Math.random() * 10) + 1; 
        document.getElementById("timeQuantum").value = timeQuantum; 
    }

    const arrivalTime = Math.floor(Math.random() * 10);
    const burstTime = Math.floor(Math.random() * 10) + 1;
    const priority = document.getElementById("priorityInput").style.display === "block" ? Math.floor(Math.random() * 10) + 1 : null;
    const timeQuantumValue = document.getElementById("timeQuantum").value; 

    addProcessToTable(processIdCounter++, arrivalTime, burstTime, priority, timeQuantumValue);
}


function addProcessToTable(id, arrivalTime, burstTime, priority, timeQuantumValue) {
    const processListTable = document.getElementById("processListTable").getElementsByTagName("tbody")[0];
    const row = processListTable.insertRow();

    row.insertCell(0).innerText = id;
    row.insertCell(1).innerText = arrivalTime;
    row.insertCell(2).innerText = burstTime;

    const priorityCell = row.insertCell(3);
    priorityCell.innerText = priority !== null ? priority : "-";
    priorityCell.style.display = document.getElementById("priorityInput").style.display === "block" ? "table-cell" : "none";

    const tqCell = row.insertCell(4);
    tqCell.innerText = timeQuantumValue !== null ? timeQuantumValue : "-"; 
    tqCell.style.display = document.getElementById("quantumInput").style.display === "block" ? "table-cell" : "none";

    const deleteCell = row.insertCell(5);
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = () => deleteProcess(row);
    deleteCell.appendChild(deleteButton);
}



function deleteProcess(row) {
    row.parentNode.removeChild(row);
}


function runScheduler() {
const algorithm = document.getElementById("algorithmSelect").value;

if (!algorithm) {
    alert("Please select a scheduling algorithm.");
    return;
}

document.getElementById("ganttChart").innerText = "";
document.getElementById("outputDetails").innerText = "";

}
