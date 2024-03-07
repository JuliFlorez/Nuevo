<template>
  <div class="user-management text-center">
    <h2 class="titleABM">Lista de Usuarios</h2>

    <!-- Campo de búsqueda -->
    <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o correo electrónico..." class="search-input">

    <!-- Muestra una carga mientras se obtienen los datos -->
    <div v-if="loading" class="loading">Cargando...</div>

    <div class="container">
      <div class="table-responsive">
        <table v-if="!loading" class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Email</th>
              <th scope="col">Nombre</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(usuario, index) in paginarUsuarios" :key="usuario.id">
              <th scope="row">{{ calcularNumeroUsuario(index) }}</th>
              <td>{{ usuario.email }}</td>
              <td>{{ usuario.displayName }}</td>
              <td class="actions">
                <button @click="verPerfil(usuario)" class="btn btn-primary mr-1 m-1"><i class="fa-solid fa-user "></i> Ver Perfil</button>

                <button @click="editarUsuario(usuario)" class="btn btn-warning mr-1 m-1"><i class="fa-solid fa-pen-to-square"></i> Editar</button>

                <button @click="confirmDelete(usuario.id)" class="btn btn-danger mr-1 m-1"><i class="fa-solid fa-trash"></i> Borrar</button>

                <router-link class="btn btn-primary mr-2" :to="`/usuario/${usuario.id}/chat`"><i class="fa-solid fa-comment"></i> Chat</router-link>

                <button v-if="user.email === 'nutritrack@hotmail.com' && usuario.isAdmin" @click="hacerUsuario(usuario)" class="btn btn-secondary mr-1 m-1">Cambiar a Usuario</button>

                <button v-if="user.email === 'nutritrack@hotmail.com' && !usuario.isAdmin" @click="hacerAdmin(usuario)" class="btn btn-info mr-1 m-1">Cambiar a Admin</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ 'disabled': paginaActual === 1 }">
            <a class="page-link" @click="paginaActual = paginaActual - 1">Atras</a>
          </li>
          <li class="page-item" v-for="pagina in totalPaginas" :key="pagina" :class="{ 'active': pagina === paginaActual }">
            <a class="page-link" @click="paginaActual = pagina">{{ pagina }}</a>
          </li>
          <li class="page-item" :class="{ 'disabled': paginaActual === totalPaginas }">
            <a class="page-link" @click="paginaActual = paginaActual + 1">Siguiente</a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmDeleteModalLabel">Confirmar eliminación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ¿Estás seguro de que quieres eliminar al usuario <strong>{{ userToDelete ? userToDelete.displayName : '' }}</strong>?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button @click="deleteUserConfirmed(); closeDeleteModal()" type="button" data-bs-dismiss="modal" class="btn btn-danger">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from 'vue';
