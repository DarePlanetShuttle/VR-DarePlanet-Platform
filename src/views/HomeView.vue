<template>
  <div class="global-div"
    :style="{ backgroundImage: `url(${backgroundUrl})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover' }">
    <div class="vh-100 d-flex flex-column justify-content-center align-items-center">
      <div class="login-div">
        <div class="card-body">
          <div v-if="isAuthenticated">
            <div class="d-flex flex-column justify-content-between align-items-center w-100">
              <div class="d-flex justify-content-center m-auto">
                <img :src="logoUrl" alt="Company Logo" class="img-fluid w-75 mb-5" />
              </div>
              <a href="#" class="nav-link link-body-emphasis px-2 active" aria-current="page">
                Bienvenido/a, {{ username }}
              </a>
              <a href="#" class="nav-link link-body-emphasis px-2 logout-btn" @click="logout">Logout</a>
            </div>
            <div class="mt-4">
              <p class="text-start">Cargar ficheros por URL:</p>
              <input type="text" v-model="modelUrl" class="form-control"
                placeholder="Introduzca aquí la URL del fichero" />
              <button class="btn btn-success mt-2 w-100" :disabled="!modelUrl" @click="load3DModel(modelUrl)">Visualizar
                fichero</button>
            </div>
            <br /><br />
            <p class="text-start mt-4">Ficheros de OneDrive:</p>
            <button class="btn btn-primary w-100" @click="getOneDriveFiles">Obtener ficheros de OneDrive</button>
            <div v-if="models.length > 0" class="mt-2">
              <i class="bi bi-caret-down-fill dropdown-button"></i>
              <ul class="list-unstyled">
                <li v-for="model in models" :key="model.id">
                  <button class="btn btn-success mt-2 model-button w-100" @click="load3DModel(model.downloadUrl)">
                    <span class="model-name">{{ model.name }}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div v-if="!isAuthenticated" class="login-container">
            <div class="d-flex flex-column justify-content-space-center align-items-center">
              <img class="img-fluid mb-4" :src="logoUrl" />
              <div class="d-block ms-2">
                <h5 class="text-left fw-bold">Plataforma VR</h5>
                <p class="text-left mt-0"></p>
              </div>
            </div>
            <hr class="divider mb-5">
            <p class="text-center description">Haga login con su cuenta Microsoft para comenzar:</p>
            <button class="btn btn-primary w-100" @click="login">Microsoft login</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import msalInstance, { initializeMsal } from '../msal.js';
import usersData from '../assets/data/users-data.json';

export default {
  name: 'HomeView',
  data() {
    return {
      isAuthenticated: false,
      username: '',
      userEmail: '',
      modelUrl: '',
      models: [],
      logoUrl: localStorage.getItem('logoUrl') || usersData[0].logo,
      backgroundUrl: localStorage.getItem('backgroundUrl') || usersData[0].background,
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
      this.userEmail = '';
      this.models = [];

      this.logoUrl = usersData[0].logo;
      this.backgroundUrl = usersData[0].background;

      localStorage.setItem('logoUrl', this.logoUrl);
      localStorage.setItem('backgroundUrl', this.backgroundUrl);
    },
    handleResponse(response) {
      if (response.account.username.split('@')[1] == 'dareplanet.com' || response.account.username.split('@')[1] == 'yara.com') {
        console.log(response.account.username.split('@')[1]);
        if (response) {
          this.isAuthenticated = true;
          this.username = response.account.name;
          this.userEmail = response.account.username;
        } else {
          const currentAccounts = msalInstance.getAllAccounts();

          if (currentAccounts.length === 1) {
            this.isAuthenticated = true;
            this.username = currentAccounts[0].name;
            this.userEmail = currentAccounts[0].username;
          }
        }
      } else {
        alert("Acceso denegado, cierre sesión y consulte al administrador");
        this.logout();
      }

      console.log(this.isAuthenticated);

      if (this.isAuthenticated) {
        this.loadConfig();
      }
    },
    checkAccount() {
      const currentAccounts = msalInstance.getAllAccounts();

      if (currentAccounts.length === 1) {
        if (currentAccounts[0].username.split('@')[1] == 'dareplanet.com' || currentAccounts[0].username.split('@')[1] == 'yara.com') {
          this.isAuthenticated = true;
          this.username = currentAccounts[0].name;
          this.userEmail = currentAccounts[0].username;
          this.loadConfig();
        } else {
          alert("Acceso denegado, cierre sesión y consulte al administrador");
          this.logout();
        }
      }
    },
    async loadConfig() {
      try {
        let index = 0;

        if (this.userEmail.split('@')[1] == 'dareplanet.com') {
          index = 0;
        } else if (this.userEmail.split('@')[1] == 'yara.com') {
          index = 1;
        }

        this.logoUrl = usersData[index].logo;
        this.backgroundUrl = usersData[index].background;

        localStorage.setItem('logoUrl', this.logoUrl);
        localStorage.setItem('backgroundUrl', this.backgroundUrl);
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
    ,
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
            console.log(this.models);
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
.login-div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  width: 35%;
  height: 100vh;
  background: whitesmoke;
  padding: 2em;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  height: 100%;
}

.divider {
  border-top: 1px solid #9da0a3;
}

.description {
  font-size: 1rem;
  color: #495057;
  margin-bottom: 1.5rem;
}

.btn-primary,
.btn-primary:hover,
.btn-primary:active,
.btn-primary:visited {
  background-color: #244468;
  border: 2px solid #244468;
  padding: 10px 0;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: transparent;
  color: #244468;
  font-weight: 500;
  border: 2px solid #244468;
}

.btn-success {
  background-color: #28a745;
  border: 2px solid #28a745;
  padding: 10px 0;
  font-weight: 500;
}

.btn-success:hover {
  background-color: transparent;
  color: #28a745;
  font-weight: 500;
  border: 2px solid #28a745;
}

h5 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.card-body {
  display: flex;
  align-items: center;
  padding: 2rem;
}

input {
  height: max-content;
}

.dropdown-button {
  display: flex;
  justify-content: center;
  margin: auto;
}
</style>