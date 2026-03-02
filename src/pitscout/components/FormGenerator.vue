<template>
  <div v-if="template && modelValue" >
    <div v-for="field in template.fields" :key="field.name" class="form-group">
      <label :for="field.name">{{ field.label }}</label>

      <input
        v-if="field.type === 'text'"
        :type="field.type"
        :id="field.name"
        :value="modelValue[field.name]"
        @input="updateValue(field.name, $event.target.value)"
        :required="field.required"
        :placeholder="field.placeholder || ''"
      />

       <input
        v-else-if="field.type === 'number'"
        :type="field.type"
        :id="field.name"
        :max="999"
        :value="modelValue[field.name]"
        @input="updateValue(field.name, $event.target.value)"
        :required="field.required"
        :placeholder="field.placeholder || ''"
      />

      <textarea
        v-else-if="field.type === 'textarea'"
        :id="field.name"
        :value="modelValue[field.name]"
        @input="updateValue(field.name, $event.target.value)"
        :required="field.required"
        :placeholder="field.placeholder || ''"
        rows="4"
      ></textarea>

      <select
        v-else-if="field.type === 'select'"
        :id="field.name"
        :value="modelValue[field.name]"
        @change="updateValue(field.name, $event.target.value)"
        :required="field.required"
      >
        <option disabled :value="null">Please select one</option>
        <option v-for="option in field.options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  template: { type: Object, required: true },
  modelValue: { type: Object, required: true },
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (fieldName, value) => {
  emit('update:modelValue', { ...props.modelValue, [fieldName]: value });
};
</script>
