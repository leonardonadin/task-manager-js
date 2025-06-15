<template>
  <div class="card bg-white dark:bg-gray-800">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ task.title }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ task.description }}</p>
      </div>
      <div class="flex space-x-2">
        <button
          class="btn btn-secondary"
          tabindex="0"
          aria-label="Edit task"
          @click="handleEdit"
          @keydown.enter="handleEdit"
        >
          Edit
        </button>
        <button
          class="btn btn-secondary"
          tabindex="0"
          aria-label="Delete task"
          @click="handleDelete"
          @keydown.enter="handleDelete"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <StatusBadge :status="task.status" />
      <PriorityBadge :priority="task.priority" />
      <span
        v-if="task.dueDate"
        class="text-sm text-gray-500 dark:text-gray-400"
        :aria-label="`Due date: ${formatDate(task.dueDate)}`"
      >
        Due: {{ formatDate(task.dueDate) }}
      </span>
    </div>

    <transition name="scale">
      <div v-if="showDeleteConfirm" class="mt-4 p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
        <p class="text-sm text-red-700 dark:text-red-200">
          Are you sure you want to delete this task?
        </p>
        <div class="mt-2 flex justify-end space-x-2">
          <button
            class="btn btn-secondary"
            tabindex="0"
            aria-label="Cancel delete"
            @click="showDeleteConfirm = false"
            @keydown.enter="showDeleteConfirm = false"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary bg-red-600 hover:bg-red-700"
            tabindex="0"
            aria-label="Confirm delete"
            @click="confirmDelete"
            @keydown.enter="confirmDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import { defineComponent, ref } from 'vue';
  import StatusBadge from './StatusBadge.vue';
  import PriorityBadge from './PriorityBadge.vue';

  export default defineComponent({
    name: 'TaskCard',
    components: {
      StatusBadge,
      PriorityBadge,
    },
    props: {
      task: {
        type: Object,
        required: true,
      },
    },
    emits: ['update', 'delete'],
    setup(props, { emit }) {
      const formatDate = date => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      };
      const showDeleteConfirm = ref(false);

      const handleEdit = () => {
        emit('update', props.task);
      };

      const handleDelete = () => {
        showDeleteConfirm.value = true;
      };

      const confirmDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
          emit('delete', props.task._id);
        }
        showDeleteConfirm.value = false;
      };

      return {
        formatDate,
        handleEdit,
        handleDelete,
        confirmDelete,
        showDeleteConfirm,
      };
    },
  });
</script>
