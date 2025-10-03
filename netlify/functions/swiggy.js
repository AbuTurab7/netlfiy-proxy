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
      url = `https://www.swiggy.com/dapi/misc/place-autocomplete?input=${input}`;
      break;

    case "address-recommend":
      url = `https://www.swiggy.com/dapi/misc/address-recommend?place_id=${place_id}`;
      break;

    default:
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Invalid type parameter" }),
      };
  }

  try {
    // Use built-in fetch
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Proxy failed", details: err.message }),
    };
  }
}
