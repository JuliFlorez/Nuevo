<script>
import { ref, onMounted, nextTick, inject } from 'vue';
import { useAuth } from '../composition/useAuth';
import { getUserProfileById } from '../service/user';
import UserProfileEdit from '../pages/UserProfileEdit.vue';
import { editUser } from '../service/auth';

const { user } = useAuth();

export default {
  props: {
    userId: {
      type: String,
      required: true,
    }
  },
  setup(props) {
    const loading = ref(true);
    const userProfile = ref({});
    const editMode = ref(false);

    const toggleEditMode = () => {
      console.log("Toggle edit mode");
      editMode.value = !editMode.value;
    };

    const calculateAge = (birthday) => {
      if (!birthday) return '';
      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const month = today.getMonth() - birthDate.getMonth();
      if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    onMounted(async () => {
      try {
        userProfile.value = await getUserProfileById(props.userId);
        await nextTick();
      } catch (error) {
        console.error("Error al obtener el perfil de usuario:", error);
      } finally {
        loading.value = false;
      }
    });

    const handleShowEdit = () => {
      const $router = inject('$router');
      $router.push({ name: 'user-profile-edit', params: { userId: props.userId, userData: userProfile.value } });
    };

    return {
      userProfile,
      loading,
      editMode,
      calculateAge,
      toggleEditMode,
      handleShowEdit
    };
  },
};
</script>


<template>
  <div class="d-flex gap-4 user-profile-container">

    <div class="col-md-6 d-flex align-items-center justify-content-center w-25">
      <dd class="mb-2">
        <img v-if="userProfile && userProfile.photoURL" :src="userProfile.photoURL" alt="User Avatar" />
        <span v-else-if="userProfile.gender === 'Masculino'" class="icon-container text-center">
          <img src="../img/perfil/hombre.png" alt="User Avatar" style="width: 200px; height: 200px;" />
        </span>
        <span v-else-if="userProfile.gender === 'Femenino'" class="icon-container text-center">
          <img src="../img/perfil/mujer.png" alt="User Avatar" style="width: 200px; height: 200px;" />
        </span>
        <span v-else class="icon-container text-center">
          <i class="fa-solid fa-user" style="font-size: 64px;"></i>
        </span>
      </dd>
    </div>

    <dl class="w-75">
      <div class="user-info-container row g-3 mb-4">
        <div class="col-md-6">
          <dt class="fw-bold">Email</dt>
          <dd class="mb-2">{{ userProfile.email }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Nombre</dt>
          <dd class="mb-2">{{ userProfile.displayName || 'No especificado' }}</dd>
        </div>

        <div class="col-md-6">
          <dt class="fw-bold">Tipo de cuenta</dt>
          <dd class="mb-2">{{ userProfile.isAdmin ? 'Administrador' : 'Cuenta personal' }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Tipo de usuario</dt>
          {{ userProfile.premium ? 'Premium' : 'Gratis' }}
          <span v-if="userProfile.premium && userProfile.premiumExpiry">
            - Expira el: {{ formatDate(userProfile.premiumExpiry) }}
          </span>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Altura</dt>
          <dd class="mb-2">{{ userProfile.height || 'No especificada' }} cm</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Peso</dt>
          <dd class="mb-2">{{ userProfile.weight || 'No especificada' }} kg</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Fecha de nacimiento</dt>
          <dd class="mb-2">{{ userProfile.birthday || 'No especificada' }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Edad</dt>
          <dd class="mb-2">{{ calculateAge(userProfile.birthday) }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Género</dt>
          <dd class="mb-2">{{ userProfile.gender || 'No especificado' }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Meta</dt>
          <dd class="mb-2">{{ userProfile.goal || 'No especificado' }}</dd>
        </div>
      </div>
    </dl>

  </div>
</template>


<style scoped>
.user-profile-container {
  display: flex;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  
}

.user-avatar {
  max-width: 100px;
  border-radius: 50%;
}

.user-details-container {
  margin-left: 20px;
}

.user-name {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.user-info-container {
  width: 100%;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin-top: 40px;
}

@media (max-width: 767px) {
  .user-profile-container {
    flex-direction: column;
  }

  .user-avatar {
    margin-bottom: 10px;
  }
}
</style>
  
