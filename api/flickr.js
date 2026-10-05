// Proxies Flickr photo search so the API key stays server-side (FLICKR_API_KEY env var).
module.exports = async (req, res) => {
  // browsers label every request with where it came from; only accept our own pages
  if (req.headers["sec-fetch-site"] !== "same-origin") {
    return res.status(403).json({ error: "forbidden" });
  }

  const { per_page = "25", min_upload_date, max_upload_date } = req.query;
  const params = new URLSearchParams({
    method: "flickr.photos.search",
    api_key: process.env.FLICKR_API_KEY,
    format: "json",
    nojsoncallback: "1",
    per_page: String(Math.min(parseInt(per_page) || 25, 100)),
    text: "photography",
    extras: "views,owner_name,description",
    safe_search: "1",
    content_types: "0",
  });
  if (min_upload_date) params.set("min_upload_date", min_upload_date);
  if (max_upload_date) params.set("max_upload_date", max_upload_date);

  const r = await fetch(`https://api.flickr.com/services/rest/?${params}`);
  res.status(r.status).json(await r.json());
};
