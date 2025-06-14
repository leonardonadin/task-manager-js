<template>
  <span
    class="px-2 py-1 text-xs font-medium rounded-full"
    :class="statusClasses"
    :aria-label="`Task status: ${status}`"
  >
    {{ status }}
  </span>
</template>

<script>
  import { computed } from 'vue';

  export default {
    name: 'StatusBadge',
    props: {
      status: {
        type: String,
        required: true,
        validator: value => ['pending', 'in-progress', 'completed'].includes(value),
      },
    },
    setup(props) {
      const statusClasses = computed(() => {
        const classes = {
          pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
          'in-progress': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
          completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        };
        return classes[props.status] || classes.pending;
      });

      return {
        statusClasses,
      };
    },
  };
</script>
