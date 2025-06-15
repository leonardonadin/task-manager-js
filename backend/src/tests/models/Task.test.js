const Task = require('../../models/Task');

describe('Task Model Test', () => {
  it('should create & save task successfully', async () => {
    const validTask = new Task({
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high',
      status: 'pending',
    });
    const savedTask = await validTask.save();
    
    expect(savedTask._id).toBeDefined();
    expect(savedTask.title).toBe(validTask.title);
    expect(savedTask.description).toBe(validTask.description);
    expect(savedTask.priority).toBe(validTask.priority);
    expect(savedTask.status).toBe(validTask.status);
    expect(savedTask.createdAt).toBeDefined();
    expect(savedTask.updatedAt).toBeDefined();
  });

  it('should fail to save task without required fields', async () => {
    const taskWithoutTitle = new Task({ description: 'Test Description' });
    let err;
    
    try {
      await taskWithoutTitle.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.title).toBeDefined();
  });

  it('should fail to save task with invalid priority', async () => {
    const taskWithInvalidPriority = new Task({
      title: 'Test Task',
      priority: 'invalid',
    });
    let err;
    
    try {
      await taskWithInvalidPriority.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.priority).toBeDefined();
  });

  it('should fail to save task with invalid status', async () => {
    const taskWithInvalidStatus = new Task({
      title: 'Test Task',
      status: 'invalid',
    });
    let err;
    
    try {
      await taskWithInvalidStatus.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.status).toBeDefined();
  });

  it('should fail to save task with past due date', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const taskWithPastDueDate = new Task({
      title: 'Test Task',
      dueDate: pastDate,
    });
    let err;
    
    try {
      await taskWithPastDueDate.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.dueDate).toBeDefined();
  });

  it('should calculate isOverdue correctly', () => {
    // Test with past date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const overdueTask = new Task({
      title: 'Overdue Task',
      dueDate: pastDate,
    });
    
    // Test with future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    const futureTask = new Task({
      title: 'Future Task',
      dueDate: futureDate,
    });
    
    // Test with completed status
    const completedTask = new Task({
      title: 'Completed Task',
      dueDate: pastDate,
      status: 'completed',
    });
    
    // Test with no due date
    const noDueDateTask = new Task({
      title: 'No Due Date Task',
    });
    
    // Test the virtual property directly
    expect(overdueTask.isOverdue).toBe(true);
    expect(futureTask.isOverdue).toBe(false);
    expect(completedTask.isOverdue).toBe(false);
    expect(noDueDateTask.isOverdue).toBe(false);
  });

  it('should enforce title length limit', async () => {
    const longTitle = 'a'.repeat(101);
    const taskWithLongTitle = new Task({
      title: longTitle,
    });
    let err;
    
    try {
      await taskWithLongTitle.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.title).toBeDefined();
  });

  it('should enforce description length limit', async () => {
    const longDescription = 'a'.repeat(1001);
    const taskWithLongDescription = new Task({
      title: 'Test Task',
      description: longDescription,
    });
    let err;
    
    try {
      await taskWithLongDescription.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.description).toBeDefined();
  });
}); 