<template>
  <div class="settings">
    <button @click="schedule">Match Schedule</button>
    <button @click="changeUser">User</button>
  </div>
</template>

<script setup>

const changeUser = () => {

};

const schedule = async () => {
 

};
</script>

<style scoped>
.settings {
  padding: 20px;
}
.setting-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input {
  padding: 8px;
  width: 100%;
  max-width: 300px;
}
button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #3aa876;
}
</style>
