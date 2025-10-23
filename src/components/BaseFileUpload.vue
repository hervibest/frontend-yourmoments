<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="file-upload-container">
      <input
        :id="id"
        ref="fileInput"
        type="file"
        :name="name"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        :required="required"
        class="file-input"
        @change="handleFileChange"
      />
      
      <div 
        class="file-upload-area"
        :class="{ 
          'drag-over': isDragOver, 
          'has-files': hasFiles,
          'error': error,
          'disabled': disabled 
        }"
        @click="triggerFileInput"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div v-if="!hasFiles" class="upload-placeholder">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="upload-text">
            {{ dragText || 'Click to upload or drag and drop' }}
          </p>
          <p v-if="accept" class="upload-hint">
            {{ acceptText || `Accepted formats: ${accept}` }}
          </p>
        </div>
        
        <div v-else class="file-preview">
          <div v-if="multiple && files.length > 1" class="multiple-files">
            <p class="file-count">{{ files.length }} files selected</p>
            <div class="file-list">
              <div v-for="(file, index) in files" :key="index" class="file-item">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">({{ formatFileSize(file.size) }})</span>
                <button 
                  type="button" 
                  class="remove-file"
                  @click.stop="removeFile(index)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <div v-else class="single-file">
            <div class="file-info">
              <span class="file-name">{{ files[0].name }}</span>
              <span class="file-size">({{ formatFileSize(files[0].size) }})</span>
            </div>
            <button 
              type="button" 
              class="remove-file"
              @click.stop="clearFiles"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-text">
      {{ error }}
    </div>
    
    <div v-if="helpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, defineProps } from 'vue';

interface Props {
  modelValue: File | File[] | null;
  name?: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  helpText?: string;
  dragText?: string;
  acceptText?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

interface Emits {
  (e: 'update:modelValue', value: File | File[] | null): void;
  (e: 'change', files: File | File[] | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  required: false,
  disabled: false,
  maxSize: 5 * 1024 * 1024, // 5MB default
  maxFiles: 10,
});

const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();
const isDragOver = ref(false);

const id = computed(() => `file-upload-${Math.random().toString(36).substr(2, 9)}`);

const files = computed(() => {
  if (!props.modelValue) return [];
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
});

const hasFiles = computed(() => files.value.length > 0);

const triggerFileInput = () => {
  if (props.disabled) return;
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const selectedFiles = target.files;
  
  if (selectedFiles && selectedFiles.length > 0) {
    processFiles(Array.from(selectedFiles));
  }
};

const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragOver.value = false;
  
  const droppedFiles = event.dataTransfer?.files;
  if (droppedFiles && droppedFiles.length > 0) {
    processFiles(Array.from(droppedFiles));
  }
};

const processFiles = (newFiles: File[]) => {
  // Validate file count
  if (props.multiple && newFiles.length > props.maxFiles) {
    emit('update:modelValue', null);
    emit('change', null);
    return;
  }
  
  // Validate file size
  const oversizedFiles = newFiles.filter(file => file.size > props.maxSize);
  if (oversizedFiles.length > 0) {
    emit('update:modelValue', null);
    emit('change', null);
    return;
  }
  
  // Update model value
  const result = props.multiple ? newFiles : newFiles[0];
  emit('update:modelValue', result);
  emit('change', result);
};

const removeFile = (index: number) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const newFiles = [...props.modelValue];
    newFiles.splice(index, 1);
    emit('update:modelValue', newFiles.length > 0 ? newFiles : null);
    emit('change', newFiles.length > 0 ? newFiles : null);
  }
};

const clearFiles = () => {
  emit('update:modelValue', null);
  emit('change', null);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

.file-upload-container {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fafafa;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-area:hover:not(.disabled) {
  border-color: #3b82f6;
  background-color: #f8faff;
}

.file-upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.file-upload-area.has-files {
  border-color: #10b981;
  background-color: #f0fdf4;
  padding: 1rem;
}

.file-upload-area.error {
  border-color: #e53e3e;
  background-color: #fef2f2;
}

.file-upload-area.disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  width: 2rem;
  height: 2rem;
  color: #6b7280;
}

.upload-text {
  font-size: 1rem;
  color: #374151;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.file-preview {
  width: 100%;
}

.multiple-files {
  text-align: left;
}

.file-count {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.single-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #374151;
  word-break: break-all;
}

.file-size {
  color: #6b7280;
  font-size: 0.875rem;
}

.remove-file {
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: bold;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-file:hover {
  background-color: #fee;
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
