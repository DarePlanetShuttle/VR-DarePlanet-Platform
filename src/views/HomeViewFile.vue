<template>
  <div></div>
</template>

<script>
import msalInstance, { initializeMsal } from '../msal.js';
import usersData from '../assets/data/users-data.json';

// Codificar la URL de la carpeta compartida a Base64
function encodeSharingLink(sharingUrl) {
  return btoa(`u!${encodeURIComponent(sharingUrl)}`);
}

export default {
  name: 'HomeViewFile',
  data() {
    return {
      isAuthenticated: false,
      username: '',
      userEmail: '',
      modelUrl: '',
      models: [],
      logoUrl: localStorage.getItem('logoUrl') || usersData[0].logo,
      backgroundUrl: localStorage.getItem('backgroundUrl') || usersData[0].background,
      exp: null,
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
          this.checkUrlFile();
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
    },
    async checkUrlFile() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('exp')) {
          this.exp = urlParams.get('exp');
          await this.getOneDriveFiles();
          const file = this.models.find(file => file.name === this.exp + ".glb");

          if (file) {
            //console.log(file.downloadUrl);
            this.load3DModel(file.downloadUrl);
          }else{
            alert("No se encuentra el fichero en OneDrive para ese expediente.");
          }
        }
      } catch (error) {
        console.error('Error loading file from url:', error);
      }
    },
    async searchFileOneDrive(sharingUrl, fileName){

      /*
      Codigo para llamar a esta función:
        const sharingUrl = 'URL_DE_LA_CARPETA_COMPARTIDA'; // La URL de la carpeta compartida de OneDrive
        this.file = await searchFileInSharedFolder(sharingUrl, this.fileName);
      */

      const shareId = encodeSharingLink(sharingUrl);

      try {
        const account = msalInstance.getAllAccounts()[0];
        const { accessToken } = await msalInstance.acquireTokenSilent({
          scopes: ["Files.Read"],
          account
        });

        const response = await fetch("https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/children", {
          headers: { 
            Authorization: `Bearer ${accessToken}` 
          },
          params: {
            $filter: `name eq '${fileName}'` // Filtra por el nombre del archivo
          }
        });

        // Verificar si el archivo fue encontrado
        const file = response.data.value.find(file => file.name === fileName);
        if (file) {
          console.log('Archivo encontrado:', file);
          return file; // Retorna el archivo encontrado
        } else {
          console.log('Archivo no encontrado');
          return null;
        }

      } catch (error) {
        console.error("Error acquiring token or fetching files:", error);
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
          alert("No se encontró la carpeta 'models' en OneDrive. Por favor, cree una carpeta llamada 'models' y vuelta a intentarlo.");
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