import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@recicla.org', // Assuming standard admin or testing with a dummy
      senha: 'admin'
    });
    console.log('Success:', res.data);
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testLogin();
