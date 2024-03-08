<script>
import { ref, onMounted, nextTick } from 'vue';
import { getUserProfileById, editUserProfile } from '../service/user';
import { useAuth } from '../composition/useAuth'; 
import { useRouter, useRoute } from 'vue-router';

export default {
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { user } = useAuth(); 
    const loading = ref(true);
    const userData = ref({});
    const localRouter = useRouter();
    const route = useRoute();
    const userId = props.userId;

    const handleSubmit = async () => {
      try {
        console.log("UserID:", userId);
        console.log("UserData:", userData.value);
        
        if (userId && userData.value && userData.value.id) {
          await editUserProfile(userId, userData.value); // Envía los datos actualizados del usuario al servicio
          localRouter.push({ name: 'user-profile', params: { userId: userId } }); // Redirige a la vista del perfil
        } else {
          console.error("ID de usuario, datos de usuario o datos de autenticación indefinidos.");
        }
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    };

    const cancelEdit = () => {
  localRouter.push({ name: 'user-profile', params: { userId: userId } });
};


    onMounted(async () => {
      try {
        userData.value = await getUserProfileById(userId);
        console.log("Datos recibidos en UserProfileEdit:", userData.value);
        await nextTick();
      } catch (error) {
        console.error("Error al obtener el perfil de usuario:", error);
      } finally {
        loading.value = false;
      }
    }); 

    return {
      userData,
      loading,
      handleSubmit,
      cancelEdit
    };
  }
};
</script>






<template>
  <div class="text-center">
    <h1 class="mb-4 text-3xl">Editar Perfil</h1>
  </div>
  <div class="d-flex justify-content-center">
    <div class="card text-center" style="max-width: 700px; width: 80%;">
      <div class="card-body">
        <form v-if="!loading" @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="displayName" class="form-label">Nombre</label>
            <input id="displayName" type="text" class="form-control" v-model="userData.displayName" />
          </div>
          <div class="mb-3">
            <label for="height" class="form-label">Altura (cm)</label>
            <input id="height" type="number" class="form-control" v-model="userData.height" />
          </div>
          <div class="mb-3">
            <label for="weight" class="form-label">Peso (kg)</label>
            <input id="weight" type="number" class="form-control" v-model="userData.weight" />
          </div>
          <div class="mb-3">
            <label for="birthday" class="form-label">Fecha de nacimiento</label>
            <input id="birthday" type="date" class="form-control" v-model="userData.birthday" />
          </div>
          <div class="mb-3">
            <label for="gender" class="form-label">Género</label>
            <select id="gender" class="form-select" v-model="userData.gender">
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="goal" class="form-label">Meta</label>
            <select id="goal" class="form-select" v-model="userData.goal">
              <option value="Subir de Peso">Subir de Peso</option>
              <option value="Bajar de Peso">Bajar de Peso</option>
              <option value="Volumen">Volumen</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary m-1">
            Guardar cambios
          </button>
          <button type="button" @click="cancelEdit" class="btn btn-danger">
            Cancelar cambios
          </button>
        </form>
        <div v-else>
          <p>Cargando...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1{
  font-size: 40px;
  margin-top: 20px;
}
.text-center {
  text-align: center;
}

.card {
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2%;
  margin-bottom: 2%;
}

.card-body {
  padding: 20px;
}

.form-label {
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #00327c;
  margin-bottom: 10px;
}

.form-select {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #00327c;
  margin-bottom: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}
</style>
