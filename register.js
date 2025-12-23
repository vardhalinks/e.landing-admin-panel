import http from 'http';

const registerAdmin = () => {
  const data = JSON.stringify({
    email: 'admin@admin.com',
    password: 'Admin@123'
  });

  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', chunk => responseBody += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseBody);
        if (res.statusCode === 201) {
          console.log('✓ Admin registered successfully!');
          console.log('Email:', parsed.email);
          console.log('ID:', parsed._id);
        } else if (res.statusCode === 400) {
          console.log('✓ Admin already exists:', parsed.message);
        }
      } catch (e) {
        console.log('Response:', responseBody);
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });

  req.write(data);
  req.end();
};

registerAdmin();
