<template>

    <div class="global-div">

        <div v-if="isAuthenticated">
            <nav class="py-2 bg-body-tertiary border-bottom">
                <div class="container d-flex flex-wrap">
                    <ul class="nav me-auto">
                        <li class="nav-item"><a href="#" class="nav-link link-body-emphasis px-2 active"
                                aria-current="page">{{ welcome }}, {{ username }}</a></li>
                    </ul>
                    <ul class="nav">
                        <li class="nav-item"><a href="#" class="nav-link link-body-emphasis px-2"
                                @click="logout">Logout</a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="vh-100 d-flex flex-column justify-content-center align-items-center">

            <div v-if="!isAuthenticated" style="width: 25rem;" class="mb-3">

            </div>

            <div style="width: 25rem;" class="login-div">
                <div class="card-body">
                    <div v-if="isAuthenticated">
                        <div class="mt-4">
                            <p class="text-start">Cargar ficheros por URL:</p>
                            <input type="text" v-model="modelUrl" class="form-control"
                                placeholder="Introduzca aquí la URL del fichero" />
                            <button class="btn btn-success mt-2 w-100" :disabled="!modelUrl"
                                @click="load3DModel(modelUrl)">Visualizar fichero</button>
                        </div>
                        <br /><br />
                        <p class="text-start mt-4">Ficheros de OneDrive:</p>
                        <button class="btn btn-primary w-100" @click="getOneDriveFiles">Obtener ficheros de
                            OneDrive</button>
                        <div v-if="models.length > 0" class="mt-2">
                            <i class="bi bi-caret-down-fill dropdown-button"></i>
                            <ul class="list-unstyled">
                                <li v-for="model in models" :key="model.id">
                                    <button class="btn btn-success mt-2 model-button w-100"
                                        @click="load3DModel(model.downloadUrl)">
                                        {{ model.name }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div v-if="!isAuthenticated">
                        <img class="img-fluid mb-3" src="../assets/logo-yara2.jpg" />
                        <h4 class="text-center mb-5 fw-bold">· Visor de Realidad Virtual ·</h4>
                        <p>Pulse el siguiente botón para conectarse con su cuenta Microsoft:</p>
                        <button class="btn btn-primary w-100" @click="login">Login con cuenta Microsoft</button>
                    </div>
                </div>
            </div>
        </div>

    </div>

</template>

<script>
import msalInstance, { initializeMsal } from '../msal.js';

export default {
    name: 'HomeView',
    data() {
        return {
            isAuthenticated: false,
            username: '',
            modelUrl: '',
            models: [],
            welcome: process.env.VUE_APP_WELCOME
        };
    },
    async created() {
        await initializeMsal();
        this.checkAccount();
    },
    methods: {
        async login() {
            try {
                const loginResponse = await msalInstance.loginPopup({
                    scopes: ["User.Read", "Files.Read"]
                });
                this.handleResponse(loginResponse);
            } catch (error) {
                console.error("Login failed:", error);
            }
        },
        logout() {
            msalInstance.logoutPopup();
            this.isAuthenticated = false;
            this.username = '';
            this.models = [];
        },
        handleResponse(response) {
            if (response) {
                this.isAuthenticated = true;
                this.username = response.account.name;
            } else {
                const currentAccounts = msalInstance.getAllAccounts();
                if (currentAccounts.length === 1) {
                    this.isAuthenticated = true;
                    this.username = currentAccounts[0].name;
                }
            }
        },
        checkAccount() {
            const currentAccounts = msalInstance.getAllAccounts();
            if (currentAccounts.length === 1) {
                this.isAuthenticated = true;
                this.username = currentAccounts[0].name;
            }
        },
        async getOneDriveFiles() {
            try {
                const account = msalInstance.getAllAccounts()[0];
                const { accessToken } = await msalInstance.acquireTokenSilent({
                    scopes: ["Files.Read"],
                    account
                });

                const response = await fetch("https://graph.microsoft.com/v1.0/me/drive/root:/models:/children", {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (response.status === 404) {
                    alert("No se encontró la carpeta 'models' en OneDrive. Por favor, cree una carpeta llamada 'models'.");
                } else if (response.ok) {
                    const data = await response.json();
                    if (data.value.length === 0) {
                        alert("La carpeta 'models' en OneDrive está vacía. Por favor, agregue archivos a la carpeta.");
                    } else {
                        this.models = data.value.map(file => ({
                            id: file.id,
                            name: file.name,
                            downloadUrl: file['@microsoft.graph.downloadUrl']
                        }));
                    }
                } else {
                    console.error("Error fetching OneDrive files:", response.statusText);
                }
            } catch (error) {
                console.error("Error acquiring token or fetching files:", error);
            }
        },
        async load3DModel(url) {
            if (url) {
                localStorage.setItem('modelUrl', url);
                this.$router.push({ name: 'model-viewer' });
            } else {
                console.error('Failed to load the model URL');
            }
        }
    }
};
</script>

<style scoped>
.model-button {
    position: relative;
    overflow: hidden;
}

.model-button::after {
    content: "Load Model";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: white;
    background-color: #157247;
    padding: 5px 10px;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.1s;
    white-space: nowrap;
    width: 25rem;
}

.model-button:hover::after {
    opacity: 1;
}

.btn-primary,
.btn-primary:hover,
.btn-primary:active,
.btn-primary:visited {
    background-color: #154B6F;
}

.login-div {
    background: white;
    padding: 2em;
    border-radius: 10px;
    text-align: left;
}

.global-div {
    background: url("../assets/fondo-yara.jpg") no-repeat center;
    background-size: cover;
}

.dropdown-button {
    display: flex;
    justify-content: center;
}
</style>