import { useAuth } from '../composition/useAuth';
import { getAllUserProfiles, editUserProfile, deleteUser } from '../service/user';
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const { user } = useAuth();
    const loading = ref(true);
    const usuarios = ref([]);
    const localRouter = useRouter();
    const route = useRoute();
    const searchQuery = ref('');
    const userIdToDelete = ref(null);
    const userToDelete = ref(null);
    const usuariosPorPagina = 10;
    const paginaActual = ref(1);

    const totalPaginas = computed(() => {
      return Math.ceil(filteredUsuarios.value.length / usuariosPorPagina);
    });

    const paginarUsuarios = computed(() => {
      const inicio = (paginaActual.value - 1) * usuariosPorPagina;
      const fin = paginaActual.value * usuariosPorPagina;
      return filteredUsuarios.value.slice(inicio, fin);
    });

    const verPerfil = (usuario) => {
      if (usuario && usuario.id) {
        console.log("Ver perfil de usuario:", usuario);
        localRouter.push({ name: 'user-profile', params: { userId: usuario.id } });
      } else {
        console.error("ID de usuario no definida o no válida:", usuario);
      }
    };

    const editarUsuario = (usuario) => {
      if (usuario && usuario.id) {
        localRouter.push({ name: 'UserProfileEdit', params: { userId: usuario.id } });
      } else {
        console.error("ID de usuario no definida o no válida:", usuario);
      }
    };

    const confirmDelete = (userId) => {
      userIdToDelete.value = userId;
      userToDelete.value = usuarios.value.find(usuario => usuario.id === userId);
      const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
      modal.show();
    };

    const deleteUserConfirmed = async () => {
      if (userIdToDelete.value) {
        try {
          await deleteUser(userIdToDelete.value);
          usuarios.value = usuarios.value.filter(usuario => usuario.id !== userIdToDelete.value);
          console.log("Usuario eliminado con éxito.");
        } catch (error) {
          console.error("Error al eliminar el usuario:", error);
        } finally {
          userIdToDelete.value = null;
          closeDeleteModal();
          await nextTick();
        }
      }
    };

    const closeDeleteModal = () => {
      const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
      modal.hide();
    };

    const eliminarUsuario = async (userId) => {
      try {
        await deleteUser(userId);
        usuarios.value = usuarios.value.filter(usuario => usuario.id !== userId);
        console.log("Usuario eliminado con éxito.");
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    };

    const hacerAdmin = async (usuario) => {
      try {
        console.log("Haciendo Admin al usuario con ID:", usuario.id);
        await editUserProfile(usuario.id, { isAdmin: true });
        usuario.isAdmin = true;
      } catch (error) {
        console.error("Error al hacer Admin al usuario:", error);
      }
    };

    const hacerUsuario = async (usuario) => {
      try {
        console.log("Haciendo Usuario al usuario con ID:", usuario.id);
        await editUserProfile(usuario.id, { isAdmin: false });
        usuario.isAdmin = false;
      } catch (error) {
        console.error("Error al hacer Usuario al usuario:", error);
      }
    };

    const filteredUsuarios = computed(() => {
  return usuarios.value.filter(usuario => {
    const query = searchQuery.value.toLowerCase();
    const nameMatch = usuario.displayName.toLowerCase().includes(query);
    const emailMatch = usuario.email.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  }).sort((a, b) => a.createdAt - b.createdAt); // Ordenar por fecha de creación en orden ascendente
});

    const calcularNumeroUsuario = (index) => {
      return (paginaActual.value - 1) * usuariosPorPagina + index + 1;
    };

    onMounted(async () => {
    try {
      const fetchedUsuarios = await getAllUserProfiles();
      // Ordenar los usuarios por fecha de creación en orden descendente
      usuarios.value = fetchedUsuarios.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error("Error al obtener los perfiles de usuario:", error);
    } finally {
      loading.value = false;
    }
  });



    return {
      user,
      usuarios,
      loading,
      verPerfil,
      editarUsuario,
      eliminarUsuario,
      hacerAdmin,
      hacerUsuario,
      searchQuery,
      filteredUsuarios,
      confirmDelete,
      deleteUserConfirmed,
      closeDeleteModal,
      userToDelete,
      totalPaginas,
      paginaActual,
      paginarUsuarios,
      calcularNumeroUsuario
    };
  },
};
</script>


<style scoped>
.actions {
  margin-left: 10%;
}

.titleABM {
  font-size: 30px;
  font-weight: bold;
}

.search-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 50px;
  font-size: 16px;
  width: 50%;
  margin-bottom: 15px;
}

.user-management {
  margin: 20px;
}

.loading {
  font-style: italic;
  color: #888;
}

.table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.user-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.btn-profile,
.btn-edit,
.btn-delete,
.btn-change-role {
  padding: 6px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

.btn-profile:hover,
.btn-edit:hover,
.btn-delete:hover,
.btn-change-role:hover {
  background-color: #0056b3;
}

@media only screen and (max-width: 320px) {

  .user-table th,
  .user-table td {
    padding: 4px;
    font-size: 12px;
  }

  .btn-profile,
  .btn-edit,
  .btn-delete,
  .btn-change-role {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>