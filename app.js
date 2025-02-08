const speedTest = require('speedtest-net');
const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, 'network_speed_log.csv');

// Write CSV header if file does not exist
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'Timestamp,Download_Mbps,Upload_Mbps,Ping_ms,Server_ID\n', 'utf8');
}

async function runTest() {
  try {
    const startTimestamp = new Date().toISOString();
    process.stdout.write(`${startTimestamp} - Starting speed test... `);

    // Run the test. Make sure to accept the license and GDPR.
    const result = await speedTest({
      acceptLicense: true,
      acceptGdpr: true,
      // serverId: 30009 // Uncomment if you desire to constantly use the same server
    });

    // Convert the bandwidth from bytes per second to Mbps.
    const downloadMbps = ((result.download.bandwidth * 8) / 1e6).toFixed(2);
    const uploadMbps = ((result.upload.bandwidth * 8) / 1e6).toFixed(2);
    const pingMs = result.ping.latency.toFixed(2);
    const timestamp = new Date().toISOString();

    // Access the server details.
    const serverInfo = result.server; // id, name, location, country, host, port, ip
    // console.log("ServerInfo: ", serverInfo);

    const csvLine = `${timestamp},${downloadMbps},${uploadMbps},${pingMs},${serverInfo.id}\n`;

    fs.appendFileSync(CSV_FILE, csvLine, 'utf8');
    console.log(`Logged: ${csvLine.trim()}`);
  } catch (error) {
    console.error('Error during speed test:', error);
  }
}

async function mainLoop() {
  while (true) {
    await runTest();

    // Wait for X milliseconds before running the test again. Adjust the delay as needed.
    // SpeedTest's API seems to support a maximum of 30 requests per hour; Using a delay lower than 2 minutes will probably cause issues.
    await new Promise(resolve => setTimeout(resolve, 300000));
  }
}

mainLoop();
