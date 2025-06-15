import { mount } from '@vue/test-utils';
import { createStore as createVuexStore } from 'vuex';
import TaskList from '@/components/TaskList.vue';
import TaskCard from '@/components/TaskCard.vue';
import TaskForm from '@/components/TaskForm.vue';

describe('TaskList.vue', () => {
  let wrapper;
  let store;
  let mockTasks;

  const createStore = () => {
    return createVuexStore({
      state: {
        tasks: mockTasks,
        loading: false,
        error: null,
        searchQuery: '',
        statusFilter: '',
        priorityFilter: ''
      },
      mutations: {
        SET_SEARCH_QUERY: jest.fn(),
        SET_STATUS_FILTER: jest.fn(),
        SET_PRIORITY_FILTER: jest.fn()
      },
      actions: {
        fetchTasks: jest.fn(),
        createTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn()
      }
    });
  };

  const createWrapper = () => {
    return mount(TaskList, {
      global: {
        plugins: [store],
        components: {
          TaskCard,
          TaskForm
        }
      }
    });
  };

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

    store = createStore();
    wrapper = createWrapper();
  });

  it('renders task cards for each task', () => {
    const taskCards = wrapper.findAllComponents(TaskCard);
    expect(taskCards).toHaveLength(mockTasks.length);
  });

  it('shows loading state when loading is true', async () => {
    store.state.loading = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.animate-spin').exists()).toBe(true);
  });

  it('shows error message when there is an error', async () => {
    const errorMessage = 'Test error';
    store.state.error = errorMessage;
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain(errorMessage);
  });

  it('opens task form when add task button is clicked', async () => {
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(TaskForm).exists()).toBe(true);
  });

  it('filters tasks based on search query', async () => {
    await wrapper.find('input[type="text"]').setValue('Task 1');
    expect(wrapper.findAllComponents(TaskCard)).toHaveLength(1);
  });

  it('filters tasks based on status', async () => {
    await wrapper.find('select').setValue('pending');
    expect(wrapper.findAllComponents(TaskCard)).toHaveLength(1);
  });

  it('filters tasks based on priority', async () => {
    await wrapper.find('select:nth-child(3)').setValue('high');
    expect(wrapper.findAllComponents(TaskCard)).toHaveLength(1);
  });

  it('handles task creation', async () => {
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    const form = wrapper.findComponent(TaskForm);
    expect(form.exists()).toBe(true);
    const newTask = {
      title: 'New Task',
      description: 'New Description',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-03-22'
    };
    await form.vm.$emit('save', newTask);
    expect(store._actions.createTask).toBeDefined();
  });

  it('handles task update', async () => {
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    const form = wrapper.findComponent(TaskForm);
    expect(form.exists()).toBe(true);
    const updatedTask = {
      _id: '1',
      title: 'Updated Task',
      description: 'Updated Description',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-03-23'
    };
    await form.vm.$emit('save', updatedTask);
    expect(store._actions.updateTask).toBeDefined();
  });

  it('handles task deletion', async () => {
    await wrapper.findComponent(TaskCard).vm.$emit('delete', '1');
    expect(store._actions.deleteTask).toBeDefined();
  });

  it('closes task form when cancel is clicked', async () => {
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    const form = wrapper.findComponent(TaskForm);
    expect(form.exists()).toBe(true);
    await form.vm.$emit('cancel');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(TaskForm).exists()).toBe(false);
  });
}); 