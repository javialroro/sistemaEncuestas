// app.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Función para generar un token JWT válido para pruebas
function generateAuthToken(username) {
  return jwt.sign({ username }, 'secreto');
}

describe('GET /', () => {
  it('Deberia retornar "ola Kennors"', async () => {
    const response = await request('http://localhost:3000').get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('ola Kennors');
  });
});




