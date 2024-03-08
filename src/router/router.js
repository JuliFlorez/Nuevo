import Home from '../pages/Home.vue';
import Calendar from '../pages/Calendar.vue';
import CalendarId from '../pages/Calendar.vue';
import Login from '../pages/Login.vue';
import Food from '../pages/Food.vue';
import Register from '../pages/Register.vue';
import Profile from '../pages/Profile.vue';
import Support from '../pages/Support.vue';
import Premium from '../pages/Premium.vue';
import PrivateChat from "../pages/PrivateChat.vue";
import FoodSave from '../pages/FoodSave.vue';
import UserTable from '../pages/UserTable.vue';
import Chekout from '../pages/Chekout.vue';
import UserProfileView from '../pages/UserProfileView.vue';
import UserProfileEdit from '../pages/UserProfileEdit.vue';
import Success from '../pages/Success.vue';
import Failure from '../pages/Failure.vue';
import Pending from '../pages/Pending.vue';

import { createRouter, createWebHistory } from 'vue-router';
import { subscribeToAuth } from '../service/auth';


const routes = [
    { path: '/',                component: Home, },
    { path: '/calendario',      component: Calendar, meta: { requiresAuth: true } },
    { path: '/calendario/:id',  component: CalendarId, },
    { path: '/comida',         
     component: Food,
     meta: { requiresAuth: true }, },
    { path: '/soporte',         component: Support, },
    { path: '/premium',         component: Premium, },
    { path: '/chekout',         component: Chekout, },    
    { path: '/success',         component: Success },
    { path: '/failure',         component: Failure },
    { path: '/pending',         component: Pending },
    
    {
        path: "/usuario/:id/chat",
        component: PrivateChat,
        meta: { requiresAuth: true },
      },
      {
        path: '/perfil/:userId',
        name: 'user-profile',
        component: UserProfileView,
        props: true // Permite pasar props a través de la ruta
      },
      {
        path: '/editar-perfil/:userId',
        name: 'UserProfileEdit',
        component: UserProfileEdit,
        props: true
      },
      
      
      
      
      
    { path: '/foodSave',           component: FoodSave, },
    { path: '/perfil',          component: Profile,     meta: {requiresAuth: true}, },
    { path: '/iniciar-sesion',  component: Login, },
    { path: '/usuarios',        component: UserTable },
    { path: '/registro',        component: Register, },
];

const router = createRouter({
    routes,
    history: createWebHistory(),
});

let user = {
    id: null,
    email: null,
}

subscribeToAuth(newUser => {
    user = {...newUser}
});

router.beforeEach((to, from) => {
    if(
        user.id === null &&
        to.meta?.requiresAuth
    ) {
        return {path: '/iniciar-sesion'}
    }
});

export default router;