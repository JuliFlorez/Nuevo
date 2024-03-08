<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from './composition/useAuth';
import { logout } from './service/auth.js';
import { ref, provide, readonly } from 'vue';


const { handleLogout } = useLogout();
const { user } = useAuth();

const notification = ref({
  message: null,
  type: 'success',
});

function setNotification(data) {
  notification.value = { ...data };
  if (data.message) {
    var toast = new bootstrap.Toast(document.getElementById('liveToast'));
    toast.show();
  }
}




provide('notification', {
  notification: readonly(notification),
  setNotification,
});

function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push({ path: '/iniciar-sesion' });
  }

  return {
    handleLogout,
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <button class="navbar-toggler shadow-none border-0" type="button" data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <router-link to="/">
        <img src="./img/nav/logo.webp" alt="" class="logo">
      </router-link>

      <div class="sidebar offcanvas offcanvas-start m-2 containerH" tabindex="-1" id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header text-white border-bottom">
          <h5 class="offcanvas-title custom-title" id="offcanvasNavbarLabel">NutriTrack</h5>
          <button type="button" class="btn-close btn-close-white shadow-none" data-bs-dismiss="offcanvas"
            aria-label="Close"></button>
        </div>

        <div class="offcanvas-body d-flex flex-column flex-lg-row p-4 p-lg-0 navGeneral">
          <ul class="navbar-nav d-flex justify-content-center align-items-center fs-5 flex-grow-1 custom-nav">
            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/Calendario">Calendario</router-link>
            </li>
            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/Comida">Comidas</router-link>
            </li>
            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/Soporte">Soporte</router-link>
            </li>
            <li class="nav-item mx-2" v-if="user.isAdmin">
              <router-link class="nav-link" to="/Usuarios">Usuarios</router-link>
            </li>
          </ul>

          <div class="navbar-nav ms-auto">
            <template v-if="user.id !== null">
              <div class="d-flex flex-column flex-md-row align-items-center justify-content-center">
                <router-link to="/premium" class="text-decoration-none m-2 rounded-4 premium-btn neon-btn">
                  <span>Premium</span>
                  <img src="./img/nav/estrellas.png" alt="" class="stars-img">
                </router-link>

                <router-link to="/perfil" class="btn btn-outline-primary btn-profile">
                  {{ user.displayName }}
                </router-link>

                <form action="" @submit.prevent="handleLogout">
                  <button type="submit" class="btn btn-logout m-2">
                    <i class="fas fa-door-open me-2" style="font-size: 20px;"></i> Salir
                  </button>
                </form>
              </div>
            </template>

            <template v-else>
              <div class="d-flex flex-column flex-lg-row justify-content-center align-items-center gap-3 botones m-2">
                <router-link to="/registro" class="btn-custom">Registrarse</router-link>

                <router-link to="/iniciar-sesion" class="neon-btn">Iniciar Sesión</router-link>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <div v-if="notification.message != null" class="toast-container position-fixed bottom-0 end-0 p-3">
    <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <img src="../src/img/icon/icon.png" class="rounded me-2 imgNotification" alt="Logo">
        <strong class="me-auto">NutriTrack</strong>
        <small>Ahora</small>
        <button type="button" class="btn-close btnCerrarNoti" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body m-2 mr-2">
        {{ notification.message }}
      </div>
    </div>
  </div>


  <main>
    <router-view></router-view>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-row">
        <div class="footer-links">
          <h4>NutriTrack</h4>
          <ul>
            <li><router-link to="/soporte#nosotros">Nosotros</router-link></li>
            <li><router-link to="/soporte#servicios">Nuestros servicios</router-link></li>
            <li><router-link to="/soporte#privacidad">Politica de privacidad</router-link></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Usuario</h4>
          <ul>
            <li><router-link to="/soporte#registrarte">¿No podes registrarte?</router-link></li>
            <li><router-link to="/soporte#iniciar-sesion">¿No podes iniciar seccion?</router-link></li>
            <li><router-link to="/soporte#error-perfil">Error en mi perfil</router-link></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Ayuda</h4>
          <ul>
            <li><router-link to="/soporte#preguntas-frecuentes">Preguntas Frecuentes</router-link></li>
            <li><router-link to="/soporte#calendario">Sistema Del Calendario</router-link></li>
            <li><router-link to="/soporte#comidas">Sistema De Comidas</router-link></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Seguinos</h4>
          <div class="socials-links">
            <div class="socials-links">
              <a href="https://www.facebook.com/profile.php?id=61556732297650&sk=about"><i
                  class="fa-brands fa-facebook"></i></a>
              <a href="https://www.instagram.com/nutritrackdv/"><i class="fa-brands fa-instagram"></i></a>
              <a href="https://twitter.com/NutriTrackdv"><i class="fa-brands fa-twitter"></i></a>
            </div>

          </div>
        </div>
      </div>
    </div>

  </footer>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
  list-style: none;
}

