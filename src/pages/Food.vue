<script>
import { foodSubscribeToChanges, foodSave, foodDelete } from './../service/food.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, updateDoc, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getUserProfileById } from "./../service/user.js";
import Swal from 'sweetalert2'

import ComidaSeleccionadaCard from '../components/ComidaSeleccionadaCard.vue';


export default {
  name: 'Food',
  components: {
    ComidaSeleccionadaCard,
  },
  data() {
    return {
      comidasGuardadas: [],
      comidasSeleccionadas: [],
      food: [],
      filteredFood: [],
      newFood: {
        name: '',
        calories: 0,
        recipe: '',
        weight: 0,
        category: '',
        isRecommended: true,
        metaSeleccionada: '',
        noRecomendado: {
          desayuno: false,
          almuerzo: false,
          merienda: false,
          cena: false
        }
      },
      selectedTime: 'desayuno',
      error: false,
      state: {
        userGoals: {}
      }
    };
  },


  mounted() {
    foodSubscribeToChanges((food) => {
      this.food = food;
      this.filteredFood = food;
      this.loadCategoriesBasedOnTime();
    });

    const self = this;

    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        self.mostrarBotonModal = true;

        try {
          const userProfile = await getUserProfileById(user.uid);

          self.state.userGoal = userProfile.goal;

          self.loadCategoriesBasedOnTime();

          self.foodsaveSubscribeToChanges();
        } catch (error) {
          console.error("Error getting user profile:", error);
        }
      } else {

        self.mostrarBotonModal = false;
      }
    });

    this.loadCategoriesBasedOnTime();
  },

  created() {
    this.foodsaveSubscribeToChanges();
  },

  computed: {
    recomendedFood() {
      return this.filteredFood.filter(item => item.isRecommended);
    },
    unrecomendedFood() {
      return this.filteredFood.filter(item => !item.isRecommended);
    },

  },

  methods: {
    async saveFood(newFoodData) {
      newFoodData.created_at = new Date();

      if (!newFoodData.category) {
        console.error('Error: Category is required for new food.');
        Swal.fire({
          text: 'La categoria es requerida para nuevas comidas, Porfavor seleccionar categoria.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        })
        return;
      }

      try {
        const db = getFirestore();
        const docRef = await addDoc(collection(db, "food"), newFoodData);
        await this.foodsaveSubscribeToChanges();
        Swal.fire({
          text: 'Comida guardada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        })
      } catch (error) {
        console.error("Error adding document: ", error);
        Swal.fire({
          text: 'Error al guardar la comida. Por favor, inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        })
      }
    },

    addFood() {

      $('#exampleModal').modal('hide');

      if (this.selectedTime && this.newFood.metaSeleccionada) {
        const newFoodData = {
          name: this.newFood.name,
          calories: this.newFood.calories,
          recipe: this.newFood.recipe,
          weight: this.newFood.weight,
          time: this.selectedTime,
          isRecommended: this.newFood.isRecommended,
          category: this.selectedTime.toLowerCase(),
          goal: this.newFood.metaSeleccionada
        };
        this.saveFood(newFoodData);
        this.resetNewFood();
        $('#exampleModal').modal('show');
        Swal.fire({
          text: 'Comida guardada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        })
      } else {
        console.error('Error: Time and meta are required for new food.');
        Swal.fire({
          text: 'Time and meta are required for new food. Please select a valid time and meta.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        })
      }
    },



    async guardarComidaEnPerfil(comidaId) {
      try {
        const auth = getAuth();
        const usuario = auth.currentUser;

        if (!usuario) {
          throw new Error('El usuario no está autenticado');
        }

        const userId = usuario.uid;
        const db = getFirestore();
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          throw new Error('El documento del usuario no existe');
        }

        const comidaDocRef = doc(db, 'food', comidaId);
        const comidaDocSnapshot = await getDoc(comidaDocRef);

        if (!comidaDocSnapshot.exists()) {
          throw new Error('La comida no existe');
        }

        const comidaData = comidaDocSnapshot.data();
        const userfoodsaveRef = collection(db, `users/${userId}/foodsave`);
        await addDoc(userfoodsaveRef, comidaData);

        await this.foodsaveSubscribeToChanges();

        this.comidasSeleccionadas.push(comidaId);

        Swal.fire({
          text: 'Comida guardada en favoritos correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        })
      } catch (error) {
        console.error('Error al guardar la comida en el perfil del usuario:', error);
        Swal.fire({
          text: 'Error al guardar la comida en favoritos. Por favor, inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        })
      }
    },

    isNoRecomendado(item) {
      return item.time.toLowerCase().includes('no recomendado');
    },

    async loadCategoriesBasedOnTime() {
      try {
        const db = getFirestore();
        const horaActualArgentina = new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
        const hora = parseInt(horaActualArgentina.split(':')[0]);

        if (hora >= 5 && hora < 10) {
          this.filterFood('Desayuno');
        } else if (hora >= 12 && hora < 15) {
          this.filterFood('Almuerzo');
        } else if (hora >= 17 && hora < 20) {
          this.filterFood('Merienda');
        } else {
          this.filterFood('Cena');
        }
        this.filterFood(type);
      } catch (error) {
        console.error("Error al cargar las comidas según la hora:", error);
      }
    },


    async eliminarComidaDePerfil(comidaId) {
      try {
        const auth = getAuth();
        const usuario = auth.currentUser;

        if (!usuario) {
          throw new Error('El usuario no está autenticado');
        }

        const userId = usuario.uid;
        const db = getFirestore();
        const userfoodsaveRef = collection(db, `users/${userId}/foodsave`);

        const comidaDocRef = doc(userfoodsaveRef, comidaId);
        await deleteDoc(comidaDocRef);

        this.comidasGuardadas = this.comidasGuardadas.filter(comida => comida.id !== comidaId);
        Swal.fire({
          text: 'Comida eliminada del perfil correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        })
      } catch (error) {
        console.error('Error al eliminar la comida del perfil del usuario:', error);
        Swal.fire({
          text: 'Error al eliminar la comida del perfil. Por favor, inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        })
      }
    },



    async foodsaveSubscribeToChanges() {
      try {
        const auth = getAuth();
        const usuario = auth.currentUser;

        if (!usuario) {
          return;
        }

        const userId = usuario.uid;
        const db = getFirestore();
        const userfoodsaveRef = collection(db, `users/${userId}/foodsave`);

        onSnapshot(userfoodsaveRef, async (snapshot) => {
          try {
            const comidasGuardadas = [];
            snapshot.forEach((doc) => {
              const comida = {
                id: doc.id,
                ...doc.data()
              };
              comidasGuardadas.push(comida);
            });
            this.comidasGuardadas = comidasGuardadas;
          } catch (error) {
            console.error("Error al obtener las comidas guardadas:", error);
          }
        });
      } catch (error) {
        console.error('Error al suscribirse a los cambios en las comidas guardadas:', error);
      }
    },

    getSelectedCategories() {
      let categories = [];
      const categoryKeys = Object.keys(this.newFood.category);

      categoryKeys.forEach(key => {
        if (this.newFood.category[key]) {
          categories.push(key.charAt(0).toUpperCase() + key.slice(1));
        }
      });

      return categories;
    },

    getSelectedNoRecomendadoCategories() {
      let noRecomendadoCategories = [];
      const noRecomendadoKeys = Object.keys(this.newFood.noRecomendado);

      noRecomendadoKeys.forEach(key => {
        if (this.newFood.noRecomendado[key]) {
          noRecomendadoCategories.push('No Recomendado para ' + (key.charAt(0).toUpperCase() + key.slice(1)));
        }
      });

      return noRecomendadoCategories;
    },
    formatCategories(categories) {
      return categories.join(', ');
    },

    setRecomendado(recommended) {
      this.newFood.isRecommended = recommended;

      const selectedCategory = this.selectedTime.charAt(0).toUpperCase() + this.selectedTime.slice(1);

      if (!recommended) {

        this.newFood.noRecomendado[selectedCategory] = true;
      } else {

        this.newFood.noRecomendado[selectedCategory] = false;
      }
    },

    resetNewFood() {
      this.newFood = {
        name: '',
        calories: 0,
        recipe: '',
        weight: 0,
        category: '',
        isRecommended: true,
      };
      this.selectedTime = 'desayuno';
      this.error = false;
    },

    filterFood(type) {
      this.filteredFood = this.food.filter(item => {
        const isInCategory = item.time.toLowerCase().includes(type.toLowerCase());
        const isMatchingGoal = item.goal.toLowerCase() === this.state.userGoal.toLowerCase();
        const isNoRecomendado = this.isNoRecomendado(item);
        return (isNoRecomendado && type.toLowerCase() === 'no recomendado') || (!isNoRecomendado && isInCategory && isMatchingGoal);
      });
    },

    async eliminarComida(comidaId) {
      try {
        const db = getFirestore();
        const comidaRef = doc(db, 'food', comidaId);
        await deleteDoc(comidaRef);
        this.food = this.food.filter(item => item.id !== comidaId);
        Swal.fire({
          text: 'Comida eliminada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        })
        
      } catch (error) {
        console.error('Error al eliminar la comida:', error);
        Swal.fire({
          text: 'Error al eliminar la comida. Por favor, inténtalo de nuevo.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        })
      }
    },
  },
}
</script>


<template>
  <div class="banner">
    <img src="../img/banner-food.jpg" alt="Banner" class="img-fluid">
  </div>

  <div class="container">
    <div class="header-info">
      <div class="header-txt">
        <h1 class="text-center">Bienvenido a comidas</h1>
        <p class="text-center">En esta sección buscamos ayudarte en tu alimentación dependiendo de la meta que hayas
          elegido, además te recomendamos el momento del día en el que la puedes consumir. Recuerda que estas comidas
          son solo recomendaciones, puedes consumir lo que creas correcto.</p>
      </div>
      <div class="d-flex flex-column flex-md-row justify-content-md-end mb-3">
        <!-- Botones alineados a la derecha en dispositivos medianos y grandes -->
        <button v-if="mostrarBotonModal" type="button" class="btn btn-primary me-2" data-bs-toggle="modal"
          data-bs-target="#exampleModal" data-bs-whatever="@getbootstrap">Añadir
          <i class="fa-solid fa-plus"></i>
        </button>

        <button class="btn btn-primary me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight"
          aria-controls="offcanvasRight">Guardados <i class="fa-regular fa-bookmark"></i></button>
      </div>
    </div>

    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasRightLabel">Comidas Seleccionadas</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <ul>
          <div v-for="comida in comidasGuardadas" :key="comida.id">
            <!-- Aquí va el contenido de cada tarjeta -->
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ comida.name }}</h5>
                <p class="card-text">Calorías: {{ comida.calories }}</p>
                <button @click="eliminarComidaDePerfil(comida.id)" class="btn btn-danger">Eliminar</button>
              </div>
            </div>
          </div>
        </ul>
        <button type="button" class="btn btn-secondary mt-3" data-bs-dismiss="offcanvas">Cerrar</button>
      </div>
    </div>


    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="exampleModalLabel">Agregar Nueva Comida</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addFood" class="mt-4">
              <div class="mb-3">
                <label class="form-label">¿Es Recomendado?</label><br>
                <div class="btn-group" role="group" aria-label="Recomendado">
                  <button :class="['btn', 'btn-primary', { active: isRecomendado }]" @click="setRecomendado(true)">
                    <i class="fas fa-thumbs-up"></i> Recomendado
                  </button>
                  <button :class="['btn', 'btn-secondary', { active: !isRecomendado }]" @click="setRecomendado(false)">
                    <i class="fas fa-thumbs-down"></i> No Recomendado
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Hora de la Comida:</label><br>
                <select v-model="selectedTime" class="form-select">
                  <option value="desayuno">Desayuno</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="merienda">Merienda</option>
                  <option value="cena">Cena</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="foodName" class="form-label">Nombre de la comida:</label>
                <input v-model="newFood.name" type="text" class="form-control" id="foodName" required>
              </div>
              <div class="mb-3">
                <label for="calories" class="form-label">Calorías:</label>
                <input v-model.number="newFood.calories" type="text" class="form-control" id="calories" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Meta:</label><br>
                <select v-model="newFood.metaSeleccionada" class="form-select">
                  <option value="">Selecciona una meta</option>
                  <option value="Deficit">Deficit</option>
                  <option value="Volumen">Volumen</option>
                  <option value="Definicion">Definición</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="recipe" class="form-label">Receta:</label>
                <textarea v-model="newFood.recipe" class="form-control" id="recipe" rows="4"></textarea>
              </div>
              <div class="mb-3">
                <label for="weight" class="form-label">Peso (g):</label>
                <input v-model.number="newFood.weight" type="number" class="form-control" id="weight" required>
              </div>
              <button type="submit" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Agregar comida</button>
              <div v-if="error" class="alert alert-danger mt-2">
                Por favor, completa todos los campos para agregar una nueva comida.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>


    <!-- Lista De Comidas -->
    <div class="mt-4 mb-4 bts container">
      <div class="text-center mb-4 bts">
        <button @click="filterFood('Desayuno')" class="btn btn-primary m-2">Desayuno</button>
        <button @click="filterFood('Almuerzo')" class="btn btn-primary m-2">Almuerzo</button>
        <button @click="filterFood('Merienda')" class="btn btn-primary m-2">Merienda</button>
        <button @click="filterFood('Cena')" class="btn btn-primary m-2">Cena</button>
      </div>

      <div class="row">
        <!-- Columna de Comida Recomendada -->
        <div class="col-md-6">
          <div class="recommended-food">
            <h2 class="text-center">Comida recomendada</h2>
            <div v-if="recomendedFood.length > 0">
              <div class="card-deck">
                <div v-for="(item, index) in recomendedFood" :key="index" class="card mb-3">
                  <div class="card-body">
                    <h4 class="card-title">{{ item.name }}</h4>
                    <h5 class="card-text">Recomendado en: {{ item.time }}</h5>
                    <h5 class="card-text">Calorías: {{ item.calories }}</h5>
                    <h5 class="card-text">Receta: {{ item.recipe }}</h5>
                    <!-- <p class="card-text">Meta del usuario: {{ state.userGoal }}</p> -->
                    <h5 class="card-text">Meta De La Comida: {{ item.goal }}</h5>
                    <h5 v-if="state.userGoal.toLowerCase() === item.goal.toLowerCase()" class="card-text text-success">
                      ¡Esta comida se alinea con tu meta!</h5>
                    <p v-else class="card-text text-warning">Esta comida no se alinea con tu meta.</p>
                    <div class="d-flex align-items-center">
                      <button @click="guardarComidaEnPerfil(item.id)" class="btn btn-success m-2">
                        <i v-if="!comidasGuardadas.includes(item.id)" class="fa-regular fa-bookmark"></i>
                        <i v-else class="fa-solid fa-bookmark"></i>
                      </button>
                      <button @click="eliminarComida(item.id)" class="btn btn-danger">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <p class="text-center">No hay comidas recomendadas disponibles.</p>
            </div>
          </div>
        </div>

        <!-- Columna de Comida No Recomendada -->
        <div class="col-md-6">
          <div class="not-recommended-food">
            <h2 class="text-center">Comida no recomendada</h2>
            <div v-if="unrecomendedFood.length > 0">
              <div class="card-deck">
                <div v-for="(item, index) in unrecomendedFood" :key="index" class="card mb-3">
                  <div class="card-body">
                    <h5 class="card-title">{{ item.name }}</h5>
                    <!-- <p class="card-text">Hora: {{ item.time }}</p> -->
                    <p class="card-text">Calorías: {{ item.calories }}</p>
                    <div class="d-flex align-items-center">
                      <button @click="guardarComidaEnPerfil(item.id)" class="btn btn-success m-2">
                        <i v-if="!comidasGuardadas.includes(item.id)" class="fa-regular fa-bookmark"></i>
                        <i v-else class="fa-solid fa-bookmark"></i>
                      </button>
                      <button @click="eliminarComida(item.id)" class="btn btn-danger"><i
                          class="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <p class="text-center">No hay comidas no recomendadas disponibles.</p>
            </div>
          </div>
        </div>


      </div>

    </div>
  </div>
</template>



<style scoped>
.banner {
  max-width: 100vw;
  max-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}


.banner img {
  max-width: 100%;
  object-fit: cover;
}

.header-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
}

.header-txt {
  width: 50%;
  padding-right: 35px;
}

.header-txt h1 {
  font-size: 50px;
  line-height: 70px;
  font-weight: 400;
  color: #303030;
  margin-bottom: 18px;
}

.header-txt p {
  font-size: 16px;
  color: #545454;
  margin-bottom: 100px;
}


.btn-recomendado {
  width: 50%;
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.btn-recomendado.active {
  background: #0069d9;
}

.btns-recomendado {
  max-width: 100%;
}

body {
  font-family: 'Montserrat', sans-serif;
  background-color: #f8f9fa;
  font-size: 16px;
}

h1 {
  font-family: Futura, sans-serif;
  animation: fadeInUp 2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-group {
  margin-bottom: 20px;
}

.modal {
  z-index: 1060;
}

.list-group-item {
  border: none;
}

.list-group-item h5 {
  margin-bottom: 5px;
  font-weight: bold;
}

.list-group-item p {
  margin-bottom: 5px;
}

.recommended-food,
.not-recommended-food {
  padding: 20px;
  background-color: #06472199;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.recommended-food h2,
.not-recommended-food h2 {
  margin-bottom: 15px;
  font-size: 1.5em;
  color: #ffffff;
  font-weight: 900;
}

.recommended-food p,
.not-recommended-food p {
  color: #000000;
}

.text-center {
  text-align: center;
}

.texto-comidas {
  font-family: 'Montserrat', sans-serif !important;
  font-weight: bold !important;
  color: #ffffff !important;
  background-color: #EE9003 !important;
  border-radius: 50px !important;
  text-align: center !important;
  font-size: 3em !important;
}

.form-label,
.btn,
.checkbox-inline,
.card-title,
.card-body p {
  font-family: 'Montserrat', sans-serif;
  font-size: 1em;
}

.card-body h4 {
  font-weight: bold;
}

.card-body h5 {
  font-weight: 500;
  padding: 3px;
}

.container {
  margin: auto;
  padding: 20px;
}

form {
  text-align: center !important;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

#calories.form-control {
  width: 60%;
  margin: 0 auto;
  display: block;
}

.form-label {
  text-align: center !important;
  font-weight: bold;
}

.checkbox-inline input {
  margin-right: 8px;
  appearance: none;
  border: 2px solid #4CAF50;
  border-radius: 4px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.checkbox-inline input:checked {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.form-control {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
}

.me-2 {
  font-weight: 700;
  background-color: #ff9100 !important;
  padding: 16px 60px !important;
  margin-bottom: 6%;
}

.bts {
  background-color: #033f1c84;
  padding: 12px 20px;
  border-radius: 25px;
  max-width: 100%;
}

.bts.container {
  padding: 24px 70px;
}

.bts.container .btn-primary {
  max-width: 100%;
}

.btn-primary {
  background-color: #298851;
  font-weight: 600;
  color: #ffffff;
  border: none;
  padding: 8px 80px;
  border-radius: 25px;
  cursor: pointer;
}

.btn-warning {
  background-color: #FFC107;
  color: #212529;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  border-radius: 4px;
  padding: 10px;
  margin-top: 20px;
  text-align: center;
}

.row-cols-1>.col {
  margin-bottom: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 10px;
  transition: box-shadow 0.3s;
  margin-bottom: 10px;
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.57);
}


.offcanvas {
  background-color: #f8f9fa;
  width: 300px;
}

.offcanvas-header {
  background-color: #298851;
  color: white;
}

.offcanvas-body {
  padding: 20px;
}

@media (max-width: 986px) {

  .bts.container {
    padding: 0;
  }

  .btn-group {
    flex-direction: column;
    padding: 0 !important;

  }

  .btn-primary {
    padding: 2px !important;

  }

}

@media (max-width: 680px) {
  .header-info {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .header-info .header-txt {
    width: 100%;
    padding: 0;
  }

  .me-2 {
    padding: 0;

  }

  .bts.container {
    padding: 0;
  }

  .btn-group {
    flex-direction: column;
    padding: 0 !important;

  }

  .btn-primary {
    padding: 0;
  }

}
</style>