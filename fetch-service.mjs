const RENDER_API_KEY = "rnd_TlYNDDSYNzkpmfNuLbuBaUCwVT0s";
const SERVICE_ID = "srv-d8rbpofavr4c73ece4c0";

async function fetchService() {
  const res = await fetch(`https://api.render.com/v1/services/${SERVICE_ID}`, {
    headers: { "Authorization": `Bearer ${RENDER_API_KEY}`, "Accept": "application/json" }
  });
  console.log(await res.json());
}

fetchService();
