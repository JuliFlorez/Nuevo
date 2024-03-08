<template>
    <div class="card-product-container">
      <div class="card-product">
        <div class="card">
          <img src="" alt="">
          <h3 class="name">BANANITA</h3>
          <p class="price">1 $</p>
          <button @click="processPayment">Comprar</button>
          <div id="wallet_container"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import MercadoPago from 'mercadopago';
  import { onMounted } from 'vue';
  
  const mp = new MercadoPago('APP_USR-6173f5f6-44b6-4045-80d4-892c82a52fba', {
    locale: "es-AR",
  });
  
  const processPayment = async () => {
    try {
      const orderData = {
        title: document.querySelector(".name").innerText,
        quantity: 1,
        price: 1,
      };
  
      const response = await fetch("http://localhost:3000/create_preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
  
      const preference = await response.json();
      createCheckoutButton(preference.id);
    } catch (error) {
      alert("error :(");
    }
  };
  
  const createCheckoutButton = (preferenceId) => {
    const bricksBuilder = mp.bricks();
  
    const renderComponent = async () => {
      if (window.checkoutButton) window.checkoutButton.unmount();
  
      await bricksBuilder.create("wallet", "wallet_container", {
        initialization: {
          preferenceId: preferenceId,
        },
        customization: {
          texts: {
            valueProp: 'smart_option',
          },
        },
      });
    };
  
    renderComponent();
  };
  
  onMounted(() => {
    console.log('Cliente de Mercado Pago configurado');
  });
  </script>
  
  <style scoped>
  /* Estilos*/
  </style>
  