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
            // Verificar si hay un usuario autenticado
            if (auth.currentUser) {
                const userID = auth.currentUser.uid;
                const newPremiumStatus = true;

                // Calcular la fecha de vencimiento (un mes a partir de ahora)
                const currentDate = new Date();
                const expiryDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

                console.log("Current Date:", currentDate);
                console.log("Expiry Date:", expiryDate);

                // Imprimir la fecha antes de actualizar la membresía
                console.log("Updating membership with expiry date:", expiryDate.toLocaleDateString()); // Formatea la fecha localmente

                // Agrega este console log para la fecha de caducidad
                console.log("Membership expiry date:", expiryDate.toLocaleDateString());

                // Actualizar la membresía en el componente del formulario de pago
                await editUserProfile(userID, { premium: newPremiumStatus, premiumExpiry: expiryDate });

                // Llamar a la función en auth.js para actualizar la fecha de vencimiento
                console.log("Membership updated to:", newPremiumStatus, "Expiry:", expiryDate.toLocaleDateString()); // Formatea la fecha localmente

                // Redirigir después de 5 segundos
                setTimeout(() => {
                    redirectToPage();
                }, 5000);
            } else {
                console.error('No hay usuario autenticado');
                // Manejar el caso en el que no hay usuario autenticado
            }
        } catch (error) {
            console.error('Error al actualizar la membresía:', error);
            throw error;
        }
    }

    const redirectToPage = () => {
        // Reemplaza "/perfil" con la URL a la que deseas redirigir
        window.location.href = "/perfil";
    }
</script>

<style scoped>
.payment-success {
    text-align: center;
    margin-top: 50px;
    padding: 20px; /* Añadir relleno alrededor del mensaje */
}

h1 {
    color: #4caf50; /* Color verde para el título */
    font-size: 24px;
}

p {
    color: #333; /* Color de texto oscuro */
    font-size: 18px;
    margin-top: 10px;
}
</style>