nav {
  font-size: medium;
}

.logo {
  width: 80px;
  height: auto;
  max-width: 80px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
}

.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #fff;
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.navbar-brand img {
  max-width: 100%;
  height: auto;
}

.imgNotification {
  margin: 4px;
  margin-left: 5px;
  width: 20px;
  height: 20px;
}

.btnCerrarNoti {
  margin-right: 20px;
}

.nav-link:hover {
  border-bottom: 2px solid white;
}

.btn-logout {
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background-color: #c82333;
  color: #fff;
}

.btn-profile {
  margin: 10px;
  color: #fff;
  background-color: transparent;
  border-color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  transition: background-color 0.3s, color 0.3s;
}

.btn-profile:hover {
  background-color: #fff;
  color: #ff9100;
}

.neon-btn {
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  border: 2px solid #ff9100;
  color: #ff9100;
  padding: 8px 16px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: color 0.3s, border-color 0.3s;
}

.neon-btn::before,
.neon-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transition: opacity 0.5s ease-in-out;
}

.neon-btn::before {
  opacity: 0;
  mix-blend-mode: overlay;
}

.neon-btn:hover::before {
  opacity: 1;
}

.neon-btn:hover {
  color: #fff;
  border-color: #fff;
}

.premium-btn:hover .stars-img {
  animation: neonStars 1.5s ease-in-out infinite alternate;
}

.plus {
  color: #ff9100;
}

.stars-img {
  width: 25px;
  height: 25px;
  margin-left: 5px;
  opacity: 1;
  transition: opacity 0.3s;
}

.neon-btn:hover .stars-img {
  opacity: 1;
}

@keyframes neonStars {
  0% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.5);
  }

  100% {
    filter: brightness(1);
  }
}


.btn-custom {
  display: inline-block;
  padding: 8px 16px;
  background-color: #FFA500;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  border-radius: 50px;
  transition: background-color 0.3s, color 0.3s;
}

.btn-custom:hover {
  background-color: #fff;
  color: #FFA500;
}

.botones {
  margin: 10px;
  margin-top: -1px;
}

.container {
  max-width: 1200px;
  margin: 10px auto;
}

.footer {
  background-color: #24262B;
  padding: 80px 0;
}

.footer-row {
  display: flex;
  flex-wrap: wrap;
}

.footer-links {
  width: 25%;
  padding: 0 15px;
}

.footer-links h4 {
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 25px;
  font-weight: 500;
  border-bottom: 2px solid #FF9F0D;
  padding-bottom: 10px;
  display: inline-block;

}

.footer-links ul li a {
  font-size: 18px;
  text-decoration: none;
  color: #BBBBBB;
  display: block;
  margin-bottom: 15px;
  transition: all .3 ease;
}

.footer.links ul li a:hover {
  color: #ffffff;
  padding-left: 6px;
}

.socials-links a {
  display: inline-block;
  min-height: 40px;
  width: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 10px 10px 0;
  text-align: center;
  line-height: 40px;
  border-radius: 50%;
  color: #ffffff;
  transition: all .5s ease;
}

.socials.links a:hover {
  background-color: #FF9F0D;
}

.navbar .container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
}

.navbar .container a {
  display: flex;
  justify-content: center;
  align-items: center;
}

@media only screen and (max-width: 1024px) {

  .navbar-nav {
    display: flex;
    align-items: center;
  }

  .navbar-brand {
    margin: -25px 0;
  }

}



@media(max-width: 991px) {


  .sidebar.offcanvas {
    left: -8px;
    right: auto;
    width: 50%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
  }

  .btn-close {
    margin-left: 65%;
  }

  .navbar-nav.ms-auto {
    margin-right: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .navbar-brand {
    margin: 0 auto;
    text-align: center;
  }

  .custom-title {
    font-size: 20px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
  }

  .footer-row {
    text-align: center;
  }

  .footer-links {
    width: 100%;
    margin-bottom: 30px;
  }

  .premium-btn {
    color: #fff;
    background-color: transparent;
    border: 2px solid #FF9F0D;
    padding: 8px 16px;
    border-radius: 25px;
    transition: all 0.3s;
    text-align: center;
    width: fit-content;
    margin: 10px auto;
  }

  .premium-btn:hover {
    background-color: #FF9F0D;
    color: #fff;
  }

  .botones {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
  }

  .btn-logout {
    margin-top: 10px;
  }

  .offcanvas-title {
    font-weight: 120px;
  }
}

@media (max-width: 767px) {

  .logo {
    width: 80px;
    height: auto;
    max-width: 80px;
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
  }

  .sidebar.offcanvas {
    left: -8px;
    right: auto;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
  }

  .btn-close {
    margin-left: 60%;
  }

  .navbar-nav.ms-auto {
    margin-right: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

}

@media (max-width: 426px) {
  .logo {
    margin: 0 auto;
    display: block;
  }
}
</style>
