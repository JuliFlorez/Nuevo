<template>
	<div id="example-calendar">
		<div class="calendar-controls" v-if="!route.params.id">
			<div class="box">
				<h4 class="title is-5"><img src="../img/nav/logo.png" alt=""></h4>
				<div class="notification" :class="{ 'is-active': state.clickedDay }" @click="showCurrentDate">
					{{ state.message || welcomeMessage }}
				</div>

				<div class="columns" >
					<div class="column is-half">
						<div class="field">
							<label class="label">Mes o semana</label>
							<div class="control">
								<div class="select is-fullwidth">
									<select v-model="state.displayPeriodUom" class="is-fullwidth">
										<option>mes</option>
										<option>semana</option>
									</select>
								</div>
							</div>
						</div>

						<div class="field">
							<label class="label">Comida</label>
							<div class="control">
								<input v-model="state.newItemTitle" class="input is-fullwidth" type="text" />
							</div>
						</div>

						<div class="field">
							<label class="label">Calorias</label>
							<div class="control">
								<input v-model="state.newItemCalories" class="input is-fullwidth" type="number" />
							</div>
						</div>
					</div>

					<div class="column is-half">
						<div class="field">
							<label class="label">Inicio</label>
							<div class="control">
								<div class="select is-fullwidth">
									<select v-model="state.startingDayOfWeek" class="is-fullwidth">
										<option v-for="(d, index) in dayNames" :key="index" :value="index">
											{{ d }}
										</option>
									</select>
								</div>
							</div>
						</div>

						<div class="field">
							<label class="label">Descripcion</label>
							<div class="control">
								<input v-model="state.newItemDescription" class="input is-fullwidth" type="text" />
							</div>
						</div>

						<div class="field">
							<label class="label">Hora</label>
							<div class="control">
								<input v-model="state.newItemTime" class="input is-fullwidth" type="time" />
							</div>
						</div>
					</div>
				</div>

				<div class="field">
					<label class="label">Fecha de inicio</label>
					<div class="control">
						<input v-model="state.newItemStartDate" class="input is-fullwidth" type="date" />
					</div>
				</div>
				<div class="containerBotones">
					<button class="button m-2 btnCalendar" @click="clickTestAddItem">Agregar</button>
					<button class="button m-2 btnCalendar" @click="shareCalendar"><i
							class="fa-solid fa-share-nodes"></i>
					</button>
				</div>

			</div>
		</div>

		<div class="calendar-parent">
			<CalendarView :items="state.items" :show-date="state.showDate"
				:time-format-options="{ hour: 'numeric', minute: '2-digit' }" :enable-drag-drop="true"
				:disable-past="state.disablePast" :disable-future="state.disableFuture" :show-times="state.showTimes"
				:date-classes="myDateClasses()" :display-period-uom="state.displayPeriodUom"
				:display-period-count="state.displayPeriodCount" :starting-day-of-week="state.startingDayOfWeek"
				:class="themeClasses" :period-changed-callback="periodChanged"
				:current-period-label="state.useTodayIcons ? 'icons' : ''"
				:displayWeekNumbers="state.displayWeekNumbers" :enable-date-selection="true"
				:selection-start="state.selectionStart" :selection-end="state.selectionEnd"
				@date-selection-start="setSelection" @date-selection="setSelection"
				@date-selection-finish="finishSelection" @drop-on-date="onDrop" @click-date="onClickDay"
				@click-item="onClickItem">
				<template #header="{ headerProps }">
					<CalendarViewHeader :header-props="headerProps" @input="setShowDate" />
				</template>
			</CalendarView>
		</div>
	</div>

	<div class="containerCalendar" v-if="!route.params.id">
		<div class="card is-small" v-if="!state.userPremium">
			<div class="card-content">
				<p>Hacete premium ahora para disfrutar de mas opciones!</p>
			</div>
		</div>

		<div class="card is-small custom-card" v-else
			:class="{ 'has-text-danger': totalCalories > maxCal, 'has-text-success': totalCalories <= maxCal }">
			<div class="card-content">
				<p class="title custom-title">Total de Calorías del Mes</p>
				<p class="subtitle" :style="{ color: totalCalories > maxCal ? 'red' : 'green' }">{{ totalCalories }} /
					{{
					Math.floor(maxCal) }}</p>
				<p class="subtitle">Objetivo del Usuario: {{ state.userGoal }}</p>
				<p class="subtitle">Se recomienda que por días consumas {{Math.floor(maxCal/ 30 ) }}</p>
			</div>
		</div>


	</div>

	<div class="modal" :class="{ 'is-active': showModal }">
		<div class="modal-background" @click="closeModal"></div>
		<div class="modal-content">
			<div class="box">

				<template v-if="selectedModalItem">
					<div class="two-columns">
						<div class="row">
							<div class="column">
								<div class="item-details">
									<p><strong>Comida:</strong> {{ selectedModalItem.title }}</p>
									<p><strong>Descripción:</strong> {{ selectedModalItem.description }}</p>
									<p><strong>Calorías:</strong> {{ selectedModalItem.calories }}</p>
								</div>
							</div>
							<div class="column">
								<div class="item-details">
									<p><strong>Día:</strong> {{ formatDate(selectedModalItem.startDate) }}</p>
									<p><strong>Hora:</strong> {{ selectedModalItem.hora }}</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Formulario de edición -->
					<div v-if="editMode && editedItem.id === selectedModalItem.id" class="edit-form">
						<label for="title">Comida</label>
						<input v-model="editedItem.title" id="title" type="text" placeholder="Título" />

						<label for="description">Descripción</label>
						<input v-model="editedItem.description" id="description" type="text"
							placeholder="Descripción" />

						<label for="startDate">Día:</label>
						<input v-model="editedItem.startDate" type="date" id="startDate" required />

						<label for="calories">Calorías</label>
						<input v-model="editedItem.calories" id="calories" type="number" placeholder="Calorías" />

						<!-- Botones de guardar cambios y cancelar -->
						<div v-if="editMode && editedItem.id === selectedModalItem.id" class="edit-buttons">
							<button @click="saveEditedItem" class="btn-edit">Guardar cambios</button>
							<button @click="cancelEdit" class="btn-cancel">Cancelar</button>
						</div>
					</div>


					<!-- Botones de editar y eliminar -->
					<div class="edit-delete-buttons" v-if="!editMode || editedItem.id !== selectedModalItem.id">
						<button @click="editItem(selectedModalItem)" class="icon-button edit-button">
							<i class="far fa-pen-to-square"></i> Editar
						</button>
						<button @click="clickDeleteItem(selectedModalItem)" class="icon-button delete-button">
							<i class="far fa-calendar-xmark"></i> Eliminar
						</button>
					</div>
				</template>
			</div>
		</div>
		<button class="modal-close is-large" aria-label="close" @click="closeModal"></button>
	</div>


