<template>
    <div class="vh-100 d-flex flex-column justify-content-center align-items-center">
        <div style="width: 25rem;">
            <div class="card-body">
                <div v-if="isAuthenticated">
                    <p class="text-start fw-bold">Welcome, {{ username }}</p>
                    <div class="mt-4">
                        <p class="text-start">Load model by URL:</p>
                        <input type="text" v-model="modelUrl" class="form-control" placeholder="Enter model URL" />
                        <button class="btn btn-success mt-2 w-100" :disabled="!modelUrl"
                            @click="load3DModel(modelUrl)">Load Model from URL</button>
                    </div>
                    <p class="text-start mt-4">Show models from OneDrive folder:</p>
                    <button class="btn btn-primary w-100" @click="getOneDriveFiles">Get OneDrive Files</button>
                    <div v-if="models.length > 0" class="mt-2">
                        <i class="bi bi-caret-down-fill"></i>
                        <ul class="list-unstyled">
                            <li v-for="model in models" :key="model.id">
                                <button class="btn btn-success mt-2 model-button w-100"
                                    @click="load3DModel(model.downloadUrl)">
                                    {{ model.name }}
                                </button>
                            </li>
                        </ul>
                    </div>
                    <p class="mt-4 text-start">Close session:</p>
                    <button class="btn btn-danger w-100" @click="logout">Logout</button>
                </div>
                <div v-if="!isAuthenticated">
                    <h2></h2>
                    <h5 class="text-center fw-bold">VR Viewer App</h5>
                    <button class="btn btn-primary w-100 mt-2" @click="login">Login with Microsoft</button>
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
            models: []
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
                this.username = response.account.username;
            } else {
                const currentAccounts = msalInstance.getAllAccounts();
                if (currentAccounts.length === 1) {
                    this.isAuthenticated = true;
                    this.username = currentAccounts[0].username;
                }
            }
        },
        checkAccount() {
            const currentAccounts = msalInstance.getAllAccounts();
            if (currentAccounts.length === 1) {
                this.isAuthenticated = true;
                this.username = currentAccounts[0].username;
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

                if (response.ok) {
                    const data = await response.json();
                    this.models = data.value.map(file => ({
                        id: file.id,
                        name: file.name,
                        downloadUrl: file['@microsoft.graph.downloadUrl']
                    }));
                    console.log(this.models);
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
</style>
