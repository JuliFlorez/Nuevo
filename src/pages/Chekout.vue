<script>
import { auth } from '../service/firebase';
import { editUserProfile, getUserProfileById } from '../service/user';

export default {
    data() {
        return {
            paymentDetails: {
                name: '',
                card: '',
                expiry: '',
                cvc: '',
                amount: "Gratis"
            },
            successMessage: '',
            errors: {
                name: false,
                card: false,
                expiry: false,
                cvc: false
            }
        };
    },
    methods: {
        async submitPayment() {
            if (this.validateForm()) {
                console.log('Detalles del pago:', this.paymentDetails);
                // Primero verifica que el formulario sea válido
                try {
                    await this.updateMembership();
                    // Configura el mensaje de éxito
                    this.successMessage = "Prueba realizado con éxito. ¡Membresía actualizada!";
                } catch (error) {
                    console.error('Error al actualizar la membresía:', error);
                    this.successMessage = '';
                }
            } else {
                console.error('Formulario inválido');
                this.successMessage = '';
            }
        },
        // ...
// ...

// ...

async updateMembership() {
    try {
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

    } catch (error) {
        console.error('Error al actualizar la membresía:', error);
        throw error;
    }
}

// ...


// ...

        // ...
        ,
        validateForm() {
            this.errors.name = !this.paymentDetails.name;

            // Quitar espacios del número de la tarjeta para la validación
            const cardNumber = this.paymentDetails.card.replace(/\s/g, '');
            // Ajustar la expresión regular para validar 16 dígitos incluyendo espacios
            this.errors.card = !(cardNumber.length === 16 && /^\d{16}$/.test(cardNumber));

            this.errors.cvc = !/^\d{3}$/.test(this.paymentDetails.cvc);
            this.validateExpiryDate();

            return !Object.values(this.errors).some(e => e);
        },
        validateExpiryDate() {
            const expiryDate = new Date(this.paymentDetails.expiry);
            const currentDate = new Date();

            // La fecha de vencimiento debe ser posterior a la fecha actual
            this.errors.expiry = expiryDate <= currentDate;
        },
        filterNumeric(event) {
            let value = event.target.value;
            let newValue = '';

            // Eliminar todos los caracteres que no sean dígitos
            for (let i = 0; i < value.length; i++) {
                if (!isNaN(value[i]) && value[i] !== ' ') {
                    newValue += value[i];
                }
            }
            
            // Si el campo es el número de tarjeta, formatearlo
            if (event.target.id === 'card') {
                // Agregar un espacio cada 4 dígitos, excepto al final
                newValue = newValue.replace(/(\d{4})(?=\d)/g, '$1 ');
            }

            // Actualizar el valor con el formato correcto
            if (event.target.id === 'card') {
                this.paymentDetails.card = newValue;
            } else if (event.target.id === 'cvc') {
                this.paymentDetails.cvc = newValue;
            }
        },
    }
};

</script>

<template>
    <div class="payment-form">
        <form @submit.prevent="submitPayment">
            <div>
                <label for="name">Nombre:</label>
                <input type="text" id="name" v-model="paymentDetails.name" required>
            </div>
            <div>
                <label for="card">Tarjeta:</label>
                <input type="text" id="card" v-model.number="paymentDetails.card" @input="filterNumeric" required
                    maxlength="19">
            </div>
            <div class="card-details">
                <div>
                    <label for="expiry">Vencimiento:</label>
                    <input type="date" id="expiry" v-model="paymentDetails.expiry" required>
                </div>
                <div>
                    <label for="cvc">Código de Seguridad:</label>
                    <input type="text" id="cvc" v-model.number="paymentDetails.cvc" @input="filterNumeric" required
                        maxlength="3">
                </div>
            </div>
            <div>
                <label for="amount">Precio:</label>
                <input type="text" id="amount" v-model.number="paymentDetails.amount" readonly required>
            </div>
            <div v-if="errors.name" class="error-message">Por favor, ingrese un nombre válido.</div>
            <div v-if="errors.card" class="error-message">Número de tarjeta inválido.</div>
            <div v-if="errors.expiry" class="error-message">Fecha de vencimiento inválida.</div>
            <div v-if="errors.cvc" class="error-message">Código CVC inválido.</div>
            <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
            <button type="submit">Pagar</button>
        </form>
    </div>
</template>

<style scoped>
.success-message {
    margin-top: 10px;
    color: green;
    font-weight: bold;
}

.payment-form {
    border: 1px solid #1c5e1c;
    margin: 100px;
    padding: 20px;
    border-radius: 6px;
}

.payment-form div {
    margin-bottom: 10px;
}

.card-details {
    display: flex;
    justify-content: space-between;
}

.card-details div {
    flex: 1;
    margin-right: 10px;
    /* Espacio entre los campos */
}

.card-details div:last-child {
    margin-right: 0;
    /* Evita espacio adicional en el último elemento */
}

input[type="text"],
input[type="number"],
input[type="date"] {
    /* Agrega input[type="date"] */
    width: 100%;
    padding: 8px;
    margin-top: 4px;
    box-sizing: border-box;
}

button {
    background-color: #1c5e1c;
    color: white;
    padding: 5px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
}
</style>
  