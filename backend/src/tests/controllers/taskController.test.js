const request = require('supertest');
const mongoose = require('mongoose');
const Task = require('../../models/Task');
const { app } = require('../../index');

describe('Task Controller Tests', () => {
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  describe('GET /api/v1/tasks', () => {
    it('should get all tasks with default pagination', async () => {
      // Create test tasks
      const tasks = await Task.create([
        { title: 'Task 1', priority: 'high' },
        { title: 'Task 2', priority: 'medium' },
        { title: 'Task 3', priority: 'low' },
      ]);

      const response = await request(app)
        .get('/api/v1/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta.total).toBe(3);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
    });

    it('should filter tasks by status', async () => {
      await Task.create([
        { title: 'Task 1', status: 'pending' },
        { title: 'Task 2', status: 'completed' },
        { title: 'Task 3', status: 'pending' },
      ]);

      const response = await request(app)
        .get('/api/v1/tasks?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('should filter tasks by priority', async () => {
      await Task.create([
        { title: 'Task 1', priority: 'high' },
        { title: 'Task 2', priority: 'medium' },
        { title: 'Task 3', priority: 'high' },
      ]);

      const response = await request(app)
        .get('/api/v1/tasks?priority=high')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('should search tasks by text', async () => {
      await Task.create([
        { title: 'Important Task', description: 'Urgent' },
        { title: 'Regular Task', description: 'Normal' },
        { title: 'Critical Task', description: 'Very Urgent' },
      ]);

      const response = await request(app)
        .get('/api/v1/tasks?search=Urgent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should sort tasks by creation date', async () => {
      const tasks = await Task.create([
        { title: 'Task 1' },
        { title: 'Task 2' },
        { title: 'Task 3' },
      ]);

      const response = await request(app)
        .get('/api/v1/tasks?sort=createdAt&order=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const dates = response.body.data.map(t => new Date(t.createdAt));
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
      }
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should get a single task by id', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
      });

      const response = await request(app)
        .get(`/api/v1/tasks/${task._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(task._id.toString());
      expect(response.body.data.title).toBe(task.title);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/tasks/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        status: 'pending',
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.status).toBe(taskData.status);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate enum values', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Test Task',
          priority: 'invalid',
          status: 'invalid',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update a task', async () => {
      const task = await Task.create({
        title: 'Original Task',
        description: 'Original Description',
      });

      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      const response = await request(app)
        .put(`/api/v1/tasks/${task._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/v1/tasks/${fakeId}`)
        .send({ title: 'Updated Task' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should validate update data', async () => {
      const task = await Task.create({
        title: 'Original Task',
      });

      const response = await request(app)
        .put(`/api/v1/tasks/${task._id}`)
        .send({ priority: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Task to Delete',
      });

      const response = await request(app)
        .delete(`/api/v1/tasks/${task._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/tasks/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
}); 