</template>

<script setup lang="ts">
import CalendarView from "./CalendarView.vue"
import CalendarViewHeader from "./CalendarViewHeader.vue"
import CalendarMath from "./CalendarMath"
import { ICalendarItem, INormalizedCalendarItem } from "./ICalendarItem"
import { calendarSave, calendarSubscribeToChanges, calendarDelete, calendarUpdate } from "./../service/calendar.js";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { onMounted, reactive, computed } from "vue"
import { getUserProfileById } from "./../service/user.js";
import { useRoute } from 'vue-router';

import { ref } from 'vue'
import { watch } from 'vue';

let welcomeMessage = "Haz clic en un día para más detalles.";
const sharedCalendarLink = ref('');

const route = useRoute();

let editMode = ref(false)
let editedItem = ref({}) 

let showModal = ref(false);
let selectedModalItem = ref(null)

const thisMonth = (d: number, h?: number, m?: number): Date => {
	const t = new Date()
	return new Date(t.getFullYear(), t.getMonth(), d, h || 0, m || 0)
}

interface IExampleState {
	showDate: Date
	message: string
	startingDayOfWeek: number
	disablePast: boolean
	disableFuture: boolean
	displayPeriodUom: string
	displayPeriodCount: number
	displayWeekNumbers: boolean
	showTimes: boolean
	selectionStart?: Date
	selectionEnd?: Date
	newItemTitle: string
	newItemStartDate: string
	newItemEndDate: string
	newItemCalories: string,
	newItemhora: string,
	newItemDescription: string,
	useDefaultTheme: boolean
	useHolidayTheme: boolean
	useTodayIcons: boolean
	items: ICalendarItem[]
}

