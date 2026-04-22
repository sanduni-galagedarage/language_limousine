const axios = require("axios");

// In-memory cache: query -> { lat, lng, address, cachedAt }
const geocodeCache = new Map();
let lastRequestAt = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(req, res) {
  try {
    const q = (req.query.q || "").toString().trim();
    const country = (req.query.country || "ca").toString();

    if (!q) {
      return res.status(400).json({ success: false, message: "q is required" });
    }

    const key = `${q}|${country}`.toLowerCase();
    if (geocodeCache.has(key)) {
      return res.json({ success: true, data: geocodeCache.get(key), cached: true });
    }

    const now = Date.now();
    const elapsed = now - lastRequestAt;
    if (elapsed < 1100) {
      await sleep(1100 - elapsed);
    }

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        format: "json",
        q,
        limit: 1,
        countrycodes: country,
        addressdetails: 1,
        email: "admin@language-limousine.local",
      },
      timeout: 20000,
      headers: {
        "User-Agent": "LanguageLimousine/1.0 (admin@language-limousine.local)",
        Accept: "application/json",
      },
    });

    lastRequestAt = Date.now();

    if (Array.isArray(response.data) && response.data.length > 0) {
      const loc = response.data[0];
      const payload = {
        lat: parseFloat(loc.lat),
        lng: parseFloat(loc.lon),
        address: loc.display_name,
      };
      geocodeCache.set(key, payload);
      return res.json({ success: true, data: payload, cached: false });
    }

    return res.json({ success: true, data: null });
  } catch (err) {
    console.error("geocode error", err.message || err);
    return res.status(500).json({ success: false, message: "geocode failed" });
  }
}

module.exports = { geocode };
