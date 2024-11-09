let processIdCounter = 1;

function handleAlgorithmChange() {
    const algorithm = document.getElementById("algorithmSelect").value;
    document.getElementById("quantumInput").style.display = algorithm === "rr" ? "block" : "none";
    document.getElementById("priorityInput").style.display = algorithm === "priority" ? "block" : "none";
}

function addProcess() {
    const arrivalTime = document.getElementById("arrivalTime").value;
    const burstTime = document.getElementById("burstTime").value;
    const priority = document.getElementById("priorityInput").style.display === "block" ? document.getElementById("priority").value : null;

    if (arrivalTime && burstTime) {
        if (burstTime <= 0) {
        alert("Burst Time must be greater than zero.");
        return;
    }

        addProcessToTable(processIdCounter++, arrivalTime, burstTime, priority);

        document.getElementById("arrivalTime").value = '';
        document.getElementById("burstTime").value = '';
        if (priority !== null) {
        document.getElementById("priority").value = '';
        }
    }
}

function generateProcesses() {
    addProcessToTable(processIdCounter++, Math.floor(Math.random() * 10), Math.floor(Math.random() * 10) + 1, null);
}

function addProcessToTable(id, arrivalTime, burstTime, priority) {
    const processListTable = document.getElementById("processListTable");
    const row = processListTable.insertRow();

    row.insertCell(0).innerText = id;
    row.insertCell(1).innerText = arrivalTime;
    row.insertCell(2).innerText = burstTime;

    if (priority !== null) {
        row.insertCell(3).innerText = priority;
    }
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