const state = reactive({

	showDate: thisMonth(1),
	// items: [],
	message: "",
	startingDayOfWeek: 0,
	disablePast: false,
	disableFuture: false,
	displayPeriodUom: "mes",
	displayPeriodCount: 1,
	displayWeekNumbers: false,
	showTimes: true,
	selectionStart: undefined,
	selectionEnd: undefined,
	newItemTitle: "",
	newItemStartDate: "",
	newItemEndDate: "",
	useDefaultTheme: true,
	useHolidayTheme: true,
	useTodayIcons: false,

} as IExampleState)

const userLocale = computed((): string => CalendarMath.getDefaultBrowserLocale())

const dayNames = computed((): string[] => CalendarMath.getFormattedWeekdayNames(userLocale.value, "long", 0))

const cancelEdit = () => {
	editMode.value = false; // Desactiva el modo de edición
	editedItem.value = {}; // Restaura el item editado a su estado original
};


const themeClasses = computed(() => ({
	"theme-default": state.useDefaultTheme,
	"holiday-us-traditional": state.useHolidayTheme,
	"holiday-us-official": state.useHolidayTheme,
}))

const myDateClasses = (): Record<string, string[]> => {
	const o = {} as Record<string, string[]>
	const theFirst = thisMonth(1)
	const ides = [2, 4, 6, 9].includes(theFirst.getMonth()) ? 15 : 13
	const idesDate = thisMonth(ides)
	o[CalendarMath.isoYearMonthDay(idesDate)] = ["ides"]
	o[CalendarMath.isoYearMonthDay(thisMonth(21))] = ["do-you-remember", "the-21st"]
	return o
}


const totalCalories = computed(() => {
	if (!state.items || state.items.length === 0) {
		return 0;
	}
	const currentMonth = state.showDate.getMonth();
	let total = 0;
	state.items.forEach(item => {
		const itemDate = new Date(item.startDate);
		if (itemDate.getMonth() === currentMonth) {
			total += parseInt(item.calories);
		}
	});
	return total;
});


watch(() => state.showDate, (newDate) => {
	const currentDate = new Date();
	if (newDate.getMonth() !== currentDate.getMonth()) {
		state.message = '';
	}
});

const editItem = (item) => {
	console.log("Editando...", item);
	editMode.value = true;
	editedItem.value = { ...item }; 
};

const saveEditedItem = () => {
	console.log("Saving edited item:", editedItem.value);

	const editedData = {
		title: editedItem.value.title,
		startDate: editedItem.value.startDate,
		calories: editedItem.value.calories,
		hora: editedItem.value.hora,
		description: editedItem.value.description
	};

	// Llamar a calendarUpdate con el objeto plano
	calendarUpdate(editedItem.value.id, editedData)
		.then(() => {
			console.log("Item updated successfully!");
			editMode.value = false; 
			closeModal(); 
		})
		.catch((error) => {
			console.error("Error updating item:", error);
		});
};


const saveItem = () => {
	if (editedItem.value && editedItem.value.id) {
		if (editMode.value) {
			calendarUpdate(editedItem.value.id, editedItem.value)
				.then(() => {
					console.log("Item updated successfully!");
					editMode.value = false;
					closeModal();
				})
				.catch((error) => {
					console.error("Error updating item:", error);
				});
		}
	}
};

