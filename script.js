/* ==========================================================================
   Comida da Casa — interações do site
   - cardápio renderizado a partir de uma fonte única de dados
   - sacola persistente em localStorage + painel lateral
   - fechamento do pedido pelo WhatsApp
   ========================================================================== */

(function () {
  "use strict";

  var WHATSAPP = "5581999999999";
  var STORAGE_KEY = "comida-da-casa:sacola:v1";
  var THEME_KEY = "comida-da-casa:tema:v1";

  var DISHES = [
    {
      id: "prato-feito",
      name: "Prato Feito",
      price: 20,
      img: "img/prato-feito.webp",
      alt: "Prato feito com arroz, feijão, carne, tomate e alface",
      desc: "Arroz soltinho, feijão temperado, carne de panela, macarrão e salada. O clássico que resolve o almoço.",
      tags: ["Mais pedido"]
    },
    {
      id: "frango-grelhado",
      name: "Frango Grelhado",
      price: 22,
      img: "img/frango-grelhado.jpg",
      alt: "Filé de frango grelhado fatiado com brócolis e legumes",
      desc: "Filé de frango marinado no alho e limão, grelhado na hora, com arroz, feijão e legumes.",
      tags: []
    },
    {
      id: "carne-de-panela",
      name: "Carne de Panela",
      price: 25,
      img: "img/carne-de-panela.jpg",
      alt: "Cubos de carne cozidos com molho e legumes",
      desc: "Carne cozida lentamente por três horas, macia no garfo, com arroz, feijão e legumes.",
      tags: ["Da casa"]
    },
    {
      id: "feijoada",
      name: "Feijoada",
      price: 28,
      img: "img/feijoada.jpg",
      alt: "Feijoada em panela de barro com caldo escuro e carne",
      desc: "Feijão preto, linguiça, carne seca e paio. Vem com arroz, couve refogada e farofa.",
      tags: ["Sábados"]
    }
  ];

  var money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  function dishById(id) {
    return DISHES.filter(function (dish) {
      return dish.id === id;
    })[0];
  }

  function moneyText(value) {
    return money.format(value);
  }

  /* ----------------------------------------------------------------------
     Sacola
     ---------------------------------------------------------------------- */

  var cart = loadCart();

  function loadCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      var clean = {};
      Object.keys(parsed || {}).forEach(function (id) {
        var quantity = parseInt(parsed[id], 10);
        if (dishById(id) && quantity > 0) {
          clean[id] = Math.min(quantity, 99);
        }
      });
      return clean;
    } catch (error) {
      return {};
    }
  }

  function saveCart() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      /* navegação privada ou armazenamento indisponível */
    }
  }

  function cartCount() {
    return Object.keys(cart).reduce(function (total, id) {
      return total + cart[id];
    }, 0);
  }

  function cartTotal() {
    return Object.keys(cart).reduce(function (total, id) {
      return total + dishById(id).price * cart[id];
    }, 0);
  }

  function addToCart(id, quantity) {
    var dish = dishById(id);
    if (!dish) return;
    cart[id] = Math.min((cart[id] || 0) + (quantity || 1), 99);
    saveCart();
    renderCart();
    showToast(dish.name + " entrou na sacola.");
  }

  function changeQuantity(id, delta) {
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    var dish = dishById(id);
    delete cart[id];
    saveCart();
    renderCart();
    if (dish) showToast(dish.name + " saiu da sacola.");
  }

  function renderCart() {
    var count = cartCount();
    var total = cartTotal();
    var ids = Object.keys(cart);

    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = count;
    });

    document.querySelectorAll("[data-cart-total]").forEach(function (node) {
      node.textContent = moneyText(total);
    });

    document.querySelectorAll("[data-cart-checkout]").forEach(function (button) {
      button.disabled = ids.length === 0;
    });

    document.querySelectorAll("[data-cart-items]").forEach(function (container) {
      if (!ids.length) {
        container.innerHTML =
          '<p class="cart-empty">Sua sacola está vazia. Escolha um prato no cardápio.</p>';
        return;
      }

      container.innerHTML = ids
        .map(function (id) {
          var dish = dishById(id);
          var quantity = cart[id];
          return (
            '<div class="cart-line">' +
            '<div class="cart-line-name">' + dish.name + "</div>" +
            '<div class="cart-line-unit">' + moneyText(dish.price) + " cada</div>" +
            '<div class="cart-line-controls">' +
            '<div class="cart-qty">' +
            '<button type="button" data-cart-dec="' + id + '" aria-label="Diminuir ' + dish.name + '">−</button>' +
            '<span aria-live="polite">' + quantity + "</span>" +
            '<button type="button" data-cart-inc="' + id + '" aria-label="Aumentar ' + dish.name + '">+</button>' +
            "</div>" +
            '<button type="button" class="cart-remove" data-cart-remove="' + id + '">Remover</button>' +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    });

    var mobileBar = document.querySelector("[data-mobile-cart]");
    if (mobileBar) {
      mobileBar.hidden = ids.length === 0;
      var mobileCount = mobileBar.querySelector("[data-mobile-cart-count]");
      var mobileTotal = mobileBar.querySelector("[data-mobile-cart-total]");
      if (mobileCount) mobileCount.textContent = count;
      if (mobileTotal) mobileTotal.textContent = moneyText(total);
    }

    if (!ids.length && drawer && !drawer.hidden) {
      closeDrawer();
    }
  }

  function checkoutMessage() {
    var ids = Object.keys(cart);
    var lines = ids.map(function (id) {
      var dish = dishById(id);
      return "• " + cart[id] + "x " + dish.name + " — " + moneyText(dish.price * cart[id]);
    });

    return (
      "Olá! Quero fazer um pedido na Comida da Casa.\n\n" +
      lines.join("\n") +
      "\n\nTotal: " + moneyText(cartTotal()) +
      "\n\nNome: \nEntrega ou retirada: "
    );
  }

  function openWhatsApp(message) {
    var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");
  }

  function startCheckout() {
    if (!cartCount()) {
      showToast("Sua sacola está vazia.");
      return;
    }
    openWhatsApp(checkoutMessage());
  }

  /* ----------------------------------------------------------------------
     Renderização do cardápio
     ---------------------------------------------------------------------- */

  function featuredMarkup(dish) {
    var tags = dish.tags
      .map(function (tag) {
        return '<span class="tag">' + tag + "</span>";
      })
      .join("");

    return (
      '<article class="dish-row">' +
      '<img class="dish-thumb" src="' + dish.img + '" alt="' + dish.alt + '" width="132" height="99" loading="lazy">' +
      '<div class="dish-body">' +
      "<h3>" + dish.name + "</h3>" +
      "<p>" + dish.desc + "</p>" +
      (tags ? '<div class="dish-tags">' + tags + "</div>" : "") +
      "</div>" +
      '<div class="dish-side">' +
      '<span class="price">' + moneyText(dish.price) + "</span>" +
      '<button type="button" class="btn btn-outline btn-small" data-add="' + dish.id + '">Adicionar</button>' +
      "</div>" +
      "</article>"
    );
  }

  function menuMarkup(dish) {
    var tags = dish.tags
      .map(function (tag) {
        return '<span class="tag">' + tag + "</span>";
      })
      .join("");

    return (
      '<article class="menu-item" data-dish-item="' + dish.id + '">' +
      '<img src="' + dish.img + '" alt="' + dish.alt + '" width="328" height="246" loading="lazy">' +
      "<div>" +
      "<h2>" + dish.name + "</h2>" +
      '<p class="desc">' + dish.desc + "</p>" +
      (tags ? '<div class="dish-tags">' + tags + "</div>" : "") +
      '<div class="menu-foot">' +
      '<span class="price">' + moneyText(dish.price) + "</span>" +
      '<div class="qty">' +
      '<button type="button" data-qty-minus aria-label="Diminuir quantidade de ' + dish.name + '">−</button>' +
      '<span data-qty-value>1</span>' +
      '<button type="button" data-qty-plus aria-label="Aumentar quantidade de ' + dish.name + '">+</button>' +
      "</div>" +
      '<button type="button" class="btn btn-primary btn-small" data-add="' + dish.id + '">Adicionar</button>' +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderMenu() {
    var featured = document.querySelector("[data-featured]");
    if (featured) {
      featured.innerHTML = DISHES.map(featuredMarkup).join("");
    }

    var menu = document.querySelector("[data-menu]");
    if (menu) {
      menu.innerHTML = DISHES.map(menuMarkup).join("");
    }
  }

  /* ----------------------------------------------------------------------
     Sacola lateral
     ---------------------------------------------------------------------- */

  var drawer = null;
  var lastFocused = null;

  function buildDrawer() {
    var wrapper = document.createElement("div");
    wrapper.className = "drawer";
    wrapper.setAttribute("data-drawer", "");
    wrapper.hidden = true;
    wrapper.innerHTML =
      '<div class="drawer-backdrop" data-drawer-close></div>' +
      '<aside class="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1">' +
      '<div class="drawer-head">' +
      '<h2 id="drawer-title">Sua sacola</h2>' +
      '<button type="button" class="drawer-close" data-drawer-close aria-label="Fechar sacola">×</button>' +
      "</div>" +
      '<div class="drawer-body"><div data-cart-items></div></div>' +
      '<div class="drawer-foot">' +
      '<div class="cart-total"><span>Total</span><strong data-cart-total>R$ 0,00</strong></div>' +
      '<button type="button" class="btn btn-primary btn-whatsapp" data-cart-checkout>Finalizar no WhatsApp</button>' +
      '<small class="cart-note">Você confirma endereço, horário e forma de pagamento direto com a cozinha.</small>' +
      "</div>" +
      "</aside>";

    document.body.appendChild(wrapper);
    return wrapper;
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add("no-scroll");
    window.requestAnimationFrame(function () {
      drawer.classList.add("is-open");
      var panel = drawer.querySelector(".drawer-panel");
      if (panel) panel.focus();
    });
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    window.setTimeout(function () {
      drawer.hidden = true;
    }, 360);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function trapFocus(event) {
    if (!drawer || drawer.hidden || event.key !== "Tab") return;
    var focusable = drawer.querySelectorAll(
      'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ----------------------------------------------------------------------
     Aviso flutuante
     ---------------------------------------------------------------------- */

  var toastTimer = null;

  function showToast(message) {
    var toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    window.clearTimeout(toastTimer);
    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  /* ----------------------------------------------------------------------
     Menu mobile
     ---------------------------------------------------------------------- */

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ----------------------------------------------------------------------
     Formulário de contato
     ---------------------------------------------------------------------- */

  function setupContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var status = form.querySelector("[data-form-status]");
      var name = form.querySelector("[name='nome']").value.trim();
      var phone = form.querySelector("[name='telefone']").value.trim();
      var subject = form.querySelector("[name='assunto']").value;
      var message = form.querySelector("[name='mensagem']").value.trim();

      var text =
        "Olá! Vim pelo site da Comida da Casa.\n\n" +
        "Nome: " + name + "\n" +
        (phone ? "Telefone: " + phone + "\n" : "") +
        "Assunto: " + subject + "\n\n" +
        message;

      openWhatsApp(text);

      if (status) {
        status.classList.remove("is-error");
        status.textContent =
          "Abrimos o WhatsApp em outra aba para você enviar a mensagem.";
      }
    });
  }

  /* ----------------------------------------------------------------------
     Revelação suave
     ---------------------------------------------------------------------- */

  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach(function (item) {
      var box = item.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        item.classList.add("is-visible");
      }
      observer.observe(item);
    });

    // A classe só é aplicada depois que o observer está observando tudo:
    // sem JS (ou com erro anterior), o conteúdo permanece visível.
    document.documentElement.classList.add("reveal-ready");
  }

  /* ----------------------------------------------------------------------
     Eventos globais
     ---------------------------------------------------------------------- */

  document.addEventListener("click", function (event) {
    var addButton = event.target.closest("[data-add]");
    if (addButton) {
      var item = addButton.closest("[data-dish-item]");
      var quantityNode = item ? item.querySelector("[data-qty-value]") : null;
      var quantity = quantityNode ? parseInt(quantityNode.textContent, 10) || 1 : 1;
      addToCart(addButton.getAttribute("data-add"), quantity);
      return;
    }

    var plus = event.target.closest("[data-qty-plus]");
    if (plus) {
      var valueNode = plus.parentElement.querySelector("[data-qty-value]");
      var current = parseInt(valueNode.textContent, 10) || 1;
      valueNode.textContent = Math.min(current + 1, 20);
      return;
    }

    var minus = event.target.closest("[data-qty-minus]");
    if (minus) {
      var value = minus.parentElement.querySelector("[data-qty-value]");
      var amount = parseInt(value.textContent, 10) || 1;
      value.textContent = Math.max(amount - 1, 1);
      return;
    }

    var increase = event.target.closest("[data-cart-inc]");
    if (increase) {
      changeQuantity(increase.getAttribute("data-cart-inc"), 1);
      return;
    }

    var decrease = event.target.closest("[data-cart-dec]");
    if (decrease) {
      changeQuantity(decrease.getAttribute("data-cart-dec"), -1);
      return;
    }

    var remove = event.target.closest("[data-cart-remove]");
    if (remove) {
      removeFromCart(remove.getAttribute("data-cart-remove"));
      return;
    }

    if (event.target.closest("[data-cart-open]")) {
      openDrawer();
      return;
    }

    if (event.target.closest("[data-drawer-close]")) {
      closeDrawer();
      return;
    }

    if (event.target.closest("[data-cart-checkout]")) {
      startCheckout();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDrawer();
    }
    trapFocus(event);
  });

  /* ----------------------------------------------------------------------
     Tema claro/escuro
     ---------------------------------------------------------------------- */

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* armazenamento indisponível */
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#171310" : "#f6f1e7");
    }

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      var dark = theme === "dark";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute(
        "aria-label",
        dark ? "Mudar para o tema claro" : "Mudar para o tema escuro"
      );
      var label = button.querySelector("[data-theme-label]");
      if (label) label.textContent = dark ? "Tema claro" : "Tema escuro";
    });
  }

  function setupThemeToggle() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.documentElement.classList.add("theme-switching");
        window.setTimeout(function () {
          document.documentElement.classList.remove("theme-switching");
        }, 450);
        applyTheme(currentTheme() === "dark" ? "light" : "dark");
      });
    });
    applyTheme(currentTheme());
  }

  document.addEventListener("DOMContentLoaded", function () {
    drawer = buildDrawer();
    renderMenu();
    renderCart();
    setupNavigation();
    setupContactForm();
    setupReveal();
    setupThemeToggle();
  });
})();
