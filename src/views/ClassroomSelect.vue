<template>
  <div>
    <h2>Select a Classroom</h2>
    <input type="text" v-model="searchTerm" placeholder="Enter classroom" @input="filterClassrooms" />
    <ul>
      <li v-for="room in filteredClassrooms" :key="room.id" @click="selectClassroom(room)">
        {{ room.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchTerm: '',
      classrooms: [{ id: 1, name: 'Room 101' }, { id: 2, name: 'Room 102' }],
      filteredClassrooms: []
    };
  },
  methods: {
    filterClassrooms() {
      this.filteredClassrooms = this.classrooms.filter(room => room.name.includes(this.searchTerm));
    },
    selectClassroom(room) {
      this.$router.push({ path: '/route', query: { room: room.name } });
    }
  }
};
</script>