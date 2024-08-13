import * as msal from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: "f51206fa-fd71-4af6-b2cf-a467b04b294d",
        authority: "https://login.microsoftonline.com/e08d22db-a9ec-477d-a620-7f8ae4254949",
        redirectUri: "http://localhost:8080/tabs/validate",
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
