<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Tasks</h1>
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        @click="showAddTaskModal = true"
      >
        <span class="mr-2">+</span> Add Task
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search tasks..."
        class="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <select
        v-model="statusFilter"
        class="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <select
        v-model="priorityFilter"
        class="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Task List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task._id"
        :task="task"
        @update="handleEditTask"
        @delete="deleteTask"
      />
    </div>

    <!-- Add/Edit Task Modal -->
    <TaskForm
      v-if="showAddTaskModal || editingTask"
      :task="editingTask"
      @save="handleSaveTask"
      @cancel="closeTaskModal"
    />
  </div>
</template>

<script>
  import { ref, computed, onMounted, toRaw } from 'vue';
  import { useStore } from 'vuex';
  import TaskCard from './TaskCard.vue';
  import TaskForm from './TaskForm.vue';

  export default {
    name: 'TaskList',
    components: {
      TaskCard,
      TaskForm,
    },
    setup() {
      const store = useStore();
      const showAddTaskModal = ref(false);
      const editingTask = ref(null);
      const searchQuery = ref('');
      const statusFilter = ref('');
      const priorityFilter = ref('');

      // Computed properties
      const tasks = computed(() => store.state.tasks);
      const loading = computed(() => store.state.loading);
      const error = computed(() => store.state.error);

      // Computed properties para os filtros com getters e setters
      const searchQueryComputed = computed({
        get: () => searchQuery.value,
        set: value => {
          searchQuery.value = value;
          store.commit('SET_SEARCH_QUERY', value);
        },
      });

      const statusFilterComputed = computed({
        get: () => statusFilter.value,
        set: value => {
          statusFilter.value = value;
          store.commit('SET_STATUS_FILTER', value);
        },
      });

      const priorityFilterComputed = computed({
        get: () => priorityFilter.value,
        set: value => {
          priorityFilter.value = value;
          store.commit('SET_PRIORITY_FILTER', value);
        },
      });

      const filteredTasks = computed(() => {
        const tasksArray = toRaw(tasks.value);
        if (!Array.isArray(tasksArray)) {
          console.warn('tasks.value is not an array:', tasksArray);
          return [];
        }
        return tasksArray.filter(task => {
          const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.value.toLowerCase());
          const matchesStatus = !statusFilter.value || task.status === statusFilter.value;
          const matchesPriority = !priorityFilter.value || task.priority === priorityFilter.value;
          return matchesSearch && matchesStatus && matchesPriority;
        });
      });

      // Methods
      const handleEditTask = task => {
        editingTask.value = { ...task };
        showAddTaskModal.value = true;
      };

      const handleSaveTask = async taskData => {
        try {
          if (editingTask.value) {
            await store.dispatch('updateTask', {
              id: editingTask.value._id,
              taskData: { ...taskData },
            });
          } else {
            await store.dispatch('createTask', taskData);
          }
          closeTaskModal();
        } catch (error) {
          console.error('Error saving task:', error);
        }
      };

      const closeTaskModal = () => {
        showAddTaskModal.value = false;
        editingTask.value = null;
      };

      const deleteTask = async taskId => {
        try {
          await store.dispatch('deleteTask', taskId);
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      };

      // Lifecycle hooks
      onMounted(() => {
        store.dispatch('fetchTasks');
      });

      // Return all the properties and methods that the template needs
      return {
        showAddTaskModal,
        editingTask,
        searchQuery: searchQueryComputed,
        statusFilter: statusFilterComputed,
        priorityFilter: priorityFilterComputed,
        tasks,
        loading,
        error,
        filteredTasks,
        handleEditTask,
        handleSaveTask,
        closeTaskModal,
        deleteTask,
      };
    },
  };
</script>
