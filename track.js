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

  function getLocalOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id") || localStorage.getItem(LAST_KEY);

  function findLocal() {
    var orders = getLocalOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === id) return orders[i];
    }
    return null;
  }

  var content = document.getElementById("trackContent");
  var notFound = document.getElementById("trackNotFound");
  var stepperEl = document.getElementById("trackStepper");
  var itemsEl = document.getElementById("trackItems");

  var order = findLocal();

  function renderStepper() {
    stepperEl.innerHTML = "";
    STEPS.forEach(function (label, idx) {
      var cls = "step";
      if (idx < order.status) cls += " done";
      else if (idx === order.status) cls += " active";
      var mark = idx < order.status ? "✓" : idx + 1;
      var div = document.createElement("div");
      div.className = cls;
      div.innerHTML = '<div class="dot">' + mark + "</div><label>" + label + "</label>";
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

  function renderAll() {
    if (!order) {
      if (content) content.style.display = "none";
      if (notFound) notFound.style.display = "block";
      return;
    }
    if (content) content.style.display = "block";
    if (notFound) notFound.style.display = "none";
    renderStepper();
    renderDetails();
  }

  renderAll();

  // Poll the server so the page reflects admin status changes live
  function poll() {
    if (!id) return;
    fetch("/api/orders")
      .then(function (r) {
        return r.json();
      })
      .then(function (list) {
        var s = list.find(function (o) {
          return o.id === id;
        });
        if (!s) return;
        if (!order) {
          order = s;
          renderAll();
        } else if (s.status !== order.status) {
          order.status = s.status;
          renderStepper();
        }
      })
      .catch(function () {});
  }

  setInterval(poll, 3000);
})();
