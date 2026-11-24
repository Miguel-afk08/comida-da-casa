/* ==========================================================================
   Comida da Casa — interações do site
   - cardápio renderizado a partir de uma fonte única de dados
     (pratos do dia + sobremesas)
   - sacola persistente em localStorage + painel lateral
   - checkout com dados do cliente, endereço via ViaCEP e resumo completo
   - fechamento do pedido pelo WhatsApp + oferta de cadastro
   - dados de cliente recorrente (Firebase) e rascunho do visitante
   ========================================================================== */

(function () {
  "use strict";

  var PAGE_EXTENSION = /\.html$/i.test(window.location.pathname) ? ".html" : ".htm";

  function pageHref(name) {
    return name + PAGE_EXTENSION;
  }

  var WHATSAPP = "5581999999999";
  var STORAGE_KEY = "comida-da-casa:sacola:v1";
  var THEME_KEY = "comida-da-casa:tema:v1";
  var CHECKOUT_KEY = "comida-da-casa:checkout:v1";
  var SESSION_KEY = "comida-da-casa:sessao:v1";
  var PROFILE_KEY = "comida-da-casa:perfil:v1";
  var DELIVERY_FEE = 6;

  var DISHES = [
    {
      id: "prato-feito",
      category: "prato",
      name: "Prato Feito",
      price: 20,
      img: "img/prato-feito.webp",
      alt: "Prato feito com arroz, feijão, carne, tomate e alface",
      desc: "Arroz soltinho, feijão temperado, carne de panela, macarrão e salada. O clássico que resolve o almoço.",
      tags: ["Mais pedido"],
    },
    {
      id: "frango-grelhado",
      category: "prato",
      name: "Frango Grelhado",
      price: 22,
      img: "img/frango-grelhado.jpg",
      alt: "Filé de frango grelhado fatiado com brócolis e legumes",
      desc: "Filé de frango marinado no alho e limão, grelhado na hora, com arroz, feijão e legumes.",
      tags: [],
    },
    {
      id: "carne-de-panela",
      category: "prato",
      name: "Carne de Panela",
      price: 25,
      img: "img/carne-de-panela.jpg",
      alt: "Cubos de carne cozidos com molho e legumes",
      desc: "Carne cozida lentamente por três horas, macia no garfo, com arroz, feijão e legumes.",
      tags: ["Da casa"],
    },
    {
      id: "feijoada",
      category: "prato",
      name: "Feijoada",
      price: 28,
      img: "img/feijoada.jpg",
      alt: "Feijoada em panela de barro com caldo escuro e carne",
      desc: "Feijão preto, linguiça, carne seca e paio. Vem com arroz, couve refogada e farofa.",
      tags: ["Sábados"],
    },
  ];

  var DESERTS = [
    {
      id: "pudim",
      category: "sobremesa",
      name: "Pudim",
      price: 8,
      img: "img/pudim.jpg",
      alt: "Pudim de leite condensado com calda de caramelo escorrendo",
      desc: "Pudim de leite condensado, liso e gelado, coberto com calda de caramelo feita em casa.",
      tags: ["Da casa"],
    },
    {
      id: "mousse-chocolate",
      category: "sobremesa",
      name: "Mousse de Chocolate",
      price: 9,
      img: "img/mousse-chocolate.jpg",
      alt: "Mousse de chocolate em copinho com raspas de chocolate",
      desc: "Mousse cremosa de chocolate meio amargo, batida na hora, com raspas por cima.",
      tags: [],
    },
    {
      id: "mousse-maracuja",
      category: "sobremesa",
      name: "Mousse de Maracujá",
      price: 9,
      img: "img/mousse-maracuja.jpg",
      alt: "Mousse de maracujá em copinho com polpa e sementes frescas",
      desc: "Mousse leve de maracujá com a polpa fresca por cima. Doce na medida, azedinha no final.",
      tags: [],
    },
    {
      id: "bolo-chocolate",
      category: "sobremesa",
      name: "Bolo de Chocolate",
      price: 10,
      img: "img/bolo-chocolate.jpg",
      alt: "Fatia de bolo de chocolate com cobertura cremosa",
      desc: "Fatia generosa de bolo de chocolate com cobertura cremosa. Feito de manhã, no forno da casa.",
      tags: ["Novo"],
    },
  ];

  var DRINK_OPTIONS = [
    {
      group: "Sucos naturais",
      items: [
        {
          id: "suco-laranja",
          name: "Suco de Laranja",
          desc: "Feito na hora, com laranjas frescas",
          sizes: [
            { label: "400ml", price: 7 },
            { label: "500ml", price: 9 }
          ]
        },
        {
          id: "suco-maracuja",
          name: "Suco de Maracujá",
          desc: "Batido na hora, com pouquinho de açúcar",
          sizes: [
            { label: "400ml", price: 7 },
            { label: "500ml", price: 9 }
          ]
        },
        {
          id: "suco-limao",
          name: "Suco de Limão",
          desc: "Com ou sem açúcar, do seu jeito",
          sizes: [
            { label: "400ml", price: 7 },
            { label: "500ml", price: 9 }
          ]
        }
      ]
    },
    {
      group: "Refrigerantes",
      items: [
        {
          id: "refri-lata",
          name: "Refrigerante Lata",
          desc: "Coca-Cola ou Guaraná Antarctica",
          sizes: [{ label: "350ml", price: 5 }]
        },
        {
          id: "refri-1l",
          name: "Refrigerante 1 Litro",
          desc: "Coca-Cola, Guaraná ou Fanta Laranja",
          sizes: [{ label: "1L", price: 9 }]
        }
      ]
    }
  ];

  function productById(id) {
    var all = DISHES.concat(DESERTS);
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  function dishById(id) {
    return productById(id);
  }

  function isDessert(id) {
    var product = productById(id);
    return !!product && product.category === "sobremesa";
  }

  function drinkById(id) {
    for (var g = 0; g < DRINK_OPTIONS.length; g++) {
      for (var i = 0; i < DRINK_OPTIONS[g].items.length; i++) {
        if (DRINK_OPTIONS[g].items[i].id === id) return DRINK_OPTIONS[g].items[i];
      }
    }
    return null;
  }

  function drinkSizePrice(item, sizeLabel) {
    for (var i = 0; i < item.sizes.length; i++) {
      if (item.sizes[i].label === sizeLabel) return item.sizes[i].price;
    }
    return 0;
  }

  function drinkLabel(drink) {
    if (!drink) return "Sem bebida";
    var item = drinkById(drink.id);
    return (item ? item.name : drink.id) + " " + drink.size;
  }

  var money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  function moneyText(value) {
    return money.format(value);
  }

  /* ----------------------------------------------------------------------
     Armazenamento local (somente dados de pedido — nunca senhas)
     ---------------------------------------------------------------------- */

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

  function getSession() {
    var session = readJSON(SESSION_KEY);
    return session && session.uid ? session : null;
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function firebaseDisponivel() {
    return (
      window.COMIDA_CASA_FIREBASE_CONFIGURADO === true &&
      window.COMIDA_CASA_FIREBASE &&
      typeof window.COMIDA_CASA_FIREBASE.profile === "function"
    );
  }

  /* ----------------------------------------------------------------------
     Sacola
     ---------------------------------------------------------------------- */

  var cart = loadCart();
  var pendingDrink = null;

  function loadCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(function (line) {
            return productById(line.id) && parseInt(line.qty, 10) > 0;
          })
          .map(function (line) {
            var product = productById(line.id);
            var qty = Math.min(parseInt(line.qty, 10), 99);
            if (product.category === "prato") {
              var drink =
                line.drink && drinkById(line.drink.id) && drinkSizePrice(drinkById(line.drink.id), line.drink.size)
                  ? line.drink
                  : null;
              return { id: line.id, qty: qty, drink: drink };
            }
            return { id: line.id, qty: qty, drink: null };
          });
      }
      var lines = [];
      Object.keys(parsed || {}).forEach(function (id) {
        var quantity = parseInt(parsed[id], 10);
        if (productById(id) && quantity > 0) {
          lines.push({ id: id, qty: Math.min(quantity, 99), drink: null });
        }
      });
      return lines;
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      /* navegação privada ou armazenamento indisponível */
    }
  }

  function lineUnits(line) {
    return line.qty + (line.drink ? line.qty : 0);
  }

  function lineTotal(line) {
    var total = productById(line.id).price * line.qty;
    if (line.drink) total += line.drink.price * line.qty;
    return total;
  }

  function cartCount() {
    return cart.reduce(function (total, line) {
      return total + lineUnits(line);
    }, 0);
  }

  function cartTotal() {
    return cart.reduce(function (total, line) {
      return total + lineTotal(line);
    }, 0);
  }

  function changeQuantity(lineIndex, delta) {
    var line = cart[lineIndex];
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      cart.splice(lineIndex, 1);
    }
    saveCart();
    renderCart();
  }

  function removeFromCart(lineIndex) {
    var line = cart[lineIndex];
    if (!line) return;
    var product = productById(line.id);
    cart.splice(lineIndex, 1);
    saveCart();
    renderCart();
    if (product) showToast(product.name + " saiu da sacola.");
  }

  function addToCartSimple(dishId, quantity) {
    var product = productById(dishId);
    if (!product) return;
    var existing = -1;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === dishId && !cart[i].drink) {
        existing = i;
        break;
      }
    }
    if (existing >= 0) {
      cart[existing].qty = Math.min(cart[existing].qty + quantity, 99);
    } else {
      cart.push({ id: dishId, qty: quantity, drink: null });
    }
    saveCart();
    checkoutView = "cart";
    renderDrawerBody();
    showToast(product.name + " entrou na sacola.");
  }

  function renderCart() {
    var count = cartCount();
    var total = cartTotal();

    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = count;
    });

    document.querySelectorAll("[data-cart-total]").forEach(function (node) {
      node.textContent = moneyText(total);
    });

    document.querySelectorAll("[data-cart-checkout]").forEach(function (button) {
      button.disabled = cart.length === 0;
    });

    document.querySelectorAll("[data-cart-items]").forEach(function (container) {
      if (!cart.length) {
        container.innerHTML =
          '<p class="cart-empty">Sua sacola está vazia. Escolha um prato no cardápio.</p>';
        return;
      }

      container.innerHTML = cart
        .map(function (line, index) {
          var product = productById(line.id);
          var drinkText = "";
          if (product.category === "prato") {
            drinkText = line.drink
              ? '<div class="cart-line-drink">' +
                "<span>Bebida: " + drinkLabel(line.drink) + " ×" + line.qty + "</span>" +
                '<span class="cart-line-drink-price">+' + moneyText(line.drink.price * line.qty) + "</span>" +
                "</div>"
              : '<div class="cart-line-drink is-none"><span>Sem bebida</span></div>';
          }
          var actions =
            '<div class="cart-line-actions">' +
            (product.category === "prato"
              ? '<button type="button" class="cart-swap" data-drink-swap="' + index + '">Trocar bebida</button>'
              : "") +
            '<button type="button" class="cart-remove" data-cart-remove="' + index + '">Remover</button>' +
            "</div>";
          return (
            '<div class="cart-line">' +
            '<div class="cart-line-name">' + product.name + "</div>" +
            '<div class="cart-line-unit">' + moneyText(product.price) + " cada</div>" +
            drinkText +
            '<div class="cart-line-controls">' +
            '<div class="cart-qty">' +
            '<button type="button" data-cart-dec="' + index + '" aria-label="Diminuir ' + product.name + '">−</button>' +
            '<span aria-live="polite">' + line.qty + "</span>" +
            '<button type="button" data-cart-inc="' + index + '" aria-label="Aumentar ' + product.name + '">+</button>' +
            "</div>" +
            actions +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    });

    var mobileBar = document.querySelector("[data-mobile-cart]");
    if (mobileBar) {
      mobileBar.hidden = cart.length === 0;
      var mobileCount = mobileBar.querySelector("[data-mobile-cart-count]");
      var mobileTotal = mobileBar.querySelector("[data-mobile-cart-total]");
      if (mobileCount) mobileCount.textContent = count;
      if (mobileTotal) mobileTotal.textContent = moneyText(total);
    }

    if (!cart.length && !pendingDrink && checkoutView === "cart" && drawer && !drawer.hidden) {
      closeDrawer();
    }
  }

  /* ----------------------------------------------------------------------
     Etapa da bebida (somente para pratos)
     ---------------------------------------------------------------------- */

  function drinkStepMarkup() {
    var dish = dishById(pendingDrink.dishId);

    var groups = DRINK_OPTIONS.map(function (group) {
      var items = group.items
        .map(function (item) {
          var sizes = item.sizes
            .map(function (size) {
              return (
                '<button type="button" class="drink-size" data-drink-choose="' +
                item.id + "|" + size.label + '">' +
                '<span class="drink-size-label">' + size.label + "</span>" +
                '<span class="drink-size-price">' + moneyText(size.price) + "</span>" +
                "</button>"
              );
            })
            .join("");

          return (
            '<div class="drink-option">' +
            '<div class="drink-option-info">' +
            '<div class="drink-option-name">' + item.name + "</div>" +
            '<div class="drink-option-desc">' + item.desc + "</div>" +
            "</div>" +
            '<div class="drink-sizes">' + sizes + "</div>" +
            "</div>"
          );
        })
        .join("");

      return '<div class="drink-group"><span class="eyebrow">' + group.group + "</span>" + items + "</div>";
    });

    return (
      '<div class="drink-step">' +
      '<p class="drink-step-intro">Complete seu pedido: escolha uma bebida para acompanhar, ou siga sem bebida.</p>' +
      '<div class="drink-step-dish">' +
      "<strong>" + dish.name + "</strong>" +
      "<span>×" + pendingDrink.qty + " — " + moneyText(dish.price * pendingDrink.qty) + "</span>" +
      "</div>" +
      groups.join("") +
      '<button type="button" class="btn btn-outline drink-none" data-drink-none>Não quero bebida</button>' +
      '<small class="cart-note">A bebida acompanha a mesma quantidade do prato. Você pode trocar depois, na sacola.</small>' +
      "</div>"
    );
  }

  function startDrinkStep(dishId, quantity, lineIndex) {
    var dish = dishById(dishId);
    if (!dish) return;
    pendingDrink = {
      dishId: dishId,
      qty: Math.min(quantity || 1, 99),
      lineIndex: typeof lineIndex === "number" ? lineIndex : null
    };
    openDrawer();
  }

  function finishDrinkStep(drink) {
    if (!pendingDrink) return;
    var swapped = pendingDrink.lineIndex !== null && cart[pendingDrink.lineIndex];
    var line;
    if (swapped) {
      line = cart[pendingDrink.lineIndex];
      line.drink = drink;
    } else {
      line = { id: pendingDrink.dishId, qty: pendingDrink.qty, drink: drink };
      cart.push(line);
    }
    var dish = dishById(line.id);
    pendingDrink = null;
    checkoutView = "cart";
    saveCart();
    renderDrawerBody();
    if (swapped) {
      showToast(drink ? "Bebida trocada: " + drinkLabel(drink) + "." : "Bebida removida do pedido.");
    } else {
      showToast(dish.name + (drink ? " + " + drinkLabel(drink) : "") + " entrou na sacola.");
    }
  }

  function chooseDrink(value) {
    if (!pendingDrink) return;
    var parts = value.split("|");
    var item = drinkById(parts[0]);
    var price = item ? drinkSizePrice(item, parts[1]) : 0;
    if (!item || !price) return;
    finishDrinkStep({ id: item.id, size: parts[1], price: price });
  }

  function skipDrink() {
    finishDrinkStep(null);
  }

  /* ----------------------------------------------------------------------
     Checkout: dados do cliente, endereço e resumo
     ---------------------------------------------------------------------- */

  function checkoutDraft() {
    var draft = readJSON(CHECKOUT_KEY) || {};
    var profile = readJSON(PROFILE_KEY);
    var session = getSession();
    if (profile && isLoggedIn()) {
      Object.keys(profile).forEach(function (key) {
        if (profile[key]) draft[key] = profile[key];
      });
    }
    if (session && session.email && !draft.email) draft.email = session.email;
    return draft;
  }

  function checkoutMarkup() {
    var draft = checkoutDraft();
    var value = function (key) {
      return draft[key] ? String(draft[key]) : "";
    };

    return (
      '<form class="checkout-form" data-checkout-form novalidate>' +
      (isLoggedIn()
        ? '<p class="checkout-account-note">Dados da sua conta preenchidos. Pode editar à vontade — inclusive trocar o endereço de entrega.</p>'
        : '<p class="checkout-account-note"><a href="' + pageHref("login") + "?voltar=" + pageHref("cardapio") + '">Já tem conta? Entre</a> para preencher seus dados automaticamente.</p>') +

      '<fieldset class="delivery-options">' +
      "<legend>Como você quer receber?</legend>" +
      '<label class="delivery-option">' +
      '<input type="radio" name="entrega" value="entrega"' + (draft.entrega !== "retirada" ? " checked" : "") + ">" +
      "<span><strong>Entrega</strong><small>Taxa de " + moneyText(DELIVERY_FEE) + "</small></span>" +
      "</label>" +
      '<label class="delivery-option">' +
      '<input type="radio" name="entrega" value="retirada"' + (draft.entrega === "retirada" ? " checked" : "") + ">" +
      "<span><strong>Retirada no balcão</strong><small>Sem taxa · Rua do Bom Jesus, 120</small></span>" +
      "</label>" +
      "</fieldset>" +

      '<div class="field">' +
      '<label for="co-nome">Nome completo *</label>' +
      '<input id="co-nome" name="nome" type="text" required autocomplete="name" value="' + escapeAttr(value("nome")) + '">' +
      "</div>" +

      '<div class="field-row">' +
      '<div class="field">' +
      '<label for="co-whatsapp">WhatsApp *</label>' +
      '<input id="co-whatsapp" name="whatsapp" type="tel" required inputmode="tel" autocomplete="tel" placeholder="(81) 99999-9999" value="' + escapeAttr(value("whatsapp")) + '">' +
      "</div>" +
      '<div class="field">' +
      '<label for="co-email">E-mail (opcional)</label>' +
      '<input id="co-email" name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" value="' + escapeAttr(value("email")) + '">' +
      "</div>" +
      "</div>" +

      '<div class="checkout-address" data-address>' +
      '<p class="checkout-sub">Endereço de entrega</p>' +
      '<div class="field-row">' +
      '<div class="field">' +
      '<label for="co-cep">CEP *</label>' +
      '<input id="co-cep" name="cep" type="text" required inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="50000-000" value="' + escapeAttr(value("cep")) + '" data-cep>' +
      '<small class="field-hint" data-cep-status>Digite o CEP que a gente completa o resto.</small>' +
      "</div>" +
      '<div class="field">' +
      '<label for="co-numero">Número *</label>' +
      '<input id="co-numero" name="numero" type="text" required autocomplete="address-line1" value="' + escapeAttr(value("numero")) + '">' +
      "</div>" +
      "</div>" +
      '<div class="field">' +
      '<label for="co-rua">Rua *</label>' +
      '<input id="co-rua" name="rua" type="text" required autocomplete="address-line2" value="' + escapeAttr(value("rua")) + '">' +
      "</div>" +
      '<div class="field-row">' +
      '<div class="field">' +
      '<label for="co-bairro">Bairro *</label>' +
      '<input id="co-bairro" name="bairro" type="text" required autocomplete="address-level2" value="' + escapeAttr(value("bairro")) + '">' +
      "</div>" +
      '<div class="field">' +
      '<label for="co-cidade">Cidade *</label>' +
      '<input id="co-cidade" name="cidade" type="text" required autocomplete="address-level1" value="' + escapeAttr(value("cidade")) + '">' +
      "</div>" +
      "</div>" +
      '<div class="field">' +
      '<label for="co-complemento">Complemento (opcional)</label>' +
      '<input id="co-complemento" name="complemento" type="text" placeholder="Apto, bloco, ponto de referência..." value="' + escapeAttr(value("complemento")) + '">' +
      "</div>" +
      "</div>" +

      '<div class="field">' +
      '<label for="co-pagamento">Forma de pagamento *</label>' +
      '<select id="co-pagamento" name="pagamento" required>' +
      '<option value="">Escolha uma opção...</option>' +
      optionMarkup("Pix", value("pagamento")) +
      optionMarkup("Dinheiro", value("pagamento")) +
      optionMarkup("Cartão na entrega", value("pagamento")) +
      optionMarkup("Cartão na retirada", value("pagamento")) +
      "</select>" +
      "</div>" +

      '<div class="field">' +
      '<label for="co-obs">Observações (opcional)</label>' +
      '<textarea id="co-obs" name="observacoes" rows="2" placeholder="Ex.: sem cebola, campainha quebrada, portão verde...">' + escapeHtml(value("observacoes")) + "</textarea>" +
      "</div>" +

      '<div class="checkout-summary">' +
      '<div class="summary-row"><span>Subtotal</span><strong>' + moneyText(cartTotal()) + "</strong></div>" +
      '<div class="summary-row"><span data-summary-fee-label>Taxa de entrega</span><strong data-summary-fee>' + moneyText(DELIVERY_FEE) + "</strong></div>" +
      '<div class="summary-row summary-total"><span>Total</span><strong data-summary-total>' + moneyText(cartTotal() + DELIVERY_FEE) + "</strong></div>" +
      "</div>" +

      '<button type="submit" class="btn btn-primary btn-whatsapp btn-block">Enviar pedido no WhatsApp</button>' +
      '<button type="button" class="btn btn-outline btn-block" data-checkout-back>Voltar para a sacola</button>' +
      '<small class="cart-note">O WhatsApp abre com o pedido todo escrito — é só apertar enviar.</small>' +
      "</form>"
    );
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeHtml(value) {
    return escapeAttr(value);
  }

  function optionMarkup(label, selected) {
    return '<option value="' + label + '"' + (selected === label ? " selected" : "") + ">" + label + "</option>";
  }

  function setupCheckoutForm() {
    var form = document.querySelector("[data-checkout-form]");
    if (!form) return;

    var addressBlock = form.querySelector("[data-address]");
    var feeLabel = form.querySelector("[data-summary-fee-label]");
    var feeNode = form.querySelector("[data-summary-fee]");
    var totalNode = form.querySelector("[data-summary-total]");

    var setAddressRequired = function (required) {
      var fields = addressBlock.querySelectorAll("input");
      fields.forEach(function (input) {
        if (input.name === "complemento") return;
        input.required = required;
      });
    };

    var updateDelivery = function () {
      var entrega = form.querySelector('input[name="entrega"]:checked');
      var isDelivery = entrega && entrega.value === "entrega";
      if (addressBlock) addressBlock.hidden = !isDelivery;
      setAddressRequired(isDelivery);
      var fee = isDelivery ? DELIVERY_FEE : 0;
      if (feeLabel) feeLabel.textContent = isDelivery ? "Taxa de entrega" : "Retirada no balcão";
      if (feeNode) feeNode.textContent = isDelivery ? moneyText(fee) : "R$ 0,00";
      if (totalNode) totalNode.textContent = moneyText(cartTotal() + fee);
    };

    form.querySelectorAll('input[name="entrega"]').forEach(function (radio) {
      radio.addEventListener("change", updateDelivery);
    });
    updateDelivery();

    var cepInput = form.querySelector("[data-cep]");
    var cepStatus = form.querySelector("[data-cep-status]");
    if (cepInput && cepStatus) {
      cepInput.addEventListener("input", function () {
        var onlyDigits = cepInput.value.replace(/\D/g, "").slice(0, 8);
        if (onlyDigits.length > 5) {
          cepInput.value = onlyDigits.replace(/(\d{5})(\d{1,3})/, "$1-$2");
        } else {
          cepInput.value = onlyDigits;
        }
        if (onlyDigits.length === 8) {
          buscaCep(onlyDigits, form, cepStatus);
        }
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var entrega = form.querySelector('input[name="entrega"]:checked');
      var isDelivery = entrega && entrega.value === "entrega";
      setAddressRequired(isDelivery);

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = {
        entrega: isDelivery ? "entrega" : "retirada",
        nome: form.querySelector('[name="nome"]').value.trim(),
        whatsapp: form.querySelector('[name="whatsapp"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        pagamento: form.querySelector('[name="pagamento"]').value,
        observacoes: form.querySelector('[name="observacoes"]').value.trim(),
        cep: "",
        rua: "",
        bairro: "",
        cidade: "",
        numero: "",
        complemento: ""
      };

      if (isDelivery) {
        data.cep = form.querySelector('[name="cep"]').value.trim();
        data.rua = form.querySelector('[name="rua"]').value.trim();
        data.bairro = form.querySelector('[name="bairro"]').value.trim();
        data.cidade = form.querySelector('[name="cidade"]').value.trim();
        data.numero = form.querySelector('[name="numero"]').value.trim();
        data.complemento = form.querySelector('[name="complemento"]').value.trim();
      }

      var fee = isDelivery ? DELIVERY_FEE : 0;
      var total = cartTotal() + fee;

      writeJSON(CHECKOUT_KEY, data);
      salvarPerfilNoFirebase(data);

      openWhatsApp(checkoutMessage(data, fee, total));
      checkoutView = "thanks";
      renderDrawerBody();
    });

    if (isLoggedIn() && firebaseDisponivel()) {
      var session = getSession();
      window.COMIDA_CASA_FIREBASE.profile(session.uid, function (profile) {
        if (!profile) return;
        writeJSON(PROFILE_KEY, profile);
        fillCheckoutFields(form, profile);
      });
    }
  }

  function fillCheckoutFields(form, data) {
    ["nome", "whatsapp", "email", "cep", "rua", "bairro", "cidade", "numero", "complemento"].forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (input && data[name]) input.value = data[name];
    });
  }

  function salvarPerfilNoFirebase(data) {
    var session = getSession();
    if (!session || !firebaseDisponivel()) return;
    var perfil = {
      nome: data.nome,
      whatsapp: data.whatsapp,
      email: data.email,
      cep: data.cep,
      rua: data.rua,
      bairro: data.bairro,
      cidade: data.cidade,
      numero: data.numero,
      complemento: data.complemento
    };
    writeJSON(PROFILE_KEY, perfil);
    window.COMIDA_CASA_FIREBASE.saveProfile(session.uid, perfil);
  }

  function buscaCep(cep, form, statusNode) {
    if (!statusNode) return;
    statusNode.textContent = "Buscando endereço...";
    fetch("https://viacep.com.br/ws/" + cep + "/json/")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.erro) {
          statusNode.textContent = "CEP não encontrado. Preencha o endereço manualmente.";
          return;
        }
        var fill = function (name, value) {
          var input = form.querySelector('[name="' + name + '"]');
          if (input && value) input.value = value;
        };
        fill("rua", data.logradouro);
        fill("bairro", data.bairro);
        fill("cidade", data.localidade);
        statusNode.textContent = "Endereço preenchido pelo CEP. Confira o número.";
        var numero = form.querySelector('[name="numero"]');
        if (numero) numero.focus();
      })
      .catch(function () {
        statusNode.textContent = "Não foi possível consultar o CEP. Preencha manualmente.";
      });
  }

  function checkoutMessage(data, fee, total) {
    var lines = cart.map(function (line) {
      var product = productById(line.id);
      var drinkText = "";
      if (product.category === "prato") {
        drinkText = line.drink ? " + " + line.qty + "x " + drinkLabel(line.drink) : " (sem bebida)";
      }
      return "• " + line.qty + "x " + product.name + drinkText + " — " + moneyText(lineTotal(line));
    });

    var endereco =
      data.entrega === "retirada"
        ? "Retirada no balcão"
        : data.rua + ", " + data.numero + " — " + data.bairro + ", " + data.cidade + " — CEP " + data.cep +
          (data.complemento ? " (" + data.complemento + ")" : "");

    return (
      "Olá! Quero fazer um pedido na Comida da Casa.\n\n" +
      "*Itens do pedido*\n" +
      lines.join("\n") +
      "\n\nSubtotal: " + moneyText(cartTotal()) +
      (data.entrega === "retirada"
        ? "\nTaxa de entrega: R$ 0,00 (retirada no balcão)"
        : "\nTaxa de entrega: " + moneyText(fee)) +
      "\n*Total: " + moneyText(total) + "*" +
      "\n\n*Dados do cliente*\n" +
      "Nome: " + data.nome +
      "\nWhatsApp: " + data.whatsapp +
      (data.email ? "\nE-mail: " + data.email : "") +
      "\nEndereço: " + endereco +
      "\n\nForma de pagamento: " + data.pagamento +
      (data.observacoes ? "\nObservações: " + data.observacoes : "")
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
    checkoutView = "checkout";
    openDrawer();
  }

  /* ----------------------------------------------------------------------
     Tela de agradecimento com oferta de cadastro
     ---------------------------------------------------------------------- */

  function thanksMarkup() {
    if (isLoggedIn()) {
      return (
        '<div class="thanks-panel">' +
        '<div class="thanks-icon" aria-hidden="true">✓</div>' +
        "<strong>Pedido montado no WhatsApp!</strong>" +
        "<p>A cozinha confirma por lá e combina a entrega com você. Bom apetite!</p>" +
        '<button type="button" class="btn btn-primary" data-drawer-close>Fechar</button>' +
        "</div>"
      );
    }
    return (
      '<div class="thanks-panel">' +
      '<div class="thanks-icon" aria-hidden="true">✓</div>' +
      "<strong>Obrigado por pedir na Comida da Casa!</strong>" +
      "<p>Quer facilitar seus próximos pedidos?<br>Crie sua conta e salve seus dados para pedir novamente com muito mais rapidez.</p>" +
      '<a class="btn btn-primary" href="' + pageHref("cadastro") + '">Criar minha conta</a>' +
      '<button type="button" class="btn btn-outline" data-drawer-close>Continuar sem cadastro</button>' +
      "</div>"
    );
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

  function menuSectionMarkup(title, intro, items) {
    return (
      '<section class="menu-section">' +
      '<header class="menu-section-head">' +
      "<h2>" + title + "</h2>" +
      (intro ? "<p>" + intro + "</p>" : "") +
      "</header>" +
      '<div class="menu-grid">' +
      items.map(menuMarkup).join("") +
      "</div>" +
      "</section>"
    );
  }

  function renderMenu() {
    var featured = document.querySelector("[data-featured]");
    if (featured) {
      featured.innerHTML = DISHES.map(featuredMarkup).join("");
    }

    var menu = document.querySelector("[data-menu]");
    if (menu) {
      menu.innerHTML =
        menuSectionMarkup(
          "Pratos do dia",
          "Feitos na manhã, servidos até acabar. A bebida acompanha na mesma quantidade.",
          DISHES
        ) +
        menuSectionMarkup(
          "Sobremesas",
          "Doces da casa para fechar o almoço do jeito certo. Vão direto para a sacola.",
          DESERTS
        );
    }
  }

  /* ----------------------------------------------------------------------
     Sacola lateral
     ---------------------------------------------------------------------- */

  var drawer = null;
  var lastFocused = null;
  var checkoutView = "cart";

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

  function renderDrawerBody() {
    if (!drawer) return;
    var title = drawer.querySelector("#drawer-title");
    var foot = drawer.querySelector(".drawer-foot");
    var body = drawer.querySelector(".drawer-body");
    if (pendingDrink) {
      title.textContent = "Escolha a bebida";
      foot.hidden = true;
      body.innerHTML = drinkStepMarkup();
    } else if (checkoutView === "checkout") {
      title.textContent = "Finalizar pedido";
      foot.hidden = true;
      body.innerHTML = checkoutMarkup();
      setupCheckoutForm();
    } else if (checkoutView === "thanks") {
      title.textContent = "Pedido montado!";
      foot.hidden = true;
      body.innerHTML = thanksMarkup();
    } else {
      title.textContent = "Sua sacola";
      foot.hidden = false;
      body.innerHTML = '<div data-cart-items></div>';
    }
    renderCart();
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    renderDrawerBody();
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
     Links de conta no cabeçalho e rodapé
     ---------------------------------------------------------------------- */

  function updateAccountLinks() {
    var session = getSession();
    var logged = !!session;
    var firstName = "";
    if (session && session.nome) {
      firstName = session.nome.trim().split(/\s+/)[0];
    }
    document.querySelectorAll("[data-account-link]").forEach(function (link) {
      link.setAttribute("href", pageHref("login"));
      if (logged) {
        link.textContent = firstName ? "Olá, " + firstName : "Minha conta";
      } else {
        link.textContent = "Entrar";
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

    document.documentElement.classList.add("reveal-ready");
  }

  /* ----------------------------------------------------------------------
     Eventos globais
     ---------------------------------------------------------------------- */

  document.addEventListener("click", function (event) {
    var addButton = event.target.closest("[data-add]");
    if (addButton) {
      var dishId = addButton.getAttribute("data-add");
      var item = addButton.closest("[data-dish-item]");
      var quantityNode = item ? item.querySelector("[data-qty-value]") : null;
      var quantity = quantityNode ? parseInt(quantityNode.textContent, 10) || 1 : 1;

      if (isDessert(dishId)) {
        addToCartSimple(dishId, quantity);
      } else {
        startDrinkStep(dishId, quantity, null);
      }
      return;
    }

    var choose = event.target.closest("[data-drink-choose]");
    if (choose) {
      chooseDrink(choose.getAttribute("data-drink-choose"));
      return;
    }

    var none = event.target.closest("[data-drink-none]");
    if (none) {
      skipDrink();
      return;
    }

    var swap = event.target.closest("[data-drink-swap]");
    if (swap) {
      var swapIndex = parseInt(swap.getAttribute("data-drink-swap"), 10);
      if (cart[swapIndex]) startDrinkStep(cart[swapIndex].id, cart[swapIndex].qty, swapIndex);
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
      changeQuantity(parseInt(increase.getAttribute("data-cart-inc"), 10), 1);
      return;
    }

    var decrease = event.target.closest("[data-cart-dec]");
    if (decrease) {
      changeQuantity(parseInt(decrease.getAttribute("data-cart-dec"), 10), -1);
      return;
    }

    var remove = event.target.closest("[data-cart-remove]");
    if (remove) {
      removeFromCart(parseInt(remove.getAttribute("data-cart-remove"), 10));
      return;
    }

    var back = event.target.closest("[data-checkout-back]");
    if (back) {
      checkoutView = "cart";
      renderDrawerBody();
      return;
    }

    if (event.target.closest("[data-cart-open]")) {
      checkoutView = "cart";
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
    updateAccountLinks();

    if (new URLSearchParams(window.location.search).get("cadastro") === "ok") {
      showToast("Conta criada! Seus dados vão preencher o checkout automaticamente.");
    }
  });
})();