const shareCalendar = () => {
	const calendarData = {
		title: "Mi Calendario",
		items: state.items 
	};

	let eventText = "Mis eventos:\n";
	calendarData.items.forEach((event, index) => {
		eventText += `${index + 1}. ${event.title} - ${event.startDate} - ${event.endDate}\n`;
	});

	console.log('user id', state.userId)


	if (navigator.share) {
		navigator.share({
			title: calendarData.title,
			text: "¡Echa un vistazo a mi calendario!",
			url: `${route.matched[0].path}/${state.userId}`
		}).then(() => {
			console.log("Calendario compartido con éxito.");
		}).catch((error) => {
			console.error("Error al compartir el calendario:", error);
		});
	} else {
		alert("No es posible compartir el calendario en este dispositivo. Puedes copiar la URL del calendario y compartirla manualmente.");
	}
};


onMounted(async () => {
	const auth = getAuth();
	onAuthStateChanged(auth, async (user) => {
		if (user) {
			try {
				const userProfile = await getUserProfileById(user.uid);
				console.log("User profile:", userProfile);
				state.userId = userProfile.id;
				console.log("User's id:", state.userId);

				state.userGoal = userProfile.goal;
				console.log("User's goal:", state.userGoal);

				state.userGender = userProfile.gender;
				console.log("User's gender:", state.userGender);

				state.userHeight = userProfile.height;
				console.log("User's height:", state.userHeight);

				state.userWeight = userProfile.weight;
				console.log("User's weight:", state.userWeight);

				state.userPremium = userProfile.premium;
				console.log("User's premium:", state.userPremium);

				const calculateAge = (birthday) => {
					if (!birthday) return '';
					const today = new Date();
					const birthDate = new Date(birthday);
					let age = today.getFullYear() - birthDate.getFullYear();
					const month = today.getMonth() - birthDate.getMonth();
					if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
						age--;
					}
					return age;
				};
				state.userAge = calculateAge(userProfile.birthday);
				console.log("User's age:", state.userAge);

				calendarSubscribeToChanges((calendars) => {
					console.log("Received updated calendar data:", calendars);

					state.items = calendars.map((calendar) => ({
						id: calendar.id,
						startDate: calendar.startDate,
						calories: calendar.calories,
						hora: calendar.hora,
						title: calendar.title,
						description: calendar.description,
					}));
				}, route.params.id);
			} catch (error) {
				console.error("Error getting user profile:", error);
			}
		} else {
			console.error("User is not authenticated");
		}
	});

	const items = JSON.parse(localStorage.getItem('items') || '[]');
	state.items = items;
});

const maxCal = computed(() => {
	let basalMetabolism = 0;
	if (state.userGender === "Femenino") {
		basalMetabolism = 655 + (9.6 * state.userWeight) + (1.8 * state.userHeight) - (4.7 * state.userAge);
		console.log("Basal metabolism for female:", basalMetabolism);
	} else {
		basalMetabolism = 66 + (13.7 * state.userWeight) + (5 * state.userHeight) - (6.8 * state.userAge);
		console.log("Basal metabolism for male:", basalMetabolism);
	}

	let adjustedBasalMetabolism = basalMetabolism * 1.55;

	let maxCal = 0;
	switch (state.userGoal) {
		case "Volumen":
			maxCal = adjustedBasalMetabolism + 500;
			console.log("Max calories for male:", maxCal);
			break;
		case "Deficit":
			maxCal = adjustedBasalMetabolism - 250;
			break;
		case "Definicion":
			maxCal = adjustedBasalMetabolism - 500;
			break;
		default:
			console.log("User's goal is not recognized.");
			break;
	}
	maxCal = maxCal * 30;

	return maxCal;
});


const periodChanged = (): void => {
	// range, eventSource) {
	// Demo does nothing with this information, just including the method to demonstrate how
	// you can listen for changes to the displayed range and react to them (by loading items, etc.)
	//console.log(eventSource)
	//console.log(range)
}

