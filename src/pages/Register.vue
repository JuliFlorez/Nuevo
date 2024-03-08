<script>
import { onMounted, inject } from 'vue';
import { register } from '../service/auth.js';
import { doc, setDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      form: {
        displayName: '',
        gender: '',
        birthday: '',
        height: '',
        weight: '',
        goal: '',
        email: '',
        password: '',
        isAdmin: false,
        Premium: false,
      },
      editData: {
        goal: '',
      },
      processingEdit: false,
      setNotification: null,
    };
  },

  methods: {
    async handleSubmit() {
      const { email, password, displayName, height, weight, birthday, gender, goal } = this.form;

      if (password.length < 6) {
        console.error("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      try {
        const user = await register({ email, password, displayName, height, weight, birthday, gender, goal });
        this.form.displayName = displayName;
        console.log("Nombre de usuario:", displayName);

        this.$router.push({ path: '/' });

        this.setNotification({
          message: '¡Registro exitoso! Ya creaste tu perfil.',
          type: 'success',
        });

      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.error("La dirección de correo electrónico ya está registrada. Por favor, inicia sesión en lugar de registrarte nuevamente.");

          this.setNotification({
            message: 'La dirección de correo electrónico ya está registrada. Por favor, inicia sesión en lugar de registrarte nuevamente.',
            type: 'error',
          });

        } else {
          console.error("Error en el registro:", error);

          this.setNotification({
            message: 'Error en el registro. Por favor, intenta nuevamente.',
            type: 'error',
          });
        }
      }
    },


    showNotification(message, type) {
      const { setNotification } = this.$options.setup();
      setNotification({
        message,
        type,
      });
    },

    getCurrentDate() {
      const currentDate = new Date().toISOString().split("T")[0];
      return currentDate;
    },
  },

  setup() {
    const { notification, setNotification } = inject('notification');

    return {
      notification,
      setNotification,
    };
  },


  mounted() {
    const btnNext = document.querySelector('form .btnMover .siguiente');
    const btnBack = document.querySelector('form .btnMover .atras');
    const indicator = document.querySelector('.indicator .line span');
    const indicatorItems = document.querySelectorAll('.indicator p');
    const form = document.querySelector('form');
    const allTab = document.querySelectorAll('form .tab');
    let i = 0;

    allTab[i].classList.add('show');
    indicator.style.width = i;
    indicatorItems[i].classList.add('active');

    if (i === 0) {
      btnBack.style.display = 'none';
    } else {
      btnBack.style.display = 'block';
    }

    btnNext.addEventListener('click', function () {
      const allInputPerTab = allTab[i].querySelectorAll('input');
      for (let n = 0; n < allInputPerTab.length; n++) {
        allInputPerTab[n].addEventListener('input', function () {
          allInputPerTab[n].style.borderColor = '#ddd';
        })

        if (allInputPerTab[n].value === '' || !allInputPerTab[n].checkValidity()) {
          allInputPerTab[n].style.borderColor = '#de0a26';
          return false;
        } else {
          allInputPerTab[n].style.borderColor = '#ddd';
        }
      }

      i += 1;

      if (i >= allTab.length) {
        form.siguiente();
        return false;
      } else {
        for (let n = 0; n < allTab.length; n++) {
          allTab[n].classList.remove('show');
          indicatorItems[n].classList.remove('active');
        }

        for (let n = 0; n < i; n++) {
          indicatorItems[n].classList.add('active');
        }

        allTab[i].classList.add('show');
        indicator.style.width = `${i * 50}%`;
        indicatorItems[i].classList.add('active');
      }

      btnBack.style.display = 'block';

      if (i === allTab.length - 1) {
        btnNext.style.display = 'none';
        document.querySelector('.btnLogin').style.display = 'block';
      } else {
        btnNext.style.display = 'block';
        document.querySelector('.btnLogin').style.display = 'none';
      }
    });

    btnBack.addEventListener('click', function () {
      i -= 1;

      for (let n = 0; n < allTab.length; n++) {
        allTab[n].classList.remove('show');
        indicatorItems[n].classList.remove('active');
      }

      for (let n = 0; n < i; n++) {
        indicatorItems[n].classList.add('active');
      }

      allTab[i].classList.add('show');
      indicator.style.width = `${i * 50}%`;
      indicatorItems[i].classList.add('active');

      if (i === 0) {
        btnBack.style.display = 'none';
      } else {
        btnBack.style.display = 'block';
      }

      if (i === allTab.length - 1) {
        btnNext.style.display = 'none';
        document.querySelector('.btnLogin').style.display = 'block';
      } else {
        btnNext.style.display = 'block';
        document.querySelector('.btnLogin').style.display = 'none';
      }
    });

    document.querySelector('.btnLogin').style.display = 'none';

    this.setNotification = this.$options.setup().setNotification;
  }
};

</script>

