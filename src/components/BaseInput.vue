<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <input
      :id="id"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      class="form-input"
      :class="{ 'error': error, 'disabled': disabled }"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    
    <div v-if="error" class="error-text">
      {{ error }}
    </div>
    
    <div v-if="helpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, computed } from 'vue';

interface Props {
  modelValue: string;
  type?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  helpText?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'blur'): void;
  (e: 'focus'): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
});

const emit = defineEmits<Emits>();

const id = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleBlur = () => {
  emit('blur');
};

const handleFocus = () => {
  emit('focus');
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #e53e3e;
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
}

.form-input.error:focus {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-input.disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.error-text {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.help-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
