/**
 * Car Image Service
 * Uses real automotive APIs:
 * - CarAPI (RapidAPI): Professional car images from manufacturers
 * - Edmunds API: Official automotive data and images
 */

interface CarImageUrls {
  [key: string]: string;
}

/**
 * Fetch car images using CarAPI (RapidAPI)
 * Free tier available: https://rapidapi.com/api-sports/api/api-sports-car-specs
 * 
 * Get your API key:
 * 1. Sign up at https://rapidapi.com
 * 2. Subscribe to CarAPI (free tier available)
 * 3. Get your X-RapidAPI-Key
 */
async function fetchFromCarAPI(
  brand: string,
  model: string,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.api-sports.io/v1/cars?make=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "api-sports-cars.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      console.warn(`CarAPI error for ${brand} ${model}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const carData = data.results[0];
      // CarAPI includes image URLs in the response
      if (carData.image) {
        return carData.image;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch from CarAPI:`, error);
  }

  return null;
}

/**
 * Fetch from Edmunds API (Real automotive authority)
 * Sign up at: https://developer.edmunds.com
 * Free tier includes car photos and specifications
 */
async function fetchFromEdmunds(
  brand: string,
  model: string,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.edmunds.com/api/vehicle/v2/${encodeURIComponent(brand)}/${encodeURIComponent(model)}/photos?api_key=${apiKey}&fmt=json`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      console.warn(`Edmunds API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      // Get the primary photo
      const photo = data.photos[0];
      if (photo.photoUrl) {
        return photo.photoUrl;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch from Edmunds:`, error);
  }

  return null;
}

/**
 * Get professional car image with fallback options
 */
async function getCarImageUrl(
  brand: string,
  model: string = "",
  apiKey: string = ""
): Promise<string> {
  // Try CarAPI first (best professional images)
  if (apiKey) {
    const carApiUrl = await fetchFromCarAPI(brand, model, apiKey);
    if (carApiUrl) return carApiUrl;
  }

  // Default to placeholder if no API key or fetch fails
  return `https://via.placeholder.com/400x300?text=${encodeURIComponent(brand + " " + model)}`;
}

export { fetchFromCarAPI, fetchFromEdmunds, getCarImageUrl };
