import fetch from "node-fetch";

export async function handler(event) {
  const { type, lat, lng, id, input, place_id } = event.queryStringParameters;

  if (!type) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing type parameter" }) };
  }

  let url = "";

  switch (type) {
    case "restaurants":
      if (!lat || !lng) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing lat/lng" }) };
      }
      url = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`;
      break;

    case "menu":
      if (!id || !lat || !lng) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing id/lat/lng" }) };
      }
      url = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${id}&submitAction=ENTER`;
      break;

    case "autocomplete":
      if (!input) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing input" }) };
      }
      url = `https://www.swiggy.com/dapi/misc/place-autocomplete?input=${input}`;
      break;

    case "address-recommend":
      if (!place_id) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing place_id" }) };
      }
      url = `https://www.swiggy.com/dapi/misc/address-recommend?place_id=${place_id}`;
      break;

    default:
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid type parameter" }) };
  }

  try {
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
      body: JSON.stringify({ error: "Proxy failed", details: err.message }),
    };
  }
}
