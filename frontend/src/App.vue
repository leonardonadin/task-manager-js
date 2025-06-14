<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <header class="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
        <div class="flex items-center space-x-4">
          <DarkModeToggle />
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <TaskList />
      </div>
    </main>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';
  import TaskList from './components/TaskList.vue';
  import DarkModeToggle from './components/DarkModeToggle.vue';

  export default defineComponent({
    name: 'App',
    components: {
      TaskList,
      DarkModeToggle,
    },
  });
</script>
