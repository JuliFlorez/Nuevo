<template>

  <div class="container my-5">

    <div class="header-content container">
      <div class="header-info">
        <div class="header-txt">
          <h1>Bienvenido a soporte</h1>
          <p>En esta sección te ofrecemos ayuda para las dudas que te puedan surgir, incluido un chat personal que te
            dejamos en este botón.</p>
          <div v-if="!isUserPremium">
            <h3>Habla con un nutricionista ahora, solo para premiums!</h3>
          </div>
          <div v-if="isUserPremium">
            <router-link to="/usuario/JnmQZTUrzqd6V3vWFHq4wCNPMLS2/chat" class="btn btn-primary">
              Chat privado con Nutritrack
            </router-link>
          </div>
        </div>
        <div class="header-img">
          <img src="../img/soporte-svg.jpg" alt="">
        </div>
      </div>
    </div>


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

    <div class="text-center my-4 img-tuerca">
      <img src="../img/soporte-svg.jpg" alt="">
      <img src="../img/soporte-svg.jpg" alt="">
      <img src="../img/soporte-svg.jpg" alt="">
      <img src="../img/soporte-svg.jpg" alt="">
      <img src="../img/soporte-svg.jpg" alt="">
      <img src="../img/soporte-svg.jpg" alt="">
    </div>


    <div class="embed-responsive embed-responsive-16by9 text-center mt-4 ubication-map">
      <iframe class="embed-responsive-item"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.9928441539078!2d-58.398575124771355!3d-34.604342457530436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaea670d4e67%3A0x2198c954311ad6d9!2sDa%20Vinci%20%7C%20Primera%20Escuela%20de%20Arte%20Multimedial!5e0!3m2!1ses!2sar!4v1700851026217!5m2!1ses!2sar"
        width="600" height="400" style="max-width: 100%;" allowfullscreen="" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../service/firebase';
import { getUserProfileById } from '../service/user'; 

export default {
  data() {
    return {
      faqs: [
        {
          question: '¿Cómo puedo crear una cuenta en su plataforma?',
          answer: 'Puedes crear una cuenta haciendo clic en "Registrarse" en la esquina superior derecha de la página de inicio. Luego, sigue las instrucciones para completar el proceso de registro.',
          showAnswer: true,
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
    this.checkUserPremiumStatus(); 
    auth.onAuthStateChanged(user => {
      if (user) {
        this.checkUserPremiumStatus(); 
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
      }
    }

    ,
    toggleAnswer(index) {
      this.faqs.forEach((faq, i) => {
        faq.showAnswer = index === i ? !faq.showAnswer : false;
      });
    },
  },
};
</script>

<style scoped>
body {
  font-family: 'Montserrat', sans-serif;
}

.ubication-map {
  max-width: 100%;
}

.img-tuerca img {

  max-width: 100%;
  height: 100px;
}

.header-img {
  width: 50%;
}

.header-img img,
.nosotros-img img {
  max-width: 100%;
  height: 430px;
}

.header-info {
  display: flex;
  align-items: center;
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
  margin-bottom: 30px;
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
  display: inline-block;
  margin-left: 5px;
}

.arrow-up::before {
  content: '\25B2';

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

.icon-image {
  max-width: 80px;
  margin: 0 10px;
}

.card-header {
    color: white;
    background-color: #019640 !important;
}


@media (max-width: 600px) {
  .header-txt {
    text-align: center;
    z-index: 10;
    width: 100%;
    margin-bottom: 80px;
    padding: 20px;
  }

  .header-txt h1 {
    text-align: center;
    width: 100%;
    padding: 0 20px;
  }

  .header-img {
    display: none;
  }

  .container {
    padding: 0 10px;
  }

}
</style>