const showItemModal = (item) => {
	selectedModalItem.value = item;
	showModal.value = true;
};
const closeModal = () => {
	selectedModalItem.value = {};
	showModal.value = false;
};

const formatDate = (date) => {
	return new Date(date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const clickTestAddItem = (): void => {
	console.log("Adding new calendar item...");

	const newItem = {
		startDate: state.newItemStartDate,
		title: state.newItemTitle,
		calories: state.newItemCalories,
		hora: new Date().toLocaleTimeString(),
		description: state.newItemDescription, 

	};

	console.log("New item to be saved:", newItem);

	calendarSave(newItem);

	state.message = "You added a calendar item!";
};

const clickDeleteAllCalendars = () => {
	console.log("Deleting all calendars...");

	state.items.forEach(calendar => {
		calendarDelete(calendar.id);
	});

	state.message = "All calendars deleted successfully!";
};


const getDailyCalories = (date) => {
	const formattedDate = date.toISOString().split('T')[0];
	const itemsForDate = state.items.filter(item => {
		const startDate = new Date(item.startDate);
		if (isNaN(startDate.getTime())) {
			console.error('Invalid date format for item:', item);
			return false;
		}
		const formattedStartDate = startDate.toISOString().split('T')[0];
		console.log('Comparing date:', formattedDate, 'with item date:', formattedStartDate);
		return formattedStartDate === formattedDate;
	});

	console.log('Items for date:', formattedDate, itemsForDate);

	const totalCalories = itemsForDate.reduce((total, item) => total + parseInt(item.calories), 0);
	console.log(`Total calories for ${formattedDate}: ${totalCalories}`);

	return totalCalories;
};


const onClickDay = (d: Date): void => {
	state.selectionStart = undefined;
	state.selectionEnd = undefined;
	state.message = `Ingresaste al: ${d.toLocaleDateString()}`;
	state.message += `\nCalorias: ${getDailyCalories(d)}`;
};



const onClickItem = (item: INormalizedCalendarItem): void => {
	state.message = `Ingresaste a: ${item.title}`
	showItemModal(item);
}

const clickDeleteItem = (item) => {
	console.log("Borrando elemento...");
	if (confirm("¿Estás seguro de que deseas borrar este elemento?")) {
		calendarDelete(item.id);
	}
};

const setShowDate = (d: Date): void => {
	state.message = `Changing calendar view to ${d.toLocaleDateString()}`
	state.showDate = d
}

const setSelection = (dateRange: Date[]): void => {
	state.selectionEnd = dateRange[1]
	state.selectionStart = dateRange[0]
}

const finishSelection = (dateRange: Date[]): void => {
	setSelection(dateRange)
	state.message = `You selected: ${state.selectionStart?.toLocaleDateString() ?? "n/a"} - ${state.selectionEnd?.toLocaleDateString() ?? "n/a"}`
}

const onDrop = (item: INormalizedCalendarItem, date: Date): void => {
	state.message = `Lo moviste al dia: ${date.toLocaleDateString()}`
	const eLength = CalendarMath.dayDiff(item.startDate, date)
	item.originalItem.startDate = CalendarMath.addDays(item.startDate, eLength)
	item.originalItem.endDate = CalendarMath.addDays(item.endDate, eLength)
}

</script>


<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css";

#example-calendar {
	display: flex;
	flex-direction: row;
	font-family: Calibri, sans-serif;
	width: 95vw;
	margin-top: 2%;
	margin-bottom: 2%;
	min-width: 30rem;
	max-width: 100rem;
	margin-left: auto;
	margin-right: auto;
}

.box {
	border: 2px solid #019640;
}

.calendar-controls {
	height: 100%;
	width: 25%;
	margin-top: 2px;
	margin-right: 2%;

}

.notification {
	background-color: #019640;
	color: white;
	font-size: 15px;
	font-weight: bold;
}

.add-panel {
	flex: 1;
	margin-right: 1rem;
	min-width: 14rem;
	max-width: 14rem;

}

.calendar-parent {
	flex-grow: 1;
	overflow-x: hidden;
	overflow-y: auto;
	background-color: #ffffff;
	border-radius: 3px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-card {
	width: 78%;
	border: 2px solid #019640;
	border-radius: 10px;
}

.containerCalendar {
	display: flex;
	justify-content: center;
	margin-bottom: 20px;
}
.custom-title {
	color: #333;
	font-weight: bold;
}

#example-calendar .cv-wrapper.period-month.periodCount-2 .cv-week,
#example-calendar .cv-wrapper.period-month.periodCount-3 .cv-week,
#example-calendar .cv-wrapper.period-year .cv-week {
	min-height: 6rem;
}

#example-calendar .theme-default .cv-item.birthday {
	background-color: #e0f0e0;
	border-color: #d7e7d7;
}

#example-calendar .theme-default .cv-item.birthday::before {
	content: "\1F382";
	margin-right: 0.5em;
}

.edit-delete-buttons {
	text-align: center;
}

.icon-button {
	padding: 10px 20px;
	margin: 0 10px;
	border: none;
	border-radius: 5px;
	cursor: pointer;
}

.edit-button {
	background-color: #4CAF50;
	color: white;
}

.delete-button {
	background-color: #f44336;
	color: white;
}

.icon-button i {
	margin-right: 5px;
}

.btnCalendar {
	background-color: #FF9F0D;
	color: black;
	border: 2px solid #FF9F0D;
	border-radius: 10px;
	padding: 10px 20px;
	font-size: 1.2em;
	cursor: pointer;
	transition: background-color 0.3s, color 0.3s;
}

.btnCalendar:hover {
	background-color: white;
	color: #FF9F0D;
}

.btnCalendar:focus {
	outline: none;
}

.item-details {
	margin-bottom: 20px;
}

.edit-delete-buttons {
	display: flex;
	justify-content: space-between;
}

.modal-content {
	max-width: 600px;
	margin: 0 auto;
	padding: 20px;
}

.edit-form {
	background-color: #f2f2f2;
	padding: 20px;
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	width: 300px;
	margin: auto;
}

.edit-form input,
.edit-form div {
	width: 100%;
	margin-bottom: 15px;
	padding: 10px;
	border-radius: 5px;
	border: 1px solid #ccc;
}

.edit-form button {
	width: 100%;
	padding: 10px;
	border: none;
	border-radius: 5px;

	color: white;
	cursor: pointer;
}

.btn-cancel {
	background-color: #ff6347;
	color: white;
	border: none;
	border-radius: 5px;
	padding: 10px 20px;
	cursor: pointer;
	transition: background-color 0.3s, color 0.3s;
	margin-top: 10px;
}

.btn-cancel:hover {
	background-color: #d13838;
}

.btn-cancel:focus {
	outline: none;
}

.btn-edit {
	background-color: #4CAF50;
	color: white;
	border: none;
	border-radius: 5px;
	padding: 10px 20px;
	cursor: pointer;
	transition: background-color 0.3s, color 0.3s;
	margin-right: 10px;
}

.btn-edit:hover {
	background-color: #45a049;
}

.btn-edit:focus {
	outline: none;
}

@media screen and (max-width: 500px) {

	#example-calendar {
		min-width: 17rem;
	}
}

@media screen and (max-width: 768px) {
	.box {
		width: 100%;
	}

	#example-calendar {
		width: 10%;
	}

	.calendar-controls {
		width: 10%;
		margin-right: 0;
	}
	.calendar-parent{
		width: 100%;
	}
	.custom-card {
		width: 100%;
	}

	.container {
		flex-direction: column;
		align-items: center;
	}

	.modal-content {
		max-width: 90%;
	}
}

@media screen and (max-width: 1000px) {
	#example-calendar {
		flex-direction: column;
	}

	.calendar-controls {
		width: 100%;
		margin-right: 0;
		margin-bottom: 20px;
	}

	.custom-card {
		width: 100%;
	}

	.container {
		flex-direction: column;
	}
}
</style>