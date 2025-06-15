import { mount } from '@vue/test-utils';
describe('TaskForm.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(require('@/components/TaskForm.vue').default, {
      props: {
        task: null,
        ...props
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders the form with empty fields when no task is provided', () => {
    expect(wrapper.find('input#title').exists()).toBe(true);
    expect(wrapper.find('textarea#description').exists()).toBe(true);
    expect(wrapper.find('select#status').exists()).toBe(true);
    expect(wrapper.find('select#priority').exists()).toBe(true);
    expect(wrapper.find('input#dueDate').exists()).toBe(true);
  });

  it('populates form fields when a task is provided', async () => {
    const task = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-03-20'
    };

    wrapper = createWrapper({ task });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('input#title').element.value).toBe(task.title);
    expect(wrapper.find('textarea#description').element.value).toBe(task.description);
    expect(wrapper.find('select#status').element.value).toBe(task.status);
    expect(wrapper.find('select#priority').element.value).toBe(task.priority);
    expect(wrapper.find('input#dueDate').element.value).toBe(task.dueDate);
  });

  it('emits save event with form data when submitted', async () => {
    const formData = {
      title: 'New Task',
      description: 'New Description',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-03-21'
    };

    await wrapper.find('input#title').setValue(formData.title);
    await wrapper.find('textarea#description').setValue(formData.description);
    await wrapper.find('select#status').setValue(formData.status);
    await wrapper.find('select#priority').setValue(formData.priority);
    await wrapper.find('input#dueDate').setValue(formData.dueDate);

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')[0][0]).toEqual(formData);
  });

  it('emits cancel event when cancel button is clicked', async () => {
    await wrapper.find('button[type="button"]').trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('validates required fields before submission', async () => {
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.emitted('save')).toBeFalsy();
  });

  it('handles empty due date correctly', async () => {
    const formData = {
      title: 'New Task',
      description: 'New Description',
      status: 'pending',
      priority: 'medium',
      dueDate: ''
    };

    await wrapper.find('input#title').setValue(formData.title);
    await wrapper.find('textarea#description').setValue(formData.description);
    await wrapper.find('select#status').setValue(formData.status);
    await wrapper.find('select#priority').setValue(formData.priority);
    await wrapper.find('input#dueDate').setValue(formData.dueDate);

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')[0][0].dueDate).toBeNull();
  });
}); 