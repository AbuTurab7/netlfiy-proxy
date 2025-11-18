export async function handler(event) {
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

  let url = "";

  switch (type) {
    case "restaurants":
      url = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}`;
      break;

    case "menu":
      url = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&lat=${lat}&lng=${lng}&restaurantId=${id}`;
      break;

    case "autocomplete":
      url = `https://www.swiggy.com/dapi/misc/place-autocomplete?input=${encodeURIComponent(
        input
      )}`;
      break;

    case "address-recommend":
      url = `https://www.swiggy.com/dapi/misc/address-recommend?place_id=${encodeURIComponent(
        place_id
      )}`;
      break;

    default:
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Invalid type" }),
      };
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        "Accept": "application/json",
        // KEY FIX — Swiggy blocks these if present
        "Origin": null,
        "Referer": null,
      },
    });

    const text = await response.text();

    if (text.startsWith("<")) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          error: "Swiggy returned HTML (blocked)",
          preview: text.slice(0, 250),
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
      body: JSON.stringify({ error: "Proxy error", details: err.message }),
    };
  }
}
