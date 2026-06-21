const RENDER_API_KEY = "rnd_TlYNDDSYNzkpmfNuLbuBaUCwVT0s";
const SERVICE_ID = "srv-d8rbpofavr4c73ece4c0";

async function triggerDeploy() {
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

triggerDeploy().catch(console.error);
