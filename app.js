const form = document.querySelector("#form");
const btn = document.querySelector("#btn");
const loading = document.querySelector("#loading");
const result = document.querySelector("#result");

const carsList = document.querySelector("#cars-list");
const refreshCarsBtn = document.querySelector("#refresh-cars");


/* =========================
   🤖 AI CAR ANALYZER
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

      result.textContent =
        "❌ " + error.message;

      result.classList.remove("hidden");

    } finally {

      btn.disabled = false;

      loading.classList.add("hidden");

    }

  });

}


/* =========================
   🚗 LOAD CARS
========================= */

async function loadCars() {

  if (!carsList) return;

  carsList.innerHTML = `
    <div class="car-loading">
      🚗 جاري تحميل السيارات...
    </div>
  `;

  try {

    const response = await fetch("/api/cars");

    const cars = await response.json();

    if (!response.ok) {

      throw new Error(
        cars.error || "تعذر تحميل السيارات."
      );

    }


    if (!cars.length) {

      carsList.innerHTML = `
        <div class="car-loading">
          🚗 ما فماش سيارات معروضة حاليًا.
        </div>
      `;

      return;

    }


    carsList.innerHTML = cars.map((car) => {

      const image = car.image_url
        ? `
          <img
            src="${escapeHtml(car.image_url)}"
            alt="${escapeHtml(car.brand)} ${escapeHtml(car.model)}"
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

            <div class="car-details">

              <span>
                📅 ${escapeHtml(String(car.year || "غير محدد"))}
              </span>

              <span>
                🛣️ ${escapeHtml(String(car.mileage || "غير محدد"))} كم
              </span>

            </div>


            <div class="car-price">

              💰 ${
                car.price
                  ? escapeHtml(String(car.price)) + " د.ت"
                  : "السعر غير محدد"
              }

            </div>


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
    (character) => {

      const characters = {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

      };

      return characters[character];

    }
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