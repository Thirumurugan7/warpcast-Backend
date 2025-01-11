import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { Request, Response } from "express";
import axios from "axios";
import { Stream } from "stream";
import { JSDOM } from "jsdom";
import satoriFunc from "./satori";
import { getUserLabels } from "./utils/mbd/getUserLabels";
import { skip } from "node:test";
import fs from "fs";

const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("*", async (req: Request, res: Response) => {
  const frame_data = {
    untrustedData: {
      fid: 389273,
      url: "https://fcpolls.com/polls/1",
      messageHash: "0xd2b1ddc6c88e865a33cb1a565e0058d757042974",
      timestamp: 1706243218,
      network: 1,
      buttonIndex: 2,
      inputText: "hello world", // "" if requested and no input, undefined if input not requested
      castId: {
        fid: 226,
        hash: "0xa48dd46161d8e57725f5e26e34ec19c13ff7f3b9",
      },
    },
    trustedData: {
      messageBytes: "d2b1ddc6c88e865a33cb1a565e0058d757042974...",
    },
  };

  fetch("https://api.pinata.cloud/farcaster/frames/interactions", {
    method: "POST",
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YzNlOGIxYS0yZTI2LTRkNzUtOGQ0Yi1iMWRmNTUyOGJiYWEiLCJlbWFpbCI6ImZhYmlhbmZlcm5vQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxMGQ1OWM0ZTUxZDJmNDUyYWZiOCIsInNjb3BlZEtleVNlY3JldCI6IjQ2MzM2OTA1ZTNmYzQ0ZDI4N2M4YTIwYmFhYWU0NjBmZjZjMjIzOTI5OWI5MjA1MWEzMGY4ZWQ4YWQ4Njg0NWUiLCJpYXQiOjE3MTEwMTc2OTZ9._IUzsF1TY5FktV8Z0yN7Xc0UjcM9Mjh1r1DnqdHW3pU",
      "Content-Type": "application/json",
    },
    body: '{"frame_id":"relayer","custom_id":"user_123","data":{"untrustedData":{"fid":2,"url":"https://fcpolls.com/polls/1","messageHash":"0xd2b1ddc6c88e865a33cb1a565e0058d757042974","timestamp":1706243218,"network":1,"buttonIndex":2,"inputText":"hello world","castId":{"fid":226,"hash":"0xa48dd46161d8e57725f5e26e34ec19c13ff7f3b9"}},"trustedData":{"messageBytes":"d2b1ddc6c88e865a33cb1a565e0058d757042974..."}}}',
  })
    .then((response) => response.json())
    .then(() => console.log("response came"))
    // .then((response) => console.log(response))
    .catch((err) => console.error(err));

  const targetLabels = await getUserLabels(
    frame_data.untrustedData.fid.toString()
  );
  console.log("targetLabels :", targetLabels);

  interface Metadata {
    title: string;
    description: string;
  }

  interface Ad {
    id: string;
    labels: string[];
    metadata: string;
  }

  // Initial randomAdDisplay object
  let randomAdDisplay: Ad = {
    id: "",
    labels: [],
    metadata: "",
  };

  try {
    const response = await fetch(
      "https://api.studio.thegraph.com/query/99932/wardads/v0.0.9",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add your authentication header or any other necessary headers
          // "Authorization": "Bearer YOUR_TOKEN"
        },
        body: JSON.stringify({
          query: `
    query MyQuery {
      ads {
        id
        labels
        metadata
      }
    }
  `,
        }),
      }
    );
    const data = await response.json();

    console.log("data :", data);
    const ads = data.data.ads;

    console.log("ads",ads);
    

    // Filter ads that match any of the target labels
    const filteredAds = ads.filter((ad: any) =>
      ad.labels.some((label: any) => ["testing"].includes(label))
    );

    if (filteredAds.length > 0) {
      // Select a random ad from the filtered ads
      const randomAd =
        filteredAds[Math.floor(Math.random() * filteredAds.length)];
      console.log(randomAd);
      randomAdDisplay = randomAd;
    } else {
      console.log("No ads match the target labels");
      // skip
      // pass
      return null;
    }
  } catch (err) {
    console.error(err);
  }

  const targetUrl = req.query.url + req.path;

  console.log("targetUrl",targetUrl)
  try {
    const { "set-cookie": _, ...filteredHeaders } = req.headers;

    let response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: { ...filteredHeaders, host: new URL(targetUrl).host },
      responseType: "stream",
    });
console.log("response",response);

    try {
      // Collect the stream data into a buffer
      const chunks: any[] = [];

      console.log("response.data",response.data);
      
      response.data.on("data", (chunk: any) => chunks.push(chunk));
      response.data.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const htmlContent = buffer.toString("utf8");

        // console.log("htmlContent",htmlContent);
        // Use jsdom to parse the HTML response
        const dom = new JSDOM(htmlContent);
        fs.writeFileSync('src/original.html', htmlContent);

        // console.log("dom",dom);
        console.log("dom",dom.window.document);
        
        const metaElement = dom.window.document.querySelector(
          'meta[property="fc:frame:image"]'
        );

console.log("metaElement",metaElement);

        const mainUrl = metaElement!.getAttribute("content") as string;
        // const logo =
        //   "data:image/png;base64,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";
        const metadataObject = JSON.parse(randomAdDisplay.metadata);
        const description = metadataObject.description;
        const title = metadataObject.title;

        console.log("description",description);
        console.log("title",title);
// console.log("mainUrl",mainUrl);

const img = "https://pbs.twimg.com/profile_banners/1536344987276759042/1727637358/1500x500"

        const satoriImg = await satoriFunc(mainUrl, "data:image/jpeg;base64,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", description, title);

        // console.log("satoriImg",satoriImg);

        if (metaElement) {
          metaElement.setAttribute("content", satoriImg);
        }

        // Serialize the modified HTML back to a string
        const modifiedHtml = dom.serialize();

        // Send the modified HTML to the client
        res.writeHead(response.status, {
          "Content-Type": "text/html",
          charset: "utf-8",
        });
        res.end(modifiedHtml);
      });
    } catch (error) {
      console.error("Error parsing HTML:", error);
      // Relay the original response if parsing fails
      //   res.writeHead(response.status, response.headers);
      res.end(response.data);
    }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // Forward the response from the target server to the client
      //   res.writeHead(error.response.status, error.response.headers);
      if (error.response.data) {
        (error.response.data as Stream).pipe(res);
      } else {
        res.end();
      }
    } else {
      console.error("Error relaying request:", error);
      res.status(500).send(`Failed to relay request: ${error}`);
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
