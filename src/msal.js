import * as msal from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: process.env.VUE_APP_CLIENT_ID,
        authority: process.env.VUE_APP_AUTHORITY,
        redirectUri: process.env.VUE_APP_REDIRECT_URI,
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

export const initializeMsal = async () => {
    await msalInstance.initialize();
};

export default msalInstance;
