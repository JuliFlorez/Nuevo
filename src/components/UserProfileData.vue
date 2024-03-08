<script setup>
import { defineProps } from 'vue';

defineProps({
  user: {
    type: Object,
    required: true,
  }
});

const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha no especificada';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date)) return 'Fecha inválida';

  return date.toLocaleDateString();
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
</script>



<template>
  <div class="d-flex gap-4 user-profile-container">
    <div class="col-md-6 d-flex align-items-center justify-content-center w-25">
      <dd class="mb-2">
        <img v-if="user && user.photoURL" :src="user.photoURL" alt="User Avatar" />
        <span v-else-if="user.gender === 'Masculino'" class="icon-container text-center">
          <img src="../img/perfil/hombre.png" alt="User Avatar" style="width: 200px; height: 200px;" />
        </span>
        <span v-else-if="user.gender === 'Femenino'" class="icon-container text-center">
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
          <dd class="mb-2">{{ user.email }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Nombre</dt>
          <dd class="mb-2">{{ user.displayName || 'No especificado' }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Tipo de usuario</dt>
          {{ user.premium ? 'Premium' : 'Gratis' }}
          <span v-if="user.premium && user.premiumExpiry">
            - Expira el: {{ formatDate(user.premiumExpiry) }}
          </span>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Tipo de cuenta</dt>
          <dd class="mb-2">{{ user.isAdmin ? 'Administrador' : 'Cuenta personal' }}</dd>
        </div>

        <div class="col-md-6">
          <dt class="fw-bold">Altura</dt>
          <dd class="mb-2">{{ user.height || 'No especificada' }} cm</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Peso</dt>
          <dd class="mb-2">{{ user.weight || 'No especificada' }} Kg</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Fecha de nacimiento</dt>
          <dd class="mb-2">{{ user.birthday || 'No especificada' }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Edad</dt>
          <dd class="mb-2">{{ calculateAge(user.birthday) }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Género</dt>
          <dd class="mb-2">{{ user.gender || 'No especificado' }}</dd>
        </div>
        <div class="col-md-6">
          <dt class="fw-bold">Meta</dt>
          <dd class="mb-2">{{ user.goal || 'No especificado' }}</dd>
        </div>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.user-profile-container {
  display: flex;
  padding: 20px;
  border-radius: 10px;
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
  background-color: #262928;
  border: 1px solid #ddd;
  color: #fff;
  font-weight: 500;
  font-size: 18px;
  border-radius: 8px;
  padding: 10px;
}

.user-info-container dt {
  font-size: 24px;
  margin-bottom: 4px;
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