<script setup>
import { ref, inject, onUnmounted, defineProps } from 'vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseLabel from '../components/BaseLabel.vue';
import LoadingContext from '../components/LoadingContext.vue';
import UserProfileData from '../components/UserProfileData.vue';
import { useAuth } from '../composition/useAuth';
import { editUser, editUserImage } from '../service/auth';
import { editUserProfile } from '../service/user';

defineProps({
    user: {
        type: Object,
        required: true,
    },
});

const { setNotification } = inject('notification');

const { user } = useAuth();

const {
    editing,
    editData,
    processingEdit,
    handleEdit,
    handleShowEdit,
    handleHideEdit,
} = useEditProfile(user);

const {
    editingAvatar,
    avatarData,
    processingAvatarEdit,
    handleShowAvatarEdit,
    handleHideAvatarEdit,
    handleAvatarEdit,
    handleAvatarChange,
} = useAvatarEditForm(user);



function useEditProfile(user) {
    const editing = ref(false);
    const editData = ref({
        displayName: '',
        height: '',
        weight: '',
        birthday: '',
        gender: '',
        goal: '',

    });
    const processingEdit = ref(false);

    const handleShowEdit = () => {
        editing.value = true;
        editData.value.displayName = user.value.displayName;
        editData.value.height = user.value.height;
        editData.value.weight = user.value.weight;
        editData.value.birthday = user.value.birthday;
        editData.value.gender = user.value.gender;
        editData.value.goal = user.value.goal;
    };
    const handleHideEdit = () => editing.value = false;

    const handleEdit = async () => {
        try {
            processingEdit.value = true;
            await editUserProfile(user.value.id, {
                displayName: editData.value.displayName,
                height: editData.value.height,
                weight: editData.value.weight,
                birthday: editData.value.birthday,
                gender: editData.value.gender,
                goal: editData.value.goal
            });

            setNotification({
                message: 'Tu información de perfil se actualizó correctamente.',
                type: 'success',
            });

            handleHideEdit(); 
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            setNotification({
                message: 'Ocurrió un error inesperado al tratar de actualizar tu información de perfil.',
                type: 'error',
            });
            console.error('Error al actualizar perfil:', error);
        } finally {
            processingEdit.value = false;
        }
    }


    return {
        editing,
        editData,
        processingEdit,
        handleEdit,
        handleShowEdit,
        handleHideEdit,
    }
}

function useAvatarEditForm(user) {
    const editingAvatar = ref(false);
    const avatarData = ref({
        file: null,
        preview: null,
    });
    const processingAvatarEdit = ref(false);

    const handleShowAvatarEdit = () => editingAvatar.value = true;
    const handleHideAvatarEdit = () => editingAvatar.value = false;
    const handleAvatarEdit = async () => {
        processingAvatarEdit.value = true;

        try {
            await editUserImage(avatarData.value.file);
        } catch (error) {
            console.error("[handleAvatarEdit] Error: ", error);
        }
        processingAvatarEdit.value = false;
    };

    const handleAvatarChange = event => {
        avatarData.value.file = event.target.files[0];
        const reader = new FileReader();

        reader.addEventListener('load', function () {
            avatarData.value.preview = reader.result;
        });

        reader.readAsDataURL(avatarData.value.file);
    }

    return {
        editingAvatar,
        avatarData,
        processingAvatarEdit,
        handleShowAvatarEdit,
        handleHideAvatarEdit,
        handleAvatarEdit,
        handleAvatarChange,
    }
}
</script>

<template>
    <LoadingContext :loading="!user.fullProfileLoaded">
        <div class="text-center tituloPrincipal">
            <h1 class="mb-4 text-5xl font-bold mt-6">Mi perfil</h1>
        </div>



        <template v-if="!editing && !editingAvatar">
            <div class="mb-4">
                <UserProfileData :user="user" />
            </div>
            <div class="text-end mb-3">
                <button class="btn btn-warning me-2" @click="handleShowEdit">
                    <i class="fa-solid fa-pen-to-square" style="color: #000000;"></i> Editar
                </button>
            </div>
        </template>

        <template v-else-if="editing">
            <div class="d-flex justify-content-center">
                <div class="card text-center" style="max-width: 700px; width: 80%;">
                    <div class="card-body">
                        <form @submit.prevent="handleEdit">
                            <div class="mb-3">
                                <label for="displayName" class="form-label">Nombre</label>
                                <input id="displayName" class="form-control" :disabled="processingEdit"
                                    v-model="editData.displayName" />
                            </div>
                            <div class="mb-3">
                                <label for="height" class="form-label">Altura</label>
                                <input id="height" class="form-control" :disabled="processingEdit" v-model="editData.height"
                                    type="text" inputmode="numeric" pattern="[0-9]*" />
                            </div>
                            <div class="mb-3">
                                <label for="weight" class="form-label">Peso</label>
                                <input id="weight" class="form-control" :disabled="processingEdit" v-model="editData.weight"
                                    type="text" inputmode="numeric" pattern="[0-9]*" />
                            </div>

                            <div class="mb-3">
                                <label for="birthday" class="form-label">Fecha de nacimiento</label>
                                <input id="birthday" type="date" class="form-control" :disabled="processingEdit"
                                    v-model="editData.birthday" />
                            </div>
                            <div class="mb-3">
                                <label for="gender" class="form-label">Género</label>
                                <select id="gender" class="form-select" :disabled="processingEdit"
                                    v-model="editData.gender">
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="meta" class="form-label">Meta</label>
                                <select id="meta" class="form-select" :disabled="processingEdit" v-model="editData.goal">
                                    <option value="">Seleccione una opción</option>
                                    <option value="Definicion">Definicion</option>
                                    <option value="Deficit">Deficit</option>
                                    <option value="Volumen">Volumen</option>
                                </select>
                            </div>
                            <button type="submit" :disabled="processingEdit" class="btn btn-primary me-2">
                                <span v-if="processingEdit" class="spinner-border spinner-border-sm" role="status"
                                    aria-hidden="true"></span>
                                Guardar datos
                            </button>
                            <button type="button" class="btn btn-danger" @click="handleHideEdit">Cancelar edición</button>
                        </form>
                    </div>
                </div>
            </div>
        </template>

    </LoadingContext>
</template>


<style scoped>
    .tituloPrincipal h1 {
        font-size: 2.5rem; 
        margin-top: 1.5rem; 
    }
</style>