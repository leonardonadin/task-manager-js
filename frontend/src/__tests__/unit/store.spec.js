import { createStore } from 'vuex';
import axios from 'axios';
jest.mock('axios');

describe('Store', () => {
  let store;
  let mockTasks;

  beforeEach(() => {
    mockTasks = [
      {
        _id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        priority: 'high',
        dueDate: '2024-03-20'
      },
      {
        _id: '2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'completed',
        priority: 'low',
        dueDate: '2024-03-21'
      }
    ];

    store = createStore({
      state: {
        tasks: [],
        loading: false,
        error: null,
        searchQuery: '',
        statusFilter: '',
        priorityFilter: ''
      },
      mutations: {
        SET_TASKS(state, tasks) {
          state.tasks = Array.isArray(tasks) ? tasks : [];
        },
        ADD_TASK(state, task) {
          if (!Array.isArray(state.tasks)) {
            state.tasks = [];
          }
          state.tasks = [...state.tasks, task];
        },
        UPDATE_TASK(state, updatedTask) {
          if (!updatedTask || !updatedTask._id) {
            console.error('Invalid task update:', updatedTask);
            return;
          }
          const index = state.tasks.findIndex(task => task._id === updatedTask._id);
          if (index !== -1) {
            state.tasks = [
              ...state.tasks.slice(0, index),
              updatedTask,
              ...state.tasks.slice(index + 1)
            ];
          }
        },
        DELETE_TASK(state, taskId) {
          state.tasks = state.tasks.filter(task => task._id !== taskId);
        },
        SET_LOADING(state, loading) {
          state.loading = loading;
        },
        SET_ERROR(state, error) {
          state.error = error;
        },
        SET_SEARCH_QUERY(state, query) {
          state.searchQuery = query;
        },
        SET_STATUS_FILTER(state, status) {
          state.statusFilter = status;
        },
        SET_PRIORITY_FILTER(state, priority) {
          state.priorityFilter = priority;
        }
      },
      actions: {
        async fetchTasks({ commit }, { status, sortBy } = {}) {
          commit('SET_LOADING', true);
          try {
            const params = {};
            if (status) params.status = status;
            if (sortBy) params.sortBy = sortBy;

            const response = await axios.get('/api/v1/tasks', { params });
            commit('SET_TASKS', response.data.data);
            commit('SET_ERROR', null);
          } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch tasks');
            commit('SET_TASKS', []);
          } finally {
            commit('SET_LOADING', false);
          }
        },
        async createTask({ commit }, taskData) {
          commit('SET_LOADING', true);
          try {
            const response = await axios.post('/api/v1/tasks', taskData);
            if (response.data && response.data.data) {
              commit('ADD_TASK', response.data.data);
              commit('SET_ERROR', null);
              return response.data.data;
            } else {
              throw new Error('Invalid response format');
            }
          } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || 'Failed to create task');
            throw error;
          } finally {
            commit('SET_LOADING', false);
          }
        },
        async updateTask({ commit }, { id, taskData }) {
          commit('SET_LOADING', true);
          try {
            const response = await axios.put(`/api/v1/tasks/${id}`, taskData);
            commit('UPDATE_TASK', response.data.data);
            commit('SET_ERROR', null);
            return response.data.data;
          } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || 'Failed to update task');
            throw error;
          } finally {
            commit('SET_LOADING', false);
          }
        },
        async deleteTask({ commit }, taskId) {
          commit('SET_LOADING', true);
          try {
            await axios.delete(`/api/v1/tasks/${taskId}`);
            commit('DELETE_TASK', taskId);
            commit('SET_ERROR', null);
          } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || 'Failed to delete task');
            throw error;
          } finally {
            commit('SET_LOADING', false);
          }
        }
      },
      getters: {
        getTaskById: state => id => state.tasks.find(task => task._id === id),
        getTasksByStatus: state => status => state.tasks.filter(task => task.status === status)
      }
    });
  });

  describe('Mutations', () => {
    it('SET_TASKS sets tasks array', () => {
      store.commit('SET_TASKS', mockTasks);
      expect(store.state.tasks).toEqual(mockTasks);
    });

    it('ADD_TASK adds a new task', () => {
      const newTask = {
        _id: '3',
        title: 'Task 3',
        description: 'Description 3',
        status: 'pending',
        priority: 'medium',
        dueDate: '2024-03-22'
      };
      store.commit('ADD_TASK', newTask);
      expect(store.state.tasks).toContainEqual(newTask);
    });

    it('UPDATE_TASK updates an existing task', () => {
      store.commit('SET_TASKS', mockTasks);
      const updatedTask = { ...mockTasks[0], title: 'Updated Task' };
      store.commit('UPDATE_TASK', updatedTask);
      expect(store.state.tasks[0]).toEqual(updatedTask);
    });

    it('DELETE_TASK removes a task', () => {
      store.commit('SET_TASKS', mockTasks);
      store.commit('DELETE_TASK', '1');
      expect(store.state.tasks).not.toContainEqual(mockTasks[0]);
    });

    it('SET_LOADING updates loading state', () => {
      store.commit('SET_LOADING', true);
      expect(store.state.loading).toBe(true);
    });

    it('SET_ERROR updates error state', () => {
      const error = 'Test error';
      store.commit('SET_ERROR', error);
      expect(store.state.error).toBe(error);
    });
  });

  describe('Actions', () => {
    it('fetchTasks commits tasks on success', async () => {
      const response = { data: { data: mockTasks } };
      axios.get.mockResolvedValue(response);

      await store.dispatch('fetchTasks');
      expect(store.state.tasks).toEqual(mockTasks);
      expect(store.state.error).toBeNull();
    });

    it('fetchTasks handles error', async () => {
      const error = new Error('Network error');
      axios.get.mockRejectedValue(error);

      await store.dispatch('fetchTasks');
      expect(store.state.tasks).toEqual([]);
      expect(store.state.error).toBe('Failed to fetch tasks');
    });

    it('createTask commits new task on success', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'medium',
        dueDate: '2024-03-22'
      };
      const response = { data: { data: { ...newTask, _id: '3' } } };
      axios.post.mockResolvedValue(response);

      await store.dispatch('createTask', newTask);
      expect(store.state.tasks).toContainEqual(response.data.data);
    });

    it('updateTask commits updated task on success', async () => {
      store.commit('SET_TASKS', mockTasks);
      const updatedTask = { ...mockTasks[0], title: 'Updated Task' };
      const response = { data: { data: updatedTask } };
      axios.put.mockResolvedValue(response);

      await store.dispatch('updateTask', { id: '1', taskData: updatedTask });
      expect(store.state.tasks[0]).toEqual(updatedTask);
    });

    it('deleteTask removes task on success', async () => {
      store.commit('SET_TASKS', mockTasks);
      axios.delete.mockResolvedValue({});

      await store.dispatch('deleteTask', '1');
      expect(store.state.tasks).not.toContainEqual(mockTasks[0]);
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      store.commit('SET_TASKS', mockTasks);
    });

    it('getTaskById returns correct task', () => {
      const task = store.getters.getTaskById('1');
      expect(task).toEqual(mockTasks[0]);
    });

    it('getTasksByStatus returns filtered tasks', () => {
      const tasks = store.getters.getTasksByStatus('pending');
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual(mockTasks[0]);
    });
  });
}); 