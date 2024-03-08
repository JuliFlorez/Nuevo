<script setup>
import { ref, provide, readonly, onMounted } from 'vue';

const showCheckoutButton = ref(true);
let mp;
// Agregar el SDK de MercadoPago
const sdkLoaded = ref(false);
const loadSDK = () => {
  const script = document.createElement('script');
  script.src = 'https://sdk.mercadopago.com/js/v2';
  script.onload = () => {
    sdkLoaded.value = true;
    mp = new MercadoPago('APP_USR-6173f5f6-44b6-4045-80d4-892c82a52fba', {
      locale: "es-AR",
    });
  };
  document.body.appendChild(script);
};

// Cargar el SDK al montar el componente
onMounted(() => {
  loadSDK();
  setTimeout(() => (
    handleCheckoutClick()
  ), 1000)
});

const createPreference = async (orderData) => {
  try {
    const response = await fetch("https://nutritrack-back.vercel.app/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    console.log("Preferencia creada:", data); 
    return data;
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    throw error;
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
const handleCheckoutClick = async () => {
  try {
    const orderData = {
      title: "Premium",
      quantity: 1,
      price: 1000,
    };

    const preference = await createPreference(orderData);
    console.log("Preferencia obtenida:", preference); 
    createCheckoutButton(preference.id);
    showCheckoutButton.value = false;
  } catch (error) {
    console.error("Error al manejar el checkout:", error); 
    alert("error :(");
  }
};
</script>
<template>
  <div class="d-flex justify-content-between">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Funciones Gratuitas</h5>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Seguimiento básico de tu ingesta diaria</li>
          <li class="list-group-item"><span class="rojo">X</span> Acceso ilimitado a recetas premium</li>
          <li class="list-group-item"><span class="rojo">X</span> Seguimiento avanzado de tu progreso</li>
          <li class="list-group-item"><span class="rojo">X</span> Asesoramiento personalizado de nutricionistas</li>
        </ul>
        <a href="#" class="btn btn-secondary mt-3">¡Explora Gratis!</a>
      </div>
    </div>
    <div class="card premium-card">
      <div class="card-body">
        <h5 class="card-title">Ventajas Premium</h5>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><span class="plus">+</span> Acceso ilimitado a recetas premium</li>
          <li class="list-group-item"><span class="plus">+</span>Seguimiento avanzado de tu progreso</li>
          <li class="list-group-item"><span class="plus">+</span>Asesoramiento personalizado de nutricionistas</li>
        </ul>
        <router-link to="/Chekout" class="btn btn-success mt-3">Proba premium</router-link>
        <img src="" alt="">
        <div id="wallet_container"></div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.card {
  width: 48%;
  margin: 20px 0;
}

.premium-card {
  border: 1px solid #FFD700;
}

.rojo {
  color: red;
  font-weight: bold;
}

.plus {
  color: #ff9100;
}

.btn {
  width: 100%;
}
</style>