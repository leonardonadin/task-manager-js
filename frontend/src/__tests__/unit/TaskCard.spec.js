import { mount } from '@vue/test-utils';
import TaskCard from '@/components/TaskCard.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import PriorityBadge from '@/components/PriorityBadge.vue';

describe('TaskCard.vue', () => {
  let wrapper;
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-03-20'
  };

  const createWrapper = (props = {}) => {
    return mount(TaskCard, {
      props: {
        task: mockTask,
        ...props
      },
      global: {
        components: {
          StatusBadge,
          PriorityBadge
        }
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders task information correctly', () => {
    expect(wrapper.find('h3').text()).toBe(mockTask.title);
    expect(wrapper.find('p').text()).toBe(mockTask.description);
  });

  it('displays formatted due date when available', () => {
    const formattedDate = new Date(mockTask.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    expect(wrapper.text()).toContain(`Due: ${formattedDate}`);
  });

  it('does not display due date when not available', async () => {
    const taskWithoutDate = { ...mockTask, dueDate: null };
    wrapper = createWrapper({ task: taskWithoutDate });
    expect(wrapper.text()).not.toContain('Due:');
  });

  it('emits update event when edit button is clicked', async () => {
    await wrapper.find('button[aria-label="Edit task"]').trigger('click');
    expect(wrapper.emitted('update')).toBeTruthy();
    expect(wrapper.emitted('update')[0][0]).toEqual(mockTask);
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    await wrapper.find('button[aria-label="Delete task"]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.bg-red-50').exists()).toBe(true);
  });

  it('emits delete event when delete is confirmed', async () => {
    window.confirm = jest.fn(() => true);
    await wrapper.find('button[aria-label="Delete task"]').trigger('click');
    await wrapper.vm.$nextTick();
    const confirmBtn = wrapper.find('button[aria-label="Confirm delete"]');
    expect(confirmBtn.exists()).toBe(true);
    await confirmBtn.trigger('click');
    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')[0][0]).toBe(mockTask._id);
  });

  it('hides delete confirmation when cancel is clicked', async () => {
    await wrapper.find('button[aria-label="Delete task"]').trigger('click');
    await wrapper.vm.$nextTick();
    const cancelBtn = wrapper.find('button[aria-label="Cancel delete"]');
    expect(cancelBtn.exists()).toBe(true);
    await cancelBtn.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.bg-red-50').exists()).toBe(false);
  });

  it('renders StatusBadge and PriorityBadge components', () => {
    expect(wrapper.findComponent(StatusBadge).exists()).toBe(true);
    expect(wrapper.findComponent(PriorityBadge).exists()).toBe(true);
  });

  it('passes correct props to StatusBadge and PriorityBadge', () => {
    const statusBadge = wrapper.findComponent(StatusBadge);
    const priorityBadge = wrapper.findComponent(PriorityBadge);

    expect(statusBadge.props('status')).toBe(mockTask.status);
    expect(priorityBadge.props('priority')).toBe(mockTask.priority);
  });
}); 