<script>
import { foodSubscribeToChanges, foodSave, foodDelete } from './../service/food.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, updateDoc, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getUserProfileById } from "./../service/user.js";

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
          console.log("User profile:", userProfile);

          self.state.userGoal = userProfile.goal;
          console.log("User's goal:", self.state.userGoal);

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
      console.log("Saving food to Firebase:", newFoodData);
      newFoodData.created_at = new Date();

      if (!newFoodData.category) {
        console.error('Error: Category is required for new food.');
        alert('Error: Category is required for new food. Please select a category.');
        return;
      }

      try {
        const db = getFirestore();
        const docRef = await addDoc(collection(db, "food"), newFoodData);
        console.log("Document written with ID: ", docRef.id);
        await this.foodsaveSubscribeToChanges();
        alert('Comida guardada correctamente.');
      } catch (error) {
        console.error("Error adding document: ", error);
        alert('Error al guardar la comida. Por favor, inténtalo de nuevo.');
      }
    },

    addFood() {
      console.log("Adding new food...");
      console.log("Is Recommended:", this.newFood.isRecommended);

      $('#exampleModal').modal('hide');

      if (this.selectedTime && this.newFood.metaSeleccionada) { // Verifica que se haya seleccionado una meta
        const newFoodData = {
          name: this.newFood.name,
          calories: this.newFood.calories,
          recipe: this.newFood.recipe,
          weight: this.newFood.weight,
          time: this.selectedTime,
          isRecommended: this.newFood.isRecommended,
          category: this.selectedTime.toLowerCase(),
          goal: this.newFood.metaSeleccionada // Agrega la meta seleccionada al objeto de datos
        };
        this.saveFood(newFoodData);
        this.resetNewFood();
        // Luego, abre el nuevo modal
        $('#exampleModal').modal('show');
        alert('Comida guardada correctamente.');
      } else {
        console.error('Error: Time and meta are required for new food.');
        alert('Error: Time and meta are required for new food. Please select a valid time and meta.');
      }
    },



    async guardarComidaEnPerfil(comidaId) {
      try {
        console.log("Guardando comida en el perfil...");
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
        console.log("Comida guardada en perfil:", comidaId);

        this.comidasSeleccionadas.push(comidaId);

        alert('Comida guardada en favoritos correctamente.');
      } catch (error) {
        console.error('Error al guardar la comida en el perfil del usuario:', error);
        alert('Error al guardar la comida en favoritos. Por favor, inténtalo de nuevo.');
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
        console.log("Eliminando comida del perfil...");
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

        console.log("Comida eliminada del perfil:", comidaId);
        this.comidasGuardadas = this.comidasGuardadas.filter(comida => comida.id !== comidaId);
        alert('Comida eliminada del perfil correctamente.');
      } catch (error) {
        console.error('Error al eliminar la comida del perfil del usuario:', error);
        alert('Error al eliminar la comida del perfil. Por favor, inténtalo de nuevo.');
      }
    },



    async foodsaveSubscribeToChanges() {
      try {
        const auth = getAuth();
        const usuario = auth.currentUser;

        if (!usuario) {
          console.log('El usuario no está autenticado');
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
            console.log("Comidas guardadas:", comidasGuardadas);
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
      console.log("Getting selected categories...");
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
      console.log("Getting selected 'No Recomendado' categories...");
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
      console.log("Formatting categories...");
      return categories.join(', ');
    },

    setRecomendado(recommended) {
      console.log("Setting recommended state...");
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
      console.log("Filtering food by type and user's goal...");
      this.filteredFood = this.food.filter(item => {
        const isInCategory = item.time.toLowerCase().includes(type.toLowerCase());
        const isMatchingGoal = item.goal.toLowerCase() === this.state.userGoal.toLowerCase();
        const isNoRecomendado = this.isNoRecomendado(item);
        return (isNoRecomendado && type.toLowerCase() === 'no recomendado') || (!isNoRecomendado && isInCategory && isMatchingGoal);
      });
    },

    async eliminarComida(comidaId) {
      try {
        console.log("Eliminando comida...");
        const db = getFirestore();
        const comidaRef = doc(db, 'food', comidaId);
        await deleteDoc(comidaRef);
        console.log("Comida eliminada:", comidaId);
        this.food = this.food.filter(item => item.id !== comidaId);
        alert('Comida eliminada correctamente.');
      } catch (error) {
        console.error('Error al eliminar la comida:', error);
        alert('Error al eliminar la comida. Por favor, inténtalo de nuevo.');
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
        <p class="text-center">En esta sección buscamos ayudarte en tu alimentación dependiendo de la meta que hayas elegido, además te recomendamos el momento del día en el que la puedes consumir. Recuerda que estas comidas son solo recomendaciones, puedes consumir lo que creas correcto.</p>
      </div>
      <div class="d-flex flex-column flex-md-row justify-content-md-end mb-3">
        <!-- Botones alineados a la derecha en dispositivos medianos y grandes -->
        <button v-if="mostrarBotonModal" type="button" class="btn btn-primary me-2" data-bs-toggle="modal"
            data-bs-target="#exampleModal" data-bs-whatever="@getbootstrap">Añadir
            <i class="fa-solid fa-plus"></i>
          </button>

        <button class="btn btn-primary me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">Guardados <i class="fa-regular fa-bookmark"></i></button>
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
      <div class="modal-dialog modal-dialog-centered">
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
  /* Ancho completo de la ventana */
  overflow: hidden;
  /* Para que la imagen no tenga scroll horizontal */
}


.banner img {
  max-width: 100%;
  object-fit: cover;
  /* Para que la imagen cubra todo el contenedor */
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
  /* Ajusta el tamaño de la fuente según tus preferencias */
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

/*Estilo De Lista*/
.list-group {
  margin-bottom: 20px;
}

.modal {
  z-index: 1060;
  /* O un valor mayor que el z-index del modal-backdrop */
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
  /* Color de fondo */
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  /* Sombra */
}

.recommended-food h2,
.not-recommended-food h2 {
  margin-bottom: 15px;
  font-size: 1.5em;
  /* Tamaño de fuente */
  color: #ffffff;
  font-weight: 900;
  /* Color del encabezado */
}

.recommended-food p,
.not-recommended-food p {
  color: #000000;
  /* Color del texto */
}

.text-center {
  text-align: center;
  /* Centrar texto */
}


/* Estilos para los encabezados h1 */
.texto-comidas {
  font-family: 'Montserrat', sans-serif !important;
  font-weight: bold !important;
  color: #ffffff !important;
  background-color: #EE9003 !important;
  border-radius: 50px !important;
  text-align: center !important;
  font-size: 3em !important;
  /* Ajusta el tamaño de la fuente según tus preferencias */
}

/* Estilos para los demás elementos de texto */
.form-label,
.btn,
.checkbox-inline,
.card-title,
.card-body p {
  font-family: 'Montserrat', sans-serif;
  font-size: 1em;
  /* Ajusta el tamaño de la fuente según tus preferencias */
}

/* .card-body p {
  padding: 3px;
} */
.card-body h4 {
  font-weight: bold;
}

.card-body h5 {
  font-weight: 500;
  padding: 3px;
}

.container {
  /* max-width: 600px; */
  margin: auto;
  padding: 20px;
}

form {
  text-align: center !important;
  background-color: #ffffff;
  padding: 20px;
  /* Ajusta el tamaño del padding según tus preferencias */
  border-radius: 10px;
  /* Bordes redondeados */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  /* Sombra sutil */
  margin-bottom: 20px;
  /* Ajusta el margen inferior según tus preferencias */
}

#calories.form-control {
  width: 60%;
  /* Ajusta el ancho según tus preferencias */
  margin: 0 auto;
  /* Centra el campo horizontalmente */
  display: block;
  /* Asegura que ocupa todo el ancho disponible */

}

.form-label {
  text-align: center !important;
  font-weight: bold;
}

/* Estilos para checkboxes */
.checkbox-inline input {
  margin-right: 8px;
  appearance: none;
  /* Elimina el estilo nativo del navegador */
  border: 2px solid #4CAF50;
  /* Borde del checkbox */
  border-radius: 4px;
  /* Bordes redondeados */
  width: 18px;
  height: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.checkbox-inline input:checked {
  background-color: #4CAF50;
  /* Fondo cuando está seleccionado */
  border-color: #4CAF50;
  /* Borde cuando está seleccionado */
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
.bts.container{
  padding: 24px 70px;
}

.bts.container .btn-primary {
  max-width: 100%;
}

.btn-primary {
  background-color: #298851;
  /* Verde */
  font-weight: 600;
  /* box-shadow: #0000004b; */
  color: #ffffff;
  border: none;
  padding: 8px 80px;
  border-radius: 25px;
  cursor: pointer;
}

/* Estilos para el botón de advertencia */
.btn-warning {
  background-color: #FFC107;
  /* Amarillo */
  color: #212529;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
}

/* Estilos para mensajes de error */
.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  border-radius: 4px;
  padding: 10px;
  margin-top: 20px;
  text-align: center;
  /* Centra el texto del mensaje de error */
}

/* Estilos para la lista de comidas */
.row-cols-1>.col {
  margin-bottom: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 10px;
  transition: box-shadow 0.3s;
  margin-bottom: 10px; /* Margen inferior entre tarjetas martina acordate de fijarte el offcanvas con esto y las tarjetas*/
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.57);
  /* Sombra más pronunciada al pasar el mouse */
}


.offcanvas {
  background-color: #f8f9fa; /* Color de fondo del modal */
  width: 300px; /* Ancho del modal */
}

.offcanvas-header {
  background-color: #007bff; /* Color de fondo del encabezado */
  color: white; /* Color del texto del encabezado */
}

.offcanvas-body {
  padding: 20px; /* Espaciado interno del cuerpo del modal */
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
  padding:0;

}

.bts.container{
  padding:0;
}

  
}

</style>