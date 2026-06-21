const RENDER_API_KEY = "rnd_TlYNDDSYNzkpmfNuLbuBaUCwVT0s";
const SERVICE_ID = "srv-d8rbpofavr4c73ece4c0";

const envVars = [
  { key: "CLIENT_URL", value: "https://samaramai.web.app" },
  { key: "GROQ_API_KEY", value: "your_groq_api_key" },
  { key: "GOOGLE_CLOUD_API_KEY", value: "AIzaSyBGvgNLbLHLRgDYR5ETyCLFlD5tnup6l7A" },
  { key: "CLOUDINARY_CLOUD_NAME", value: "drqdt85wr" },
  { key: "CLOUDINARY_API_KEY", value: "151742295125331" },
  { key: "CLOUDINARY_API_SECRET", value: "KCWQ32hDmwW6omQD2prMUKswISM" }
];

async function updateRender() {
  console.log("Updating environment variables on Render...");
  
  // Render requires a completely new array of env vars or an update. We can use the PATCH endpoint or PUT endpoint?
  // Actually, we can update individual env vars via PUT /services/{serviceId}/env-vars
  // Wait, the API for updating env vars is PUT /v1/services/{serviceId}/env-vars, passing an array.
  // Wait, if I pass an array, does it overwrite existing ones? Yes.
  // So it's better to fetch existing first.
  
  const res = await fetch(`https://api.render.com/v1/services/${SERVICE_ID}/env-vars`, {
    headers: { "Authorization": `Bearer ${RENDER_API_KEY}`, "Accept": "application/json" }
  });
  const existing = await res.json();
  
  const currentMap = new Map();
  for (const ev of existing) {
    currentMap.set(ev.envVar.key, ev.envVar.value);
  }
  
  for (const ev of envVars) {
    currentMap.set(ev.key, ev.value);
  }
  
  const newEnvVars = Array.from(currentMap.entries()).map(([key, value]) => ({ key, value }));
  
  const updateRes = await fetch(`https://api.render.com/v1/services/${SERVICE_ID}/env-vars`, {
    method: "PUT",
    headers: { 
      "Authorization": `Bearer ${RENDER_API_KEY}`, 
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newEnvVars)
  });
  
  if (updateRes.ok) {
    console.log("Successfully updated env vars.");
  } else {
    console.error("Failed to update env vars:", await updateRes.text());
    return;
  }
  
  console.log("Triggering manual deploy...");
  const deployRes = await fetch(`https://api.render.com/v1/services/${SERVICE_ID}/deploys`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${RENDER_API_KEY}`, 
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ clearCache: "clear" })
  });
  
  if (deployRes.ok) {
    console.log("Successfully triggered deploy.");
  } else {
    console.error("Failed to trigger deploy:", await deployRes.text());
  }
}

updateRender().catch(console.error);
