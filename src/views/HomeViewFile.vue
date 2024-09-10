<template>
  <div></div>
</template>

<script>
import msalInstance, { initializeMsal } from '../msal.js';
import usersData from '../assets/data/users-data.json';

// Codificar la URL de la carpeta compartida a Base64
function encodeSharingLink(sharingUrl) {
  const base64Value = btoa(unescape(encodeURIComponent(sharingUrl)));
  return `u!${base64Value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
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
          //this.checkUrlFile();
          this.searchFileOneDrive("1623327307");
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
    async searchFileOneDrive(fileName){

      const sharingUrl = "https://digitaltakers.sharepoint.com/:f:/s/Sociedades/Eu2oD3Lp-BdAnOgPfRUJHGUBxveXMo-ehbroQRmwNlCzKw?e=fPxfAE";      
      const shareId = encodeSharingLink(sharingUrl);

      try {
        const account = msalInstance.getAllAccounts()[0];
        const { accessToken } = await msalInstance.acquireTokenSilent({
          scopes: ["Files.Read"],
          account
        });

        const url = new URL(`https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/children`);
        url.searchParams.append('$filter', `name eq '${fileName}.glb'`);

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Verificar si el archivo fue encontrado
        const file = data.value.find(file => file.name === fileName + ".glb");
        if (file) {
          this.load3DModel(file['@microsoft.graph.downloadUrl']);
          //return file; // Retorna el archivo encontrado
        } else {
          console.log('Archivo no encontrado');
          //return null;
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