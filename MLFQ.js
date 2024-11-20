const mqf = (processList, timeQuantum1 = 3, timeQuantum2 = 6) => {
    const processesInfo = processList.map((process, index) => ({
        job: `${index + 1}`,
        at: process.arrivalTime,
        bt: process.burstTime,
        rt: process.burstTime, // Remaining Time
        completed: false,
    })).sort((a, b) => a.at - b.at);

    const ganttChartInfo = [];
    const queue1 = [];
    const queue2 = [];
    const queue3 = [];
    let currentTime = processesInfo[0]?.at || 0;
    let solvedProcessesInfo = [];

    // Process Queue 1
    processesInfo.forEach((proc) => {
        if (proc.rt <= timeQuantum1) {
            ganttChartInfo.push({ job: proc.job, startTime: currentTime, endTime: currentTime + proc.rt });
            currentTime += proc.rt;
            proc.completed = true;
            proc.rt = 0;
            proc.ft = currentTime;
            proc.tat = proc.ft - proc.at;
            proc.wt = proc.tat - proc.bt;
            solvedProcessesInfo.push(proc);
        } else {
            queue2.push({ ...proc, rt: proc.rt - timeQuantum1 });
            ganttChartInfo.push({ job: proc.job, startTime: currentTime, endTime: currentTime + timeQuantum1 });
            currentTime += timeQuantum1;
        }
    });

    // Process Queue 2
    queue2.forEach((proc) => {
        if (proc.rt <= timeQuantum2) {
            ganttChartInfo.push({ job: proc.job, startTime: currentTime, endTime: currentTime + proc.rt });
            currentTime += proc.rt;
            proc.completed = true;
            proc.rt = 0;
            proc.ft = currentTime;
            proc.tat = proc.ft - proc.at;
            proc.wt = proc.tat - proc.bt;
            solvedProcessesInfo.push(proc);
        } else {
            queue3.push({ ...proc, rt: proc.rt - timeQuantum2 });
            ganttChartInfo.push({ job: proc.job, startTime: currentTime, endTime: currentTime + timeQuantum2 });
            currentTime += timeQuantum2;
        }
    });

    // Process Queue 3
    queue3.sort((a, b) => a.at - b.at).forEach((proc) => {
        ganttChartInfo.push({ job: proc.job, startTime: currentTime, endTime: currentTime + proc.rt });
        currentTime += proc.rt;
        proc.completed = true;
        proc.rt = 0;
        proc.ft = currentTime;
        proc.tat = proc.ft - proc.at;
        proc.wt = proc.tat - proc.bt;
        solvedProcessesInfo.push(proc);
    });

    const totalTurnaroundTime = solvedProcessesInfo.reduce((sum, proc) => sum + proc.tat, 0);
    const totalWaitingTime = solvedProcessesInfo.reduce((sum, proc) => sum + proc.wt, 0);

    return {
        processes: solvedProcessesInfo,
        ganttChartInfo,
        avgTurnaroundTime: totalTurnaroundTime / solvedProcessesInfo.length,
        avgWaitingTime: totalWaitingTime / solvedProcessesInfo.length,
    };
};
