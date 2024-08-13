<template>
    <div>
        <h1>Microsoft Login with MSAL.js</h1>
        <button v-if="!isAuthenticated" @click="login">Login with Microsoft</button>
        <button v-if="isAuthenticated" @click="logout">Logout</button>
        <button v-if="isAuthenticated" @click="getOneDriveFiles">Get OneDrive Files</button>
        <button v-if="isAuthenticated" @click="load3DModel">Load 3D Model</button>

        <div v-if="isAuthenticated">
            <h2>Welcome, {{ username }}</h2>
        </div>
    </div>
</template>

<script>
import msalInstance, { initializeMsal } from './msal.js';

export default {
    name: 'HomeView',
    data() {
        return {
            isAuthenticated: false,
            username: '',
            modelUrl: null
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
            this.modelUrl = null;
        },
        handleResponse(response) {
            if (response !== null) {
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
                const accessTokenResponse = await msalInstance.acquireTokenSilent({
                    scopes: ["Files.Read"],
                    account: account
                });

                const accessToken = accessTokenResponse.accessToken;

                const response = await fetch("https://graph.microsoft.com/v1.0/me/drive/root:/models:/children", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                } else {
                    console.error("Error fetching OneDrive files:", response.statusText);
                }
            } catch (error) {
                console.error("Error acquiring token or fetching files:", error);
            }
        },
        async load3DModel() {
            const fileName = "espacio.glb";
            const modelUrl = await this.getOneDriveFile(fileName);
            console.log("HomeView:", modelUrl);
            if (modelUrl) {
                localStorage.setItem('modelUrl', modelUrl);
                this.$router.push({ name: 'model-viewer' });
            } else {
                console.error('Failed to load the model URL');
            }
        },
        async getOneDriveFile(fileName) {
            try {
                const account = msalInstance.getAllAccounts()[0];
                const accessTokenResponse = await msalInstance.acquireTokenSilent({
                    scopes: ["Files.Read"],
                    account: account
                });

                const accessToken = accessTokenResponse.accessToken;

                const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/models/${fileName}:/content`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    return response.url;
                } else {
                    console.error("Error fetching OneDrive file:", response.statusText);
                }
            } catch (error) {
                console.error("Error acquiring token or fetching file:", error);
            }
        }
    }
};
</script>