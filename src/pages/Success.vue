<template>
    <div class="payment-success">
        <h1>¡Pago exitoso!</h1>
        <p>¡Gracias por tu compra!</p>
        <p>Serás redirigido en unos segundos...</p>
    </div>
</template>

<script setup>
    import { onMounted } from 'vue';
    import { auth } from '../service/firebase';
    import { editUserProfile } from '../service/user';

    onMounted(() => {
        setTimeout(function (){

            updateMembership();
        },1000)
    });

    const updateMembership = async () => {
        try {
            if (auth.currentUser) {
                const userID = auth.currentUser.uid;
                const newPremiumStatus = true;

                const currentDate = new Date();
                const expiryDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

                await editUserProfile(userID, { premium: newPremiumStatus, premiumExpiry: expiryDate });

                setTimeout(() => {
                    redirectToPage();
                }, 5000);
            } else {
                console.error('No hay usuario autenticado');
            }
        } catch (error) {
            console.error('Error al actualizar la membresía:', error);
            throw error;
        }
    }
    const redirectToPage = () => {
        window.location.href = "/perfil";
    }
</script>

<style scoped>
.payment-success {
    text-align: center;
    margin-top: 50px;
    padding: 20px;
}

h1 {
    color: #4caf50; 
    font-size: 24px;
}

p {
    color: #333;
    font-size: 18px;
    margin-top: 10px;
}
</style>
