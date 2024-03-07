<template>
  
  <div class="container my-5">
    <h1 class="texto-comidas text-center mb-4">Preguntas Frecuentes</h1>

    <div v-for="(faq, index) in faqs" :key="index" @click="toggleAnswer(index)" class="question card mb-3"
      :class="{ 'open': faq.showAnswer }">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="mb-0">{{ faq.question }}</h2>
        <span :class="{ 'arrow-down': !faq.showAnswer, 'arrow-up': faq.showAnswer }"></span>
      </div>
      <div class="answer">
        <p>{{ faq.answer }}</p>
      </div>
    </div>
    <div v-if="!isUserPremium">
      <h3>Habla con un nutricionista ahora, solo para premiums!</h3>
    </div>
    <div v-if="isUserPremium">
      {{ console.log('Mostrando enlace premium porque isUserPremium es true') }}
      <router-link to="/usuario/JnmQZTUrzqd6V3vWFHq4wCNPMLS2/chat" class="premium-link">
        <h3 class="premium-link">Chat privado con Nutricionista</h3>
      </router-link>
    </div>

    <!-- Imágenes centradas -->
    <div class="text-center my-4">
      <img src="../img/icono1.svg" alt="Imagen 1" class="img-fluid icon-image">
      <img src="../img/icono2.svg" alt="Imagen 2" class="img-fluid icon-image">
      <img src="../img/icono3.svg" alt="Imagen 3" class="img-fluid icon-image">
    </div>

    <!-- Mapa -->
    <div class="embed-responsive embed-responsive-16by9 text-center mt-4">
      <iframe class="embed-responsive-item"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.9928441539078!2d-58.398575124771355!3d-34.604342457530436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaea670d4e67%3A0x2198c954311ad6d9!2sDa%20Vinci%20%7C%20Primera%20Escuela%20de%20Arte%20Multimedial!5e0!3m2!1ses!2sar!4v1700851026217!5m2!1ses!2sar"
        width="600" height="400" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../service/firebase';
import { getUserProfileById } from '../service/user'; // Asegúrate de que la ruta sea correcta

export default {
  data() {
    return {
      faqs: [
        {
          question: '¿Cómo puedo crear una cuenta en su plataforma?',
          answer: 'Puedes crear una cuenta haciendo clic en "Registrarse" en la esquina superior derecha de la página de inicio. Luego, sigue las instrucciones para completar el proceso de registro.',
          showAnswer: true, // Abierto por defecto
        },
        {
          question: 'Olvidé mi contraseña. ¿Cómo puedo restablecerla?',
          answer: 'Para restablecer tu contraseña, ve a la página de inicio de sesión y haz clic en "Olvidé mi contraseña". Sigue las instrucciones enviadas a tu correo electrónico registrado para restablecer tu contraseña.',
          showAnswer: false,
        },
        {
          question: '¿Cómo puedo contactar al servicio de atención al cliente?',
          answer: 'Puedes contactarnos a través de nuestro formulario de contacto en la página de soporte. También ofrecemos asistencia por correo electrónico en support@tudominio.com y atención telefónica en el número +123456789.',
          showAnswer: false,
        },
      ],
      isUserPremium: false,
    };
  },
  mounted() {
  this.checkUserPremiumStatus(); // Verifica el estado premium cuando el componente se monta
  auth.onAuthStateChanged(user => {
    if (user) {
      this.checkUserPremiumStatus(); // Verifica el estado premium cuando cambia la autenticación
    }
  });
},

  methods: {
    async checkUserPremiumStatus() {
  try {
    const user = auth.currentUser;
    if (user) {
      const userProfile = await getUserProfileById(user.uid);
      this.isUserPremium = userProfile.premium;
    }
  } catch (error) {
    console.error('Error al verificar el estado premium:', error);
  }
}

    ,
    toggleAnswer(index) {
      this.faqs.forEach((faq, i) => {
        faq.showAnswer = index === i ? !faq.showAnswer : false;
      });
    },
    // ... otros métodos que puedas necesitar ...
  },
};
</script>

<style scoped>
body {
  font-family: 'Montserrat', sans-serif;
}

.premium-link {
  text-decoration: none;
  color: green;
}

h3 {
  color: rgb(80, 80, 248);
  text-align: center;
}

.question {
  cursor: pointer;
}

.arrow-down::before,
.arrow-up::before {
  content: '\25BC';
  /* Flecha hacia abajo en Unicode */
  display: inline-block;
  margin-left: 5px;
}

.arrow-up::before {
  content: '\25B2';
  /* Flecha hacia arriba en Unicode */
}

.open .answer {
  max-height: 200px;
  padding: 16px;
}

.answer {
  max-height: 0px;
  overflow: hidden;
  padding: 0px;
  transition: all .3s ease 0s;
}

.arrow-down::before {
  content: '\25B2';
  transform: rotate(90deg);
  transition: all .3s ease 0s;
}

.open .arrow-up::before {
  transform: rotate(180deg);
  transition: all .3s ease 0s;
}

/* Estilo para las imágenes */
.icon-image {
  max-width: 80px;
  /* Ajusta el tamaño máximo de las imágenes */
  margin: 0 10px;
  /* Ajusta la separación entre las imágenes */
}
</style>