<template>

  <div class="container">
    <div class="img">
      <img src="../img/cuenta/register.svg" alt="">
    </div>
    <div class="register-container">
      <img class="avatar" src="../img/cuenta/perfil.svg" alt="">
    </div>
    <h1 class="title">Registro</h1>
    <div class="indicator">
      <span class="line"><span></span></span>
      <p class="active">1</p>
      <p>2</p>
      <p>3</p>
    </div>
    <form action="#" @submit.prevent="handleSubmit">

      <div class="show tab">
        <div class="form">
          <label for="nombre">Nombre</label>
          <input class="input" type="text" id="nombre" v-model="form.displayName" placeholder="Nombre" required>
        </div>
        <div class="form">
          <label for="genero">Género</label>
          <select id="genero" class="form-select" v-model="form.gender" style="padding: 10px;">
            <option value="">Seleccione una opción</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>
        <div class="form">
          <label for="nacimiento">Fecha De Nacimiento</label>
          <input class="date" type="date" id="nacimiento" v-model="form.birthday" placeholder="Fecha De Nacimiento"
            max="{{ getCurrentDate() }}" required>
        </div>
      </div>

      <div class="tab">
        <div class="form">
          <label for="altura">Altura (cm)</label>
          <input class="input" type="text" id="altura" v-model="form.height" placeholder="Altura" required>
        </div>
        <div class="form">
          <label for="peso">Peso (kl)</label>
          <input class="input" type="text" id="peso" v-model="form.weight" placeholder="Peso" required>
        </div>
        <div class="form">
          <label for="meta">Meta</label>
          <select id="meta" class="form-select" v-model="form.goal" style="padding: 10px;">
            <option value="">Seleccione una opción</option>
            <option value="Volumen">Volumen</option>
            <option value="Deficit">Déficit calórico</option>
            <option value="Definicion">Definición</option>
          </select>
        </div>

      </div>
      <div class="tab">
        <div class="form">
          <label for="email">Email</label>
          <input class="input" type="text" id="email" v-model="form.email" placeholder="Emial" required>
        </div>
        <div class="form">
          <label for="contraseña">Contraseña</label>
          <input class="input" type="password" id="contraseña" v-model="form.password" placeholder="Contraseña" required>
        </div>

      </div>
      <div class="btnMover">
        <button type="button" class="atras">Atras</button>
        <button type="button" class="siguiente">Siguiente</button>
      </div>

      <div class="form">
        <button type="submit" class="btnLogin">Crear Cuenta</button>
      </div>
    </form>
  </div>
</template>


<style scoped>
.admin-container {
  display: flex;
  align-items: center;
}

.admin-label {
  margin-right: 10px;
}

.input {
  margin-top: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 9999;
}

.img img {
  position: absolute;
  top: 300px;
  left: 0;
  margin-left: 190%;
  width: 500px;
}

.avatar {
  width: 100px;
}

.container {
  width: 30%;
  margin-left: 9%;
  padding: 18px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3%;
  margin-bottom: 4%;
}

.container .title {
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 36px;
  color: #333;
}

.indicator {
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 24px;
}

.indicator .line {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background: #ddd;
  width: 100%;
  left: 0;
  z-index: 10;
}

.indicator .line span {
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  width: 0;
  background: #32be8f;
}

.indicator p {
  position: relative;
  z-index: 20;
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 50%;
  transition: .3s;
}

.indicator p.active {
  border-color: #32be8f;
  color: #32be8f;
}

.titleForm {
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 36px;
  color: #333;
}

.tab {
  display: none;
}

.tab.show {
  display: block;
}

.tab p {
  margin-bottom: 18px;
}

form .tab .form {
  margin-bottom: 18px;
  width: 100%;
}

.tab .form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}



form .btnMover {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

form .btnMover button {
  padding: 10px 30px;
  border: none;
  outline: none;
  cursor: pointer;
  margin-left: 18px;
}

form .btnMover button.atras {
  background: #eee;
}

form .btnMover button.siguiente {
  background: #08a78f;
  color: #fff;
}

.btnLogin {
  display: block;
  width: 100%;
  height: 50px;
  border-radius: 25px;
  margin: 1rem 0;
  font-size: 1.2rem;
  outline: none;
  border: none;
  background-image: linear-gradient(to right, #32be8f, #38d39f, #32be8f);
  cursor: pointer;
  color: #fff;
  text-transform: uppercase;
  background-size: 200%;
  transition: 0.5s;
}

.btnLogin:hover {
  background-position: right;
}

@media (max-width: 1024px) {
  .container {
    width: 30%;
    margin-left: 3%;
  }

  .wave {
    top: 5.2%;
  }

  .img img {
    position: absolute;
    top: 400px;
    left: 0;
    margin-left: 200%;
    width: 500px;
  }
}

@media (max-width: 768px) {
  .container {
    width: 70%;
    margin-left: auto;
    margin-right: auto;
  }

  .img img,
  .wave {
    display: none;
  }
}

@media (max-width: 320px) {

  .container {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    max-height: 100vh;
    overflow-y: auto;
  }

  form {
    max-width: 100%;
    padding: 10px;
  }

  .tab p {
    margin-bottom: 10px;
  }

  .tab .form input {
    padding: 8px;
  }
}
</style>