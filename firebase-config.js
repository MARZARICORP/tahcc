// Arquivo: firebase-config.js

// Sua configuração web do Firebase que você copiou do console
const firebaseConfig = {
  apiKey: "AIzaSyAkkPMuV2IlWulyNwbUeRkf_SpW7s-XKTk",
  authDomain: "ipconfig-d2264.firebaseapp.com",
  projectId: "ipconfig-d2264",
  storageBucket: "ipconfig-d2264.firebasestorage.app",
  messagingSenderId: "614961683744",
  appId: "1:614961683744:web:269a9d8b74b516e799cb45"
};

// Inicializa o Firebase com a configuração
firebase.initializeApp(firebaseConfig);

// Cria uma referência para o serviço do Firestore que usaremos no nosso app
const db = firebase.firestore();