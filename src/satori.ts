import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import sharp from "sharp";

const html = async (template: string) => {
  const { html } = await import("satori-html");
  return html(template);
};

export default async function satoriFunc(
  frameImg: string,
  addImg: string,
  desc: string,
  title: string,
  Ratio:string
) {


  let image_Data;
  console.log("addImg",addImg);

  // Get ad image size
  try {
    const adImgResponse = await fetch(addImg);
    // console.log("Ad image response:", {
    //   status: adImgResponse.status,
    //   headers: Object.fromEntries(adImgResponse.headers.entries())
    // });
    // console.log("adImgResponse",await adImgResponse.json());
    
    const imgUrl = await adImgResponse.json();
    console.log("imgUrl",imgUrl);
     image_Data = imgUrl.image;

    console.log("image_Data",image_Data);
    if (!adImgResponse.ok) {
      console.error("Failed to fetch ad image:", adImgResponse.statusText);
    }
  } catch (error) {
    console.error("Error fetching ad image:", error);
  }
  
  // Optimal dimensions for Farcaster frames (1.91:1 aspect ratio)
  let WIDTH = 504;
  let HEIGHT = 504;
  let ADD_SIZE = 70;
  let BOTTOM_HEIGHT = 100;
  let FONT_SIZE = 18;
console.log("Ratio",Ratio);

if(Ratio === "1.91:1"){
   WIDTH = 1200;
   HEIGHT = 630;
   ADD_SIZE = 120; // Increased add size for 1.91:1 ratio
   BOTTOM_HEIGHT = 150; // Increased bottom white space for 1.91:1 ratio
   FONT_SIZE = 32; // Increased font size for 1.91:1 ratio
}
if(Ratio === "1:1"){
   WIDTH = 600;
   HEIGHT = 600;
}

  // Get frame image size
  const frameImgBuffer = await fetch(frameImg).then(res => res.arrayBuffer());
  const frameImgMetadata = await sharp(Buffer.from(frameImgBuffer)).metadata();
  console.log("Frame image dimensions:", {
    width: frameImgMetadata.width,
    height: frameImgMetadata.height
  });

  //  WIDTH = frameImgMetadata?.width || WIDTH
  //  HEIGHT = frameImgMetadata?.height || HEIGHT;


  console.log("final width",WIDTH);
  console.log("final height",HEIGHT);
  
  
  const template = await html(`
     <div style="
       font-family: Roboto; 
       display: flex; 
       flex-direction: column; 
       font-size: 16px; 
       color: #000000; 
       width: ${WIDTH}px; 
       height: ${HEIGHT}px; 
       justify-content: center; 
       align-items: center;
       position: relative;
     ">
       <img 
         src=${frameImg} 
         alt="Background" 
         style="
           position: absolute;
           top: 0;
           left: 0;
           width: ${WIDTH}px; 
           height: ${HEIGHT - BOTTOM_HEIGHT}px;
           object-fit: cover;
         "
       />
       <div style="
         position: absolute;
         bottom: 0;
         left: 0;
         display: flex; 
         align-items: center; 
         justify-content: flex-start; 
         gap: 12px; 
         background-color: white; 
         width: ${WIDTH}px;
         height: ${BOTTOM_HEIGHT}px;
         padding: 16px;
       ">
          <img 
            src=${image_Data} 
            alt="Profile" 
            style="
              width: ${ADD_SIZE}px; 
              height: ${ADD_SIZE}px; 
              border-radius: 50%;
              object-fit: cover;
              border: 1px solid #ffffff;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
              margin-left: 0;
            "
          />
          <div style="
            display: flex;
            flex-direction: column;
            flex: 1;
            margin-left: 8px;
          ">
            <p style="
              font-size: ${FONT_SIZE}px; 
              margin: 0;
              max-width: ${WIDTH - (ADD_SIZE + 70)}px;
              line-height: 1.4;
              overflow-wrap: break-word;
            ">
              <strong>${title}:</strong> ${desc}
            </p>
          </div>
       </div>
     </div>
   `);

  const fontData = await fetch(
    "https://og-playground.vercel.app/inter-latin-ext-400-normal.woff"
  ).then((res) => res.arrayBuffer());

  const svg = await satori(template, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "Roboto",
        data: fontData,
        weight: 400,
        style: "normal",
      }
    ],
    debug: false,
  });

  const resvg = new Resvg(svg, {
    background: "rgba(238, 235, 230, .9)",
    fitTo: {
      mode: "width",
      value: WIDTH,
    },
    font: {
      loadSystemFonts: false,
    },
    logLevel: "error",
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Compress the image using sharp while maintaining Farcaster frame dimensions
  let compressedBuffer = await sharp(pngBuffer)
    .resize(WIDTH, HEIGHT, {
      fit: 'fill',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3 // Higher quality resampling
    })
    .png({
      quality: 100, // Maximum quality
      compressionLevel: 1, // Minimum compression
      palette: false, // Disable palette to maintain color accuracy
      dither: 1.0 // Maximum dithering for better color transitions
    })
    .toBuffer();

  // If still over 256kb, reduce quality gradually while maintaining dimensions
  while (compressedBuffer.length > 256 * 1024) {
    compressedBuffer = await sharp(pngBuffer)
      .resize(WIDTH, HEIGHT, {
        fit: 'fill',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3
      })
      .png({
        quality: 95,
        compressionLevel: 2,
        palette: true,
        colors: 256,
        dither: 0.9
      })
      .toBuffer();
  }

  const base64Png = compressedBuffer.toString("base64");
  const dataURI = `data:image/png;base64,${base64Png}`;

  // Create preview HTML
  const previewHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Generated Image Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f0f0f0;
          }
          img {
            max-width: 100%;
            height: auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <img src="${dataURI}" alt="Generated Preview">
      </body>
    </html>
  `;

  // fs.writeFileSync('src/preview.html', previewHtml);
  console.log("done");

  return dataURI;
}