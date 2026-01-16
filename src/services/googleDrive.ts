const DRIVE_ROOT_ID = import.meta.env.VITE_DRIVE_ROOT_FOLDER_ID;
const ACCESS_TOKEN_KEY = 'google_access_token';

export const setAccessToken = (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const uploadFileToDrive = async (file: Blob, filename: string, folderId?: string) => {
    const token = getAccessToken();
    if (!token) throw new Error('No access token');

    const metadata = {
        name: filename,
        parents: [folderId || DRIVE_ROOT_ID]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    console.log(`Uploading ${filename} to folder ${folderId || DRIVE_ROOT_ID}...`);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Drive Upload Error:', res.status, errorText);
        throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log('Upload success:', data);
    return data.id;
};
