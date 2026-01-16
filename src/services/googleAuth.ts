const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let tokenClient: any;

export const initTokenClient = (onSuccess?: (token: string) => void) => {
    if (!window.google) return;

    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
                localStorage.setItem('google_access_token', tokenResponse.access_token);
                if (onSuccess) onSuccess(tokenResponse.access_token);
            }
        },
    });
};

export const initGoogleAuth = (
    onSignIn: (response: any) => void,
    onDriveSuccess: (token: string) => void
) => {
    if (!window.google) return;

    // 1. ID Token (Sign In)
    window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: onSignIn
    });

    const btnContainer = document.getElementById("google-btn-container");
    if (btnContainer) {
        window.google.accounts.id.renderButton(
            btnContainer,
            { theme: "outline", size: "large", width: 250 }
        );
    }

    // 2. Access Token (Drive API)
    initTokenClient(onDriveSuccess);
};

export const requestDriveToken = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken();
    } else {
        console.warn('Google Token Client not initialized. Initializing now...');
        initTokenClient();
        // Give it a moment to init? Actually initTokenClient is synchronous in setting the variable, 
        // but checking window.google might fail if script not loaded.
        // We will retry once.
        setTimeout(() => {
            if (tokenClient) tokenClient.requestAccessToken();
            else alert('Erro: Google Identity Services não carregado. Recarregue a página.');
        }, 500);
    }
};
