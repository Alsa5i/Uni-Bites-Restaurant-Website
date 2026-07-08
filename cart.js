(function () {
  var CART_KEY = "unibite_cart";
  var cart = loadCart();

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function format(n) {
    return "UGX " + Number(n).toLocaleString("en-US");
  }

  function addToCart(item) {
    var existing = cart.find(function (i) {
      return i.id === item.id;
    });
    if (existing) {
      existing.qty += 1;
    } else {
      item.qty = 1;
      cart.push(item);
    }
    saveCart();
    render();
  }

  function changeQty(id, delta) {
    var item = cart.find(function (i) {
      return i.id === id;
    });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(function (i) {
        return i.id !== id;
      });
    }
    saveCart();
    render();
  }

  function removeItem(id) {
    cart = cart.filter(function (i) {
      return i.id !== id;
    });
    saveCart();
    render();
  }

  function render() {
    var itemsEl = document.getElementById("cartItems");
    var emptyEl = document.getElementById("cartEmpty");
    var totalEl = document.getElementById("cartTotal");
    var badgeEl = document.getElementById("cartBadge");
    if (!itemsEl) return;

    itemsEl.innerHTML = "";
    var total = 0;
    var count = 0;

    cart.forEach(function (i) {
      total += i.price * i.qty;
      count += i.qty;
      var row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        '<img src="' + i.img + '" alt="">' +
        '<div class="cart-item-info">' +
          "<h4>" + i.name + "</h4>" +
          '<span class="cart-item-price">' + format(i.price) + "</span>" +
          '<div class="qty-control">' +
            '<button data-act="dec" data-id="' + i.id + '">−</button>' +
            "<span>" + i.qty + "</span>" +
            '<button data-act="inc" data-id="' + i.id + '">+</button>' +
          "</div>" +
        "</div>" +
        '<button class="cart-item-remove" data-act="rm" data-id="' + i.id + '" aria-label="Remove">&times;</button>';
      itemsEl.appendChild(row);
    });

    emptyEl.style.display = cart.length === 0 ? "block" : "none";
    totalEl.textContent = format(total);
    badgeEl.textContent = count;
    badgeEl.style.display = count > 0 ? "flex" : "none";
  }

  function openCart() {
    var d = document.getElementById("cartDrawer");
    var o = document.getElementById("cartOverlay");
    if (d) d.classList.add("open");
    if (o) o.classList.add("show");
  }

  function closeCart() {
    var d = document.getElementById("cartDrawer");
    var o = document.getElementById("cartOverlay");
    if (d) d.classList.remove("open");
    if (o) o.classList.remove("show");
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (btn) {
      var id = btn.getAttribute("data-id");
      var act = btn.getAttribute("data-act");
      if (act === "inc") changeQty(id, 1);
      else if (act === "dec") changeQty(id, -1);
      else if (act === "rm") removeItem(id);
      return;
    }

    var add = e.target.closest(".add-cart-btn");
    if (add) {
      var card = add.closest(".product-card");
      addToCart({
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseInt(card.dataset.price, 10),
        img: card.dataset.img || ""
      });
      return;
    }

    if (e.target.closest("#cartBtn")) { openCart(); return; }
    if (e.target.closest("#cartClose")) { closeCart(); return; }
    if (e.target.closest("#cartOverlay")) { closeCart(); return; }
  });

  var checkout = document.getElementById("checkoutBtn");
  if (checkout) {
    checkout.addEventListener("click", function () {
      if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }
      var isCuisine = window.location.pathname.indexOf("/cuisines/") > -1;
      window.location.href = isCuisine ? "../checkout.html" : "checkout.html";
    });
  }

  render();
})();
