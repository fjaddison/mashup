export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const r = await fetch(`https://nouns.wtf/api/noun/${id}`);
    if (!r.ok) throw new Error(`Nouns API returned ${r.status}`);
    // console.log(r)
    const contentType = r.headers.get('content-type');
    console.log(contentType);
    const text = await r.text();
    console.log(text)
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(text, 'text/html');
    // const svgElement = doc.querySelector('svg');
    // const svgString = new XMLSerializer().serializeToString(svgElement);

    // If it's an HTML document, parse it to find the <svg> element
    // if (contentType.includes('text/html')) {
    //   const parser = new DOMParser();
    //   const doc = parser.parseFromString(text, 'text/html');
    //   const svgElement = doc.querySelector('svg');

    //   if (svgElement) {
    //     // Serialize the SVG element back to a string
    //     return new XMLSerializer().serializeToString(svgElement);
    //   } else {
    //     console.error('No SVG found in HTML response:', text.slice(0, 100)); // Log for debugging
    //     throw new Error('No SVG element found in HTML response');
    //   }
    // }

    const data = await r.json();
    // console.log(data)

    // Optional caching header so Vercel can edge-cache the result
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}