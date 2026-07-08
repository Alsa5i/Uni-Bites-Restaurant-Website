(function () {
  var ORDERS_KEY = "unibite_orders";
  var LAST_KEY = "unibite_last_order";
  var STEPS = ["Order Confirmed", "Preparing your food", "Out for delivery", "Delivered"];
  var PAYMENTS = {
    cod: "Cash on Delivery",
    momo: "Mobile Money",
    card: "Card"
  };

  function fmt(n) {
    return "UGX " + Number(n).toLocaleString("en-US");
  }

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function findOrder() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id") || localStorage.getItem(LAST_KEY);
    var orders = getOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === id) return orders[i];
    }
    return null;
  }

  function saveOrder(order) {
    var orders = getOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === order.id) {
        orders[i] = order;
        break;
      }
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  var content = document.getElementById("trackContent");
  var notFound = document.getElementById("trackNotFound");
  var order = findOrder();

  if (!order) {
    if (content) content.style.display = "none";
    if (notFound) notFound.style.display = "block";
    return;
  }

  var stepperEl = document.getElementById("trackStepper");
  var itemsEl = document.getElementById("trackItems");

  function renderStepper() {
    stepperEl.innerHTML = "";
    STEPS.forEach(function (label, idx) {
      var cls = "step";
      if (idx < order.status) cls += " done";
      else if (idx === order.status) cls += " active";
      var mark = idx < order.status ? "✓" : idx + 1;
      var div = document.createElement("div");
      div.className = cls;
      div.innerHTML =
        '<div class="dot">' + mark + "</div><label>" + label + "</label>";
      stepperEl.appendChild(div);
    });
  }

  function renderDetails() {
    document.getElementById("trackId").textContent = order.id;
    itemsEl.innerHTML = "";
    order.items.forEach(function (i) {
      var row = document.createElement("div");
      row.className = "order-item";
      row.innerHTML =
        '<img src="' + i.img + '" alt="">' +
        '<div class="order-item-info"><h4>' + i.name + "</h4>" +
        "<span>" + i.qty + " × " + fmt(i.price) + "</span></div>" +
        '<span class="order-item-price">' + fmt(i.price * i.qty) + "</span>";
      itemsEl.appendChild(row);
    });
    document.getElementById("trackSubtotal").textContent = fmt(order.subtotal);
    document.getElementById("trackDelivery").textContent = fmt(order.delivery);
    document.getElementById("trackTotal").textContent = fmt(order.total);

    document.getElementById("trackName").textContent = order.customer.name;
    document.getElementById("trackPhone").textContent = order.customer.phone;
    document.getElementById("trackAddress").textContent = order.customer.address;
    document.getElementById("trackArea").textContent = order.customer.area;
    document.getElementById("trackPayment").textContent =
      PAYMENTS[order.payment] || order.payment;
  }

  renderStepper();
  renderDetails();

  var timer = setInterval(function () {
    if (order.status < STEPS.length - 1) {
      order.status += 1;
      saveOrder(order);
      renderStepper();
    } else {
      clearInterval(timer);
    }
  }, 5000);
})();
