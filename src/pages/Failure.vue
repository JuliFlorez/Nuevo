<template>
    <div class="payment-failure">
        <h1>¡Pago fallido!</h1>
        <p>Lo sentimos, tu pago no pudo ser procesado. Por favor, intenta nuevamente.</p>
        <p>Serás redirigido en unos segundos...</p>
    </div>
</template>

<script>
export default {
    name: 'Failure',
    mounted() {
        setTimeout(() => {
            this.redirectToPage();
        }, 5000);
    },
    methods: {
        redirectToPage() {
            window.location.href = "/premium";
        }
    }
};
</script>

<style scoped>
.payment-failure {
    text-align: center;
    margin-top: 50px;
    padding: 20px;
}

h1 {
    color: #f44336; 
    font-size: 24px;
}

p {
    color: #333;
    font-size: 18px;
    margin-top: 10px;
}
</style>
