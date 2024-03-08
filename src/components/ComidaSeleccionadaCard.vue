<template>
ssss
</template>

<script>
export default {
  props: {
    nombre: String,
    calories: Number,
    comidaId: String,
  },
  methods: {
    eliminarComida() {
      this.$emit('eliminar', this.comidaId);
    }
  }
};
</script>

<style scoped>
.card {
  margin-bottom: 20px; 
}
</style>
