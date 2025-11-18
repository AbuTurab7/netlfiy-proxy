export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  const { type, lat, lng, id, input, place_id } = event.queryStringParameters;

  if (!type) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Missing type parameter" }),
    };
  }

  let url = "";

  switch (type) {
    case "restaurants":
      url = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`;
      break;

    case "menu":
      url = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${id}&submitAction=ENTER`;
      break;

    case "autocomplete":
      url = `https://www.swiggy.com/dapi/misc/place-autocomplete?input=${encodeURIComponent(input)}`;
      break;

    case "address-recommend":
      url = `https://www.swiggy.com/dapi/misc/address-recommend?place_id=${encodeURIComponent(place_id)}`;
      break;

    default:
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Invalid type parameter" }),
      };
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.swiggy.com/",
        "Origin": "https://www.swiggy.com",

        // These are critical for autocomplete
        "X-Swiggy-Device-ID": "desktop-web",
        "X-User-Type": "web",
        "X-Session-ID": "dummy-session",

        // Cookies required for autocomplete
        "Cookie":
          "navType=default; fontsLoaded=1; swiggy_jar=web; deviceId=desktop-web",
      },
    });

    const text = await response.text();

    if (text.startsWith("<")) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          error: "Swiggy returned HTML instead of JSON (blocked)",
          details: text.slice(0, 200),
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Proxy failed", details: err.message }),
    };
  }
}
