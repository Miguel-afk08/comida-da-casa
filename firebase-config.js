/* ==========================================================================
   Configuração do Firebase
   Preencha os valores abaixo com os dados de:
   Firebase Console → Configurações do projeto → Seus apps → Configuração do SDK
   Veja o passo a passo no README.md.
   ========================================================================== */

window.COMIDA_CASA_FIREBASE_CONFIG = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "COLE_AQUI.firebaseapp.com",
  projectId: "COLE_AQUI_SEU_PROJECT_ID",
  storageBucket: "COLE_AQUI.appspot.com",
  messagingSenderId: "COLE_AQUI_SEU_MESSAGING_SENDER_ID",
  appId: "COLE_AQUI_SEU_APP_ID"
};

window.COMIDA_CASA_FIREBASE_CONFIGURADO = false;

(function () {
  var config = window.COMIDA_CASA_FIREBASE_CONFIG;
  var completo =
    config &&
    config.apiKey &&
    config.projectId &&
    config.apiKey.indexOf("COLE_AQUI") === -1 &&
    config.projectId.indexOf("COLE_AQUI") === -1;

  if (!completo || typeof window.firebase === "undefined") return;

  try {
    window.firebase.initializeApp(config);
    var auth = window.firebase.auth();
    auth.languageCode = "pt-BR";
    var db = window.firebase.firestore();

    window.COMIDA_CASA_FIREBASE_CONFIGURADO = true;
    window.COMIDA_CASA_FIREBASE = {
      auth: auth,
      profile: function (uid, ok, erro) {
        db.collection("usuarios").doc(uid).get()
          .then(function (doc) {
            ok(doc.exists ? doc.data() : null);
          })
          .catch(function (error) {
            if (erro) erro(error);
            else ok(null);
          });
      },
      saveProfile: function (uid, perfil) {
        return db.collection("usuarios").doc(uid).set(perfil, { merge: true });
      }
    };
  } catch (error) {
    window.COMIDA_CASA_FIREBASE_CONFIGURADO = false;
  }
})();
