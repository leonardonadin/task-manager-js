import { createStore } from 'vuex';
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

export default createStore({
  state: {
    tasks: [],
    loading: false,
    error: null,
    searchQuery: '',
    statusFilter: '',
    priorityFilter: '',
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
      const index = state.tasks.findIndex(task => task._id === updatedTask._id);
      if (index !== -1) {
        state.tasks.splice(index, 1, updatedTask);
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
    },
  },
  actions: {
    async fetchTasks({ commit }, { status, sortBy } = {}) {
      commit('SET_LOADING', true);
      try {
        const params = {};
        if (status) params.status = status;
        if (sortBy) params.sortBy = sortBy;

        const response = await axios.get(`${API_URL}/tasks`, { params });
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
        const response = await axios.post(`${API_URL}/tasks`, taskData);
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
        const response = await axios.put(`${API_URL}/tasks/${id}`, taskData);
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
        await axios.delete(`${API_URL}/tasks/${taskId}`);
        commit('DELETE_TASK', taskId);
        commit('SET_ERROR', null);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to delete task');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
  getters: {
    getTaskById: state => id => state.tasks.find(task => task._id === id),
    getTasksByStatus: state => status => state.tasks.filter(task => task.status === status),
  },
});
