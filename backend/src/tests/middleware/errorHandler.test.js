const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../index');

// Adiciona rota de erro antes dos testes
app.get('/error-test', () => {
  throw new Error('Test error');
});

describe('Error Handler Middleware Tests', () => {
  it('should handle 404 errors', async () => {
    const response = await request(app)
      .get('/non-existent-route')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('message');
  });

  it('should handle mongoose validation errors', async () => {
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({}) // Missing required title field
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('name', 'ValidationError');
  });

  it('should handle mongoose cast errors', async () => {
    const response = await request(app)
      .get('/api/v1/tasks/invalid-id')
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('name', 'CastError');
  });

  it('should handle duplicate key errors', async () => {
    // First create a task
    await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Duplicate Task' })
      .expect(201);

    // Try to create another task with the same title
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Duplicate Task' })
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('name', 'MongoServerError');
  });

  it('should handle custom AppError', async () => {
    const response = await request(app)
      .get('/api/v1/tasks/000000000000000000000000')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.message).toBe('Task not found');
  });
}); 