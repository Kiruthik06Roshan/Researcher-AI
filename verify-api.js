import http from 'http';

const data = JSON.stringify({
    interest: 'Technology',
    type: 'Data',
    level: 'Beginner'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/beginner',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log("Testing /api/beginner endpoint...");

const req = http.request(options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("SUCCESS! Received data:");
            try {
                console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
            } catch (e) {
                console.log(responseBody);
            }
        } else {
            console.error("FAILED with status:", res.statusCode);
            console.error("Error details:", responseBody);
        }
    });
});

req.on('error', (e) => {
    console.error("ERROR during request:", e.message);
    console.log("Tip: Make sure the server is running on http://localhost:3001");
});

req.write(data);
req.end();
