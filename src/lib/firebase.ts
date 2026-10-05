import { getApps, initializeApp } from 'firebase/app';

// Public application identifiers. Personal data is accessed only through the backend.
export const firebaseConfig = {
  apiKey: 'AIzaSyAffHwF2aLcTI-HkqJTf4sKy46X7H7BMKQ',
  authDomain: 'vixcursos.firebaseapp.com',
  databaseURL: 'https://vixcursos-default-rtdb.firebaseio.com',
  projectId: 'vixcursos',
  storageBucket: 'vixcursos.firebasestorage.app',
  messagingSenderId: '331355414561',
  appId: '1:331355414561:web:de60fb375702f54ce50360',
  measurementId: 'G-79QDQRXF8B',
};
export const firebaseApp = getApps()[0] || initializeApp(firebaseConfig);
