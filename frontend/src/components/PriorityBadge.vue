<template>
  <span
    class="px-2 py-1 text-xs font-medium rounded-full"
    :class="priorityClasses"
    :aria-label="`Task priority: ${priority}`"
  >
    {{ priority }}
  </span>
</template>

<script>
  import { computed } from 'vue';

  export default {
    name: 'PriorityBadge',
    props: {
      priority: {
        type: String,
        required: true,
        validator: value => ['low', 'medium', 'high'].includes(value),
      },
    },
    setup(props) {
      const priorityClasses = computed(() => {
        const classes = {
          low: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
          medium: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
          high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        };
        return classes[props.priority] || classes.medium;
      });

      return {
        priorityClasses,
      };
    },
  };
</script>
