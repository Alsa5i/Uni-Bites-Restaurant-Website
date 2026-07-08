(function () {
  var ORDERS_KEY = "unibite_orders";
  var PROFILE_KEY = "unibite_profile";
  var CART_KEY = "unibite_cart";
  var STEPS = [
    "Order Confirmed",
    "Preparing your food",
    "Out for delivery",
    "Delivered"
  ];

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

  function getProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY));
    } catch (e) {
      return null;
    }
  }

  var orders = getOrders();
  var profile = getProfile();
  if (!profile && orders.length) {
    profile = orders[orders.length - 1].customer;
  }

  var nameEl = document.getElementById("profileName");
  var emailEl = document.getElementById("profileEmail");
  var phoneEl = document.getElementById("profilePhone");
  var avatarEl = document.getElementById("profileAvatar");

  if (profile) {
    nameEl.textContent = profile.name || "Customer";
    emailEl.textContent = profile.email || "";
    phoneEl.textContent = profile.phone || "";
    avatarEl.textContent = profile.name
      ? profile.name.charAt(0).toUpperCase()
      : "U";
  } else {
    nameEl.textContent = "Guest";
    avatarEl.textContent = "U";
  }

  var historyEl = document.getElementById("orderHistory");
  var noOrders = document.getElementById("noOrders");

  if (orders.length === 0) {
    noOrders.style.display = "block";
  } else {
    orders
      .slice()
      .reverse()
      .forEach(function (o) {
        var statusIdx = o.status || 0;
        var itemsHtml = o.items
          .map(function (it) {
            return (
              '<div class="history-thumb"><img src="' +
              it.img +
              '" alt=""><span class="history-qty">' +
              it.qty +
              "</span></div>"
            );
          })
          .join("");

        var date = new Date(o.createdAt || Date.now()).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "short", day: "numeric" }
        );

        var card = document.createElement("div");
        card.className = "history-card";
        card.innerHTML =
          '<div class="history-top"><div><h3>Order ' +
          o.id +
          '</h3><span class="history-date">' +
          date +
          '</span></div><span class="status-badge status-' +
          statusIdx +
          '">' +
          STEPS[statusIdx] +
          "</span></div>" +
          '<div class="history-items">' +
          itemsHtml +
          "</div>" +
          '<div class="history-bottom"><span class="history-total">' +
          fmt(o.total) +
          '</span><div class="history-actions">' +
          '<a class="btn btn-sm" href="track.html?id=' +
          encodeURIComponent(o.id) +
          '">Track</a>' +
          '<button class="btn btn-sm btn-ghost reorder-btn" data-id="' +
          o.id +
          '">Reorder</button>' +
          "</div></div>";
        historyEl.appendChild(card);
      });
  }

  historyEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".reorder-btn");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var order = null;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === id) {
        order = orders[i];
        break;
      }
    }
    if (!order) return;

    var cart = [];
    try {
      cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (err) {}

    order.items.forEach(function (it) {
      var ex = null;
      for (var j = 0; j < cart.length; j++) {
        if (cart[j].id === it.id) {
          ex = cart[j];
          break;
        }
      }
      if (ex) ex.qty += it.qty;
      else
        cart.push({
          id: it.id,
          name: it.name,
          price: it.price,
          img: it.img,
          qty: it.qty
        });
    });

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.location.href = "checkout.html";
  });
})();
