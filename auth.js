/* ==========================================================================
   Comida da Casa — autenticação e cadastro (Firebase)
   ========================================================================== */

(function () {
  "use strict";

  var SESSION_KEY = "comida-da-casa:sessao:v1";
  var PROFILE_KEY = "comida-da-casa:perfil:v1";
  var PAGE_EXTENSION = /\.html$/i.test(window.location.pathname) ? ".html" : ".htm";

  function pageHref(name) {
    return name + PAGE_EXTENSION;
  }

  function readJSON(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    } catch (error) {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* armazenamento indisponível */
    }
  }

  function firebaseDisponivel() {
    return window.COMIDA_CASA_FIREBASE_CONFIGURADO === true && !!window.COMIDA_CASA_FIREBASE;
  }

  function salvarSessao(uid, nome, email) {
    writeJSON(SESSION_KEY, {
      uid: uid,
      nome: nome,
      email: email,
      atualizadoEm: Date.now()
    });
  }

  function mensagemErro(error) {
    var code = error && error.code ? error.code : "";
    var mensagens = {
      "auth/invalid-email": "E-mail inválido. Confira o endereço digitado.",
      "auth/user-disabled": "Esta conta está desativada. Fale com a cozinha.",
      "auth/user-not-found": "E-mail ou senha incorretos.",
      "auth/wrong-password": "E-mail ou senha incorretos.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
      "auth/network-request-failed": "Sem conexão com a internet. Verifique sua rede.",
      "auth/email-already-in-use": "Este e-mail já tem uma conta. Entre em vez de cadastrar de novo.",
      "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
      "auth/operation-not-allowed": "Login por e-mail e senha não está habilitado no Firebase."
    };
    return mensagens[code] || "Não foi possível concluir. Tente novamente em instantes.";
  }

  function mostrarStatus(node, mensagem, erro) {
    if (!node) return;
    node.textContent = mensagem;
    node.classList.toggle("is-error", !!erro);
    node.classList.toggle("is-success", !erro);
  }

  function botaoOcupado(button, ocupado, textoOriginal) {
    if (!button) return;
    button.disabled = ocupado;
    button.textContent = ocupado ? "Aguarde..." : textoOriginal;
  }

  function voltarPara() {
    var params = new URLSearchParams(window.location.search);
    var destino = params.get("voltar");
    return /^cardapio\.(?:htm|html)$/i.test(destino || "") ? destino : pageHref("cardapio");
  }

  function urlCadastroOk() {
    var url = voltarPara();
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "cadastro=ok";
  }

  function sair() {
    if (firebaseDisponivel() && window.COMIDA_CASA_FIREBASE.auth.currentUser) {
      window.COMIDA_CASA_FIREBASE.auth.signOut();
    }
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(PROFILE_KEY);
    } catch (error) {
      /* armazenamento indisponível */
    }
    window.location.href = pageHref("cardapio");
  }

  /* ----------------------------------------------------------------------
     Login e recuperação de senha
     ---------------------------------------------------------------------- */

  var loginForm = document.querySelector("[data-login-form]");
  if (loginForm) {
    var statusLogin = document.querySelector("[data-login-status]");
    var accountPanel = document.querySelector("[data-account-panel]");
    var sessao = readJSON(SESSION_KEY);

    if (sessao && sessao.uid && accountPanel) {
      loginForm.hidden = true;
      accountPanel.hidden = false;
      document.querySelectorAll("[data-login-only]").forEach(function (node) {
        node.hidden = true;
      });
      var accountName = accountPanel.querySelector("[data-account-name]");
      if (accountName) accountName.textContent = sessao.nome || sessao.email;
      document.querySelectorAll("[data-logout]").forEach(function (button) {
        button.addEventListener("click", sair);
      });
    } else {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var status = loginForm.querySelector("[data-login-status]");
        var email = loginForm.querySelector('[name="email"]').value.trim();
        var password = loginForm.querySelector('[name="senha"]').value;
        var button = loginForm.querySelector('[type="submit"]');

        if (!firebaseDisponivel()) {
          mostrarStatus(status, "O login está em configuração. Por enquanto, você pode continuar como visitante.", true);
          return;
        }
        if (!loginForm.checkValidity()) {
          loginForm.reportValidity();
          return;
        }

        botaoOcupado(button, true);
        window.COMIDA_CASA_FIREBASE.auth
          .signInWithEmailAndPassword(email, password)
          .then(function (credencial) {
            var uid = credencial.user.uid;
            return new Promise(function (resolve) {
              window.COMIDA_CASA_FIREBASE.profile(uid, function (perfil) {
                if (perfil) writeJSON(PROFILE_KEY, perfil);
                salvarSessao(uid, perfil ? perfil.nome : (credencial.user.displayName || email), email);
                resolve();
              });
            });
          })
          .then(function () {
            window.location.href = voltarPara();
          })
          .catch(function (error) {
            mostrarStatus(status, mensagemErro(error), true);
            botaoOcupado(button, false, "Entrar");
          });
      });
    }

    var recoverToggle = document.querySelector("[data-recover-toggle]");
    var recoverForm = document.querySelector("[data-recover-form]");
    var recoverStatus = document.querySelector("[data-recover-status]");
    var recoverEmail = recoverForm ? recoverForm.querySelector('[name="email"]') : null;
    var loginPassword = loginForm ? loginForm.querySelector('[name="senha"]') : null;

    if (recoverToggle && recoverForm) {
      recoverToggle.addEventListener("click", function (event) {
        event.preventDefault();
        if (loginForm && !loginForm.hidden) {
          if (recoverEmail && loginForm) recoverEmail.value = loginForm.querySelector('[name="email"]').value;
          loginForm.hidden = true;
          if (loginPassword) loginPassword.value = "";
          recoverForm.hidden = false;
          recoverToggle.textContent = "Voltar para entrar";
          mostrarStatus(statusLogin, "", false);
        } else {
          recoverForm.hidden = true;
          loginForm.hidden = false;
          recoverToggle.textContent = "Esqueci minha senha";
        }
      });

      recoverForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var email = recoverEmail.value.trim();
        var button = recoverForm.querySelector('[type="submit"]');
        if (!firebaseDisponivel()) {
          mostrarStatus(recoverStatus, "A recuperação está em configuração. Tente novamente após configurar o Firebase.", true);
          return;
        }
        if (!recoverForm.checkValidity()) {
          recoverForm.reportValidity();
          return;
        }
        botaoOcupado(button, true);
        window.COMIDA_CASA_FIREBASE.auth
          .sendPasswordResetEmail(email)
          .then(function () {
            mostrarStatus(recoverStatus, "Pronto! Enviamos um link de recuperação para o seu e-mail.", false);
            botaoOcupado(button, false, "Enviar link");
          })
          .catch(function (error) {
            mostrarStatus(recoverStatus, mensagemErro(error), true);
            botaoOcupado(button, false, "Enviar link");
          });
      });
    }
  }

  /* ----------------------------------------------------------------------
     Cadastro de cliente + endereço
     ---------------------------------------------------------------------- */

  var registerForm = document.querySelector("[data-register-form]");
  if (registerForm) {
    var statusCadastro = registerForm.querySelector("[data-register-status]");
    var cepInput = registerForm.querySelector("[data-cep]");
    var cepStatus = registerForm.querySelector("[data-cep-status]");

    if (cepInput && cepStatus) {
      cepInput.addEventListener("input", function () {
        var digits = cepInput.value.replace(/\D/g, "").slice(0, 8);
        cepInput.value = digits.length > 5 ? digits.replace(/(\d{5})(\d{1,3})/, "$1-$2") : digits;
        if (digits.length !== 8) return;

        cepStatus.textContent = "Buscando endereço...";
        fetch("https://viacep.com.br/ws/" + digits + "/json/")
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            if (data.erro) {
              cepStatus.textContent = "CEP não encontrado. Preencha os campos manualmente.";
              return;
            }
            var preencher = function (name, value) {
              var input = registerForm.querySelector('[name="' + name + '"]');
              if (input && value) input.value = value;
            };
            preencher("rua", data.logradouro);
            preencher("bairro", data.bairro);
            preencher("cidade", data.localidade);
            cepStatus.textContent = "Endereço preenchido pelo CEP. Agora informe o número.";
            var numero = registerForm.querySelector('[name="numero"]');
            if (numero) numero.focus();
          })
          .catch(function () {
            cepStatus.textContent = "Não foi possível consultar o CEP. Preencha os campos manualmente.";
          });
      });
    }

    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = registerForm.querySelector('[type="submit"]');

      if (!firebaseDisponivel()) {
        mostrarStatus(statusCadastro, "O cadastro está em configuração. Você pode continuar como visitante.", true);
        return;
      }
      if (!registerForm.checkValidity()) {
        registerForm.reportValidity();
        return;
      }

      var dados = {};
      ["nome", "email", "whatsapp", "cep", "rua", "bairro", "cidade", "numero", "complemento"].forEach(function (name) {
        dados[name] = registerForm.querySelector('[name="' + name + '"]').value.trim();
      });
      var senha = registerForm.querySelector('[name="senha"]').value;

      botaoOcupado(button, true);
      window.COMIDA_CASA_FIREBASE.auth
        .createUserWithEmailAndPassword(dados.email, senha)
        .then(function (credencial) {
          var uid = credencial.user.uid;
          var perfil = {
            nome: dados.nome,
            email: dados.email,
            whatsapp: dados.whatsapp,
            cep: dados.cep,
            rua: dados.rua,
            bairro: dados.bairro,
            cidade: dados.cidade,
            numero: dados.numero,
            complemento: dados.complemento
          };
          return credencial.user.updateProfile({ displayName: dados.nome })
            .then(function () {
              return window.COMIDA_CASA_FIREBASE.saveProfile(uid, perfil);
            })
            .then(function () {
              writeJSON(PROFILE_KEY, perfil);
              salvarSessao(uid, dados.nome, dados.email);
              window.location.href = urlCadastroOk();
            });
        })
        .catch(function (error) {
          mostrarStatus(statusCadastro, mensagemErro(error), true);
          botaoOcupado(button, false, "Criar minha conta");
        });
    });
  }
})();
