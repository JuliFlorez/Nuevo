<script setup>
import BaseButton from '../components/BaseButton.vue';
import BaseLabel from '../components/BaseLabel.vue';
import BaseInput from '../components/BaseInput.vue';
import { login } from '../service/auth.js';
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const notification = ref({ message: null, type: 'success' });
const processingLogin = ref(false);
const form = ref({
    email: '',
    password: '',
});
const handleLogin = async () => {
    try {
        if (processingLogin.value) return;

        processingLogin.value = true;

        const message = await login({
            email: form.value.email,
            password: form.value.password,
        });

        setNotification({
            message: '¡Inicio de sesión exitoso!',
            type: 'success',
        });

        router.push({ path: '/' }); 

    } catch (error) {
        let errorMessage = 'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.';

        if (error.code === 'auth/invalid-login-credentials') {
            errorMessage = 'Credenciales de inicio de sesión no válidas. Verifica tu correo electrónico y contraseña.';
        } else {
            console.error("[LoginForm.vue handleLogin] Error al autenticar: ", error);
        }

        setNotification({
            message: errorMessage,
            type: 'error',
        });
    } finally {
        processingLogin.value = false;
    }
};

const showNotificationToast = (message) => {
   
    const toastElement = document.getElementById('liveToast');
    if (toastElement) {
        toastElement.querySelector('.toast-body').innerText = message;
      
        var toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
};

const setNotification = (data) => {
    notification.value = { ...data };
    if (notification.value.message) {
        showNotificationToast(notification.value.message);
    }
};


</script>

<template>

<Notification /> 
    <img class="wave" src="../img/cuenta/bg1.png" alt="" />

    <div class="container">
        <div class="img">
            <img src="../img/cuenta/login.svg" alt="" class="img" />
        </div>

        <div class="login-container">
            <form action="#" @submit.prevent="handleLogin">
                <img class="avatar" src="../img/cuenta/perfil.svg" alt="" />
                <h2>Bienvenido</h2>

                <div class="input-div one focus">
                    <div class="i">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h5>Email</h5>
                        <BaseInput type="email" id="email" :disabled="processingLogin" v-model="form.email"
                            placeholder="Email" required class="input" />
                    </div>
                </div>

                <div class="input-div two">
                    <div class="i">
                        <i class="fas fa-lock"></i>
                    </div>
                    <div>
                        <h5>Contraseña</h5>
                        <BaseInput type="password" id="password" :disabled="processingLogin" v-model="form.password"
                            placeholder="Contraseña" required class="input" />
                    </div>
                </div>
                <a href="#">Olvidaste la contraseña?</a>
                <BaseButton :loading="processingLogin" class="btnLogin">Ingresar</BaseButton>
            </form>
        </div>
    </div>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.wave {
    position: absolute;
    height: 100%;
    left: 0;
    bottom: 10;
    z-index: auto;
}

.container {
    width: 100vh;
    height: 100vh;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 7rem;
    padding: 0 2rem;
}

.img {
    display: flex;
    justify-content: center;
    align-items: center;
}

.img img {
    width: 400px;
}

.container {
    width: 73%;
    height: 100vh;
    display: flex;
    justify-content: flex-end;
    padding: 0 2rem;
}

.login-container {
    display: flex;
    align-items: center;
    text-align: center;
}



form {
    width: 360px;
}

form h2 {
    font-size: 2.9rem;
    text-transform: uppercase;
    margin: 15px 0;
    color: #333;
}

.avatar {
    width: 100px;
}

.input-div {
    position: relative;
    display: grid;
    grid-template-columns: 7% 93%;
    margin: 25px 0;
    padding: 5px 0;
    border-bottom: 2px solid #d9d9d9;
}

.input-div:after,
.input-div:before {
    content: "";
    position: absolute;
    bottom: -2px;
    width: 0;
    height: 2px;
    background-color: #38d39f;
    transform: 0.3s;
}

.input-div:after {
    right: 50%;
}

.input-div:before {
    left: 50%;
}

.input-div.focus .i i {
    color: #38d39f;
}

.input-div.focus div h5 {
    top: -5px;
    font-size: 15px;
}

.input-div.focus:after .input-div.focus:before {
    width: 50%;
}

.input-div .one {
    margin-top: 0;
}

.input-div .two {
    margin-bottom: 4px;
}

.i {
    display: flex;
    justify-content: center;
    align-items: center;
}

.i i {
    color: #d9d9d9;
    transition: 0.3s;
}

.input-div>div {
    position: relative;
    height: 45px;
}

.input-div>div h5 {
    position: relative;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    font-size: 18px;
    display: none;
    transition: 0.3s;
}

.input {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border: none;
    outline: none;
    background: none;
    padding: 0.5rem 0.7rem;
    font-size: 1.2rem;
    color: #555;
}

a {
    display: block;
    text-align: right;
    text-decoration: none;
    color: #999;
    font-size: 0.9rem;
    transition: 0.3s;
}

a:hover {
    color: #38d39f;
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

@media screen and (max-width: 1050px) {
    .container {
        grid-gap: 5rem;
    }
}

@media screen and (max-width: 1000px) {
    form {
        width: 290px;
    }

    form h2 {
        font-size: 2.4rem;
        margin: 8px 0;
    }

    .img img {
        width: 400px;
    }
}

@media screen and (max-width: 900px) {
    .container {
        display: flex;
        justify-content: center;
        width: 100%;
        grid-template-columns: 1fr;
        grid-gap: 1rem;
        padding: 0 1rem;
    }

    .img {
        display: none;
    }

    .wave {
        display: none;
    }

    form {
        width: 100%;
        max-width: 360px;
        margin: 0 auto;
    }

    form h2 {
        font-size: 2rem;
    }

    .avatar {
        width: 80px;
    }
}
</style>