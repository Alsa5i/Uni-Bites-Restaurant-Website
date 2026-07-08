(function () {
  var CART_KEY = "unibite_cart";
  var ORDERS_KEY = "unibite_orders";
  var LAST_KEY = "unibite_last_order";
  var DELIVERY = 5000;

  var itemsEl = document.getElementById("orderItems");
  var emptyEl = document.getElementById("orderEmpty");
  var subtotalEl = document.getElementById("orderSubtotal");
  var deliveryEl = document.getElementById("orderDelivery");
  var totalEl = document.getElementById("orderTotal");
  var form = document.getElementById("checkoutForm");
  var layout = document.getElementById("checkoutLayout");
  var success = document.getElementById("orderSuccess");

  function fmt(n) {
    return "UGX " + Number(n).toLocaleString("en-US");
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function render() {
    var cart = getCart();
    itemsEl.innerHTML = "";
    var subtotal = 0;

    if (cart.length === 0) {
      emptyEl.style.display = "block";
      subtotalEl.textContent = fmt(0);
      deliveryEl.textContent = fmt(0);
      totalEl.textContent = fmt(0);
      return;
    }

    emptyEl.style.display = "none";
    cart.forEach(function (i) {
      subtotal += i.price * i.qty;
      var row = document.createElement("div");
      row.className = "order-item";
      row.innerHTML =
        '<img src="' + i.img + '" alt="">' +
        '<div class="order-item-info"><h4>' + i.name + "</h4>" +
        "<span>" + i.qty + " × " + fmt(i.price) + "</span></div>" +
        '<span class="order-item-price">' + fmt(i.price * i.qty) + "</span>";
      itemsEl.appendChild(row);
    });

    subtotalEl.textContent = fmt(subtotal);
    deliveryEl.textContent = fmt(DELIVERY);
    totalEl.textContent = fmt(subtotal + DELIVERY);
  }

  function genId() {
    return "UB-" + Math.floor(1000 + Math.random() * 9000);
  }

  var paymentEl = document.getElementById("payment");
  var momoFields = document.getElementById("momoFields");
  var cardFields = document.getElementById("cardFields");

  function togglePayment() {
    var val = paymentEl ? paymentEl.value : "cod";
    if (momoFields) momoFields.hidden = val !== "momo";
    if (cardFields) cardFields.hidden = val !== "card";
  }

  if (paymentEl) {
    paymentEl.addEventListener("change", togglePayment);
    togglePayment();
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var cart = getCart();
      if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      var subtotal = cart.reduce(function (s, i) {
        return s + i.price * i.qty;
      }, 0);

      var order = {
        id: genId(),
        items: cart,
        subtotal: subtotal,
        delivery: DELIVERY,
        total: subtotal + DELIVERY,
        customer: {
          name: document.getElementById("fullname").value,
          phone: document.getElementById("phone").value,
          email: document.getElementById("email").value,
          address: document.getElementById("address").value,
          area: document.getElementById("area").value,
          notes: document.getElementById("notes").value
        },
        payment: document.getElementById("payment").value,
        status: 0,
        createdAt: Date.now()
      };

      var orders = [];
      try {
        orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
      } catch (err) {}
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      localStorage.setItem(LAST_KEY, order.id);
      localStorage.setItem("unibite_profile", JSON.stringify(order.customer));
      localStorage.removeItem(CART_KEY);

      document.getElementById("successOrderId").textContent = order.id;
      document.getElementById("trackBtn").href =
        "track.html?id=" + encodeURIComponent(order.id);
      layout.style.display = "none";
      success.style.display = "block";
      window.scrollTo(0, 0);
    });
  }

  render();
})();
