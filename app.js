const form = document.querySelector("#form");
const btn = document.querySelector("#btn");
const loading = document.querySelector("#loading");
const result = document.querySelector("#result");

const carsList = document.querySelector("#cars-list");
const refreshCarsBtn = document.querySelector("#refresh-cars");


/* =========================
   🤖 AI ANALYZER
========================= */

if (form) {

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    btn.disabled = true;
    loading.classList.remove("hidden");
    result.classList.add("hidden");

    const data = Object.fromEntries(
      new FormData(form).entries()
    );

    try {

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.error || "صار خطأ أثناء التحليل."
        );
      }

      result.textContent = json.result;
      result.classList.remove("hidden");

    } catch (error) {

      result.textContent = "❌ " + error.message;
      result.classList.remove("hidden");

    } finally {

      btn.disabled = false;
      loading.classList.add("hidden");

    }

  });

}


/* =========================
   🚗 MARKETPLACE
========================= */

async function loadCars() {

  if (!carsList) return;

  carsList.innerHTML = `
    <div class="car-loading">
      🚗 جاري تحميل السيارات...
    </div>
  `;

  try {

    const response = await fetch("/api/cars", {
      method: "GET",
      cache: "no-store"
    });

    const cars = await response.json();

    if (!response.ok) {
      throw new Error(
        cars.error || "تعذر تحميل السيارات."
      );
    }

    if (!Array.isArray(cars) || cars.length === 0) {

      carsList.innerHTML = `
        <div class="car-loading">
          🚗 ما فماش سيارات معروضة حاليًا.
        </div>
      `;

      return;
    }


    carsList.innerHTML = cars.map(car => {

      const image = car.image_url
        ? `
          <img
            src="${escapeHtml(car.image_url)}"
            alt="${escapeHtml(car.brand || "")} ${escapeHtml(car.model || "")}"
            loading="lazy"
          >
        `
        : `
          <div class="car-placeholder">
            🚗
          </div>
        `;


      const phone = car.seller_phone
        ? `
          <a
            class="cta car-phone"
            href="tel:${encodeURIComponent(car.seller_phone)}"
          >
            📞 اتصل بالبائع
          </a>
        `
        : "";


      return `
        <article class="car-card">

          ${image}

          <div class="car-info">

            <h3>
              🚗 ${escapeHtml(car.brand || "")}
              ${escapeHtml(car.model || "")}
            </h3>

            <p>
              📅 ${escapeHtml(String(car.year || "غير محدد"))}
            </p>

            <p>
              🛣️ ${escapeHtml(String(car.mileage || "غير محدد"))} كم
            </p>

            <p class="car-price">
              💰 ${
                car.price
                  ? escapeHtml(String(car.price)) + " د.ت"
                  : "السعر غير محدد"
              }
            </p>

            <p>
              📍 ${escapeHtml(car.governorate || "غير محدد")}
            </p>

            ${
              car.fuel
                ? `<p>⛽ ${escapeHtml(car.fuel)}</p>`
                : ""
            }

            ${
              car.gearbox
                ? `<p>⚙️ ${escapeHtml(car.gearbox)}</p>`
                : ""
            }

            ${
              car.description
                ? `
                  <p class="car-description">
                    ${escapeHtml(car.description)}
                  </p>
                `
                : ""
            }

            ${phone}

          </div>

        </article>
      `;

    }).join("");


  } catch (error) {

    carsList.innerHTML = `
      <div class="car-loading">
        ❌ ${escapeHtml(error.message)}
      </div>
    `;

  }

}


/* =========================
   🔒 SECURITY
========================= */

function escapeHtml(value) {

  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );

}


/* =========================
   🔄 REFRESH
========================= */

if (refreshCarsBtn) {

  refreshCarsBtn.addEventListener(
    "click",
    loadCars
  );

}


/* =========================
   🚀 START
========================= */

loadCars();