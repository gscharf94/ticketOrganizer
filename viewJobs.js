const { pool } = require("./db");
const fs = require('fs');
const readline = require('readline');

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getJobs() {
  const resp = pool.query('SELECT * FROM job', (err, res) => {
    if (err) {
      console.log('error pulling jobs');
    }
    let jobs = res.rows;
    const resp = pool.query('SELECT * FROM client', (err, res) => {
      if (err) {
        console.log('error pulling clients');
      }

      let clients = res.rows;

      entryScreen(jobs, clients)
    })
  });
}

function standardizeString(str, len) {
  let output = "";
  for (let i = 0; i < len; i++) {
    if (i < str.length) {
      output += str[i];
    } else {
      output += " ";
    }
  }
  return output;
}

async function getTickets(jobId) {
  const resp = pool.query(`SELECT * FROM ticket WHERE job_id=${jobId}`, (err, res) => {
    if (err) {
      console.log(`error pulling ticket jobId: ${jobId}`);
    }

    let tickets = res.rows;
    console.log(tickets);
  })
}


async function entryScreen(jobList, clientList) {
  console.clear();

  let clientDictionary = {};
  for (const client of clientList) {
    clientDictionary[client.id] = client.client_name;
  }
  for (const job of jobList) {
    job.client_name = clientDictionary[job.client_id];
  }
  // console.log(jobList);
  const arbritaryLength = 9;
  outputText = "";
  outputText += `${standardizeString("ID", arbritaryLength)}|`;
  outputText += `${standardizeString("NAME", arbritaryLength)}|`;
  outputText += `${standardizeString("CITY", arbritaryLength)}|`;
  outputText += `${standardizeString("CLIENT", arbritaryLength)}|\n`;

  outputText += "-".repeat((arbritaryLength * 4) + 4) + "\n";


  for (const job of jobList) {
    let row = "";
    row += `${standardizeString("  " + String(job.id), arbritaryLength)}|`;
    row += `${standardizeString(job.job_name, arbritaryLength)}|`;
    row += `${standardizeString(job.client_name, arbritaryLength)}|`;
    row += `${standardizeString(job.city, arbritaryLength)}|\n`;
    outputText += row;
  }

  console.log(outputText);
  rl.setPrompt("Select a job id ... ");
  rl.prompt();

  rl.on('line', (jobId) => {
    console.log(`grabbing jobId: ${jobId}`);
    getTickets(jobId);
  });
}



getJobs();