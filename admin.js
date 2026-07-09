(function () {
  var STEPS = ["Order Confirmed", "Preparing your food", "Out for delivery", "Delivered"];
  var ORDERS_KEY = "unibite_orders";
  var DISHES_KEY = "unibite_dishes";
  var CUISINES_KEY = "unibite_cuisines";

  function getStore(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }
  function setStore(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function fmt(n) {
    return "UGX " + Number(n || 0).toLocaleString("en-US");
  }
  function slugify(s) {
    return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function api(method, url, body) {
    return fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    })
      .then(function (r) {
        return r.json().then(function (b) {
          return { ok: r.ok, body: b };
        });
      })
      .catch(function () {
        return { ok: false };
      });
  }

  // ---- Operator authentication ----
  var auth = null;
  try {
    auth = JSON.parse(localStorage.getItem("unibite_auth"));
  } catch (e) {}
  if (!auth || auth.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("opUser").textContent = "Signed in as " + (auth.name || "Admin");
  document.getElementById("opLogout").addEventListener("click", function () {
    localStorage.removeItem("unibite_auth");
    window.location.href = "login.html";
  });

  // Sidebar tabs
  var TITLES = { orders: "Orders", dishes: "Dishes", cuisines: "Cuisines" };
  document.querySelectorAll(".op-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".op-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      document.querySelectorAll(".op-panel").forEach(function (p) {
        p.classList.remove("active");
      });
      tab.classList.add("active");
      document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
      document.getElementById("opTitle").textContent = TITLES[tab.dataset.tab];
    });
  });

  // Orders (from server, with localStorage fallback)
  function loadOrders() {
    var el = document.getElementById("ordersTable");
    api("GET", "/api/orders").then(function (res) {
      var list = res.ok ? res.body : getStore(ORDERS_KEY, []);
      if (!list.length) {
        el.innerHTML = '<p class="op-empty">No orders yet.</p>';
        return;
      }
      var rows = list
        .slice()
        .reverse()
        .map(function (o) {
          var opts = STEPS.map(function (s, i) {
            return '<option value="' + i + '"' + (i === (o.status || 0) ? " selected" : "") + ">" + s + "</option>";
          }).join("");
          var items = (o.items || [])
            .map(function (i) {
              return i.name + " ×" + i.qty;
            })
            .join(", ");
          var date = new Date(o.createdAt || Date.now()).toLocaleString("en-US");
          return (
            "<tr><td><strong>" + o.id + "</strong><br><small>" + date + "</small></td>" +
            "<td>" + ((o.customer && o.customer.name) || "Guest") + "<br><small>" + ((o.customer && o.customer.phone) || "") + "</small></td>" +
            "<td>" + (items || "—") + "</td>" +
            "<td>" + fmt(o.total) + "</td>" +
            '<td><select data-order="' + o.id + '">' + opts + "</select></td></tr>"
          );
        })
        .join("");
      el.innerHTML =
        '<table class="op-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>' +
        rows +
        "</tbody></table>";

      el.querySelectorAll("select[data-order]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          var status = Number(sel.value);
          var orders = getStore(ORDERS_KEY, []);
          var local = orders.find(function (x) {
            return x.id === sel.dataset.order;
          });
          if (local) {
            local.status = status;
            setStore(ORDERS_KEY, orders);
          }
          api("PATCH", "/api/orders/" + sel.dataset.order + "/status", { status: status });
        });
      });
    });
  }

  // Dishes
  function fillCuisineSelect() {
    var sel = document.getElementById("dCuisine");
    var list = getStore(CUISINES_KEY, []);
    sel.innerHTML =
      list
        .map(function (c) {
          return '<option value="' + c.name + '">' + c.name + "</option>";
        })
        .join("") || '<option value="">—</option>';
  }

  function loadDishes() {
    var el = document.getElementById("dishesList");
    var list = getStore(DISHES_KEY, []);
    if (!list.length) {
      el.innerHTML = '<p class="op-empty">No dishes yet.</p>';
      return;
    }
    var rows = list
      .map(function (d) {
        return (
          "<tr><td>" + d.name + "</td><td>" + (d.cuisine || "—") + "</td><td>" + fmt(d.price) + "</td>" +
          '<td><button class="op-del" data-dish="' + d.id + '">Delete</button></td></tr>'
        );
      })
      .join("");
    el.innerHTML =
      '<table class="op-table"><thead><tr><th>Name</th><th>Cuisine</th><th>Price</th><th></th></tr></thead><tbody>' +
      rows +
      "</tbody></table>";
    el.querySelectorAll("button[data-dish]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dishes = getStore(DISHES_KEY, []);
        setStore(
          DISHES_KEY,
          dishes.filter(function (d) {
            return d.id !== btn.dataset.dish;
          })
        );
        loadDishes();
        fillCuisineSelect();
      });
    });
  }

  document.getElementById("dishForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("dishMsg");
    var dishes = getStore(DISHES_KEY, []);
    dishes.push({
      id: "D" + Date.now(),
      name: document.getElementById("dName").value,
      price: Number(document.getElementById("dPrice").value),
      cuisine: document.getElementById("dCuisine").value,
      img: document.getElementById("dImg").value,
      desc: document.getElementById("dDesc").value
    });
    setStore(DISHES_KEY, dishes);
    msg.className = "op-msg ok";
    msg.textContent = "Dish added.";
    e.target.reset();
    loadDishes();
  });

  // Cuisines
  function loadCuisines() {
    var el = document.getElementById("cuisinesList");
    var list = getStore(CUISINES_KEY, []);
    if (!list.length) {
      el.innerHTML = '<p class="op-empty">No cuisines yet.</p>';
      return;
    }
    var rows = list
      .map(function (c) {
        return (
          "<tr><td>" + c.name + "</td><td>" + (c.desc || "—") + "</td>" +
          '<td><a class="btn btn-ghost" href="cuisines/cuisine.html?name=' + encodeURIComponent(c.name) + '" target="_blank">View page</a></td>' +
          '<td><button class="op-del" data-cuisine="' + c.id + '">Delete</button></td></tr>'
        );
      })
      .join("");
    el.innerHTML =
      '<table class="op-table"><thead><tr><th>Name</th><th>Description</th><th>Page</th><th></th></tr></thead><tbody>' +
      rows +
      "</tbody></table>";
    el.querySelectorAll("button[data-cuisine]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cuisines = getStore(CUISINES_KEY, []);
        setStore(
          CUISINES_KEY,
          cuisines.filter(function (c) {
            return c.id !== btn.dataset.cuisine;
          })
        );
        loadCuisines();
        fillCuisineSelect();
      });
    });
  }

  document.getElementById("cuisineForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("cuisineMsg");
    var name = document.getElementById("cName").value;
    var cuisines = getStore(CUISINES_KEY, []);
    cuisines.push({ id: "C" + Date.now(), name: name, slug: slugify(name), desc: document.getElementById("cDesc").value });
    setStore(CUISINES_KEY, cuisines);
    msg.className = "op-msg ok";
    msg.textContent = "Cuisine added. It now appears on the home page.";
    e.target.reset();
    loadCuisines();
    fillCuisineSelect();
  });

  loadOrders();
  loadDishes();
  loadCuisines();
  fillCuisineSelect();
})();
