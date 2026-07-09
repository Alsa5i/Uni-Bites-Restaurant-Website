(function () {
  var STEPS = ["Order Confirmed", "Preparing your food", "Out for delivery", "Delivered"];
  var LAST_STEP = STEPS.length - 1;

  function getStore(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function fmt(n) {
    return "UGX " + Number(n || 0).toLocaleString("en-US");
  }

  function compute(orders) {
    var received = orders.length;
    var completed = 0;
    var progress = 0;
    var sales = 0;
    var counts = {};

    orders.forEach(function (o) {
      var status = o.status || 0;
      if (status === LAST_STEP) {
        completed++;
        sales += o.total || 0;
      } else if (status > 0) {
        progress++;
      }
      (o.items || []).forEach(function (i) {
        counts[i.name] = (counts[i.name] || 0) + (i.qty || 0);
      });
    });

    var top = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a];
    })[0];

    var dishes = getStore("unibite_dishes", []).length;

    return {
      received: received,
      completed: completed,
      progress: progress,
      sales: sales,
      top: top || "—",
      items: dishes
    };
  }

  function render(s) {
    var el;
    el = document.getElementById("statReceived"); if (el) el.textContent = s.received;
    el = document.getElementById("statCompleted"); if (el) el.textContent = s.completed;
    el = document.getElementById("statProgress"); if (el) el.textContent = s.progress;
    el = document.getElementById("statSales"); if (el) el.textContent = fmt(s.sales);
    el = document.getElementById("statTop"); if (el) el.textContent = s.top;
    el = document.getElementById("statItems"); if (el) el.textContent = s.items;
  }

  function refresh() {
    fetch("/api/orders")
      .then(function (r) {
        return r.json();
      })
      .then(function (list) {
        render(compute(list));
      })
      .catch(function () {
        render(compute(getStore("unibite_orders", [])));
      });
  }

  refresh();
  setInterval(refresh, 5000);
})();
