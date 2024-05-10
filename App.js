const fs = require("fs");
const wppconnect = require("@wppconnect-team/wppconnect");
const { OpenAI } = require("openai");

// Chave OpenAI.
const openai = new OpenAI({
  apiKey: ''
});

// Inicialização do cliente do WhatsApp
async function createWhatsAppClient() {
  try {
    const client = await wppconnect.create({
      session: "sessionName",
      catchQR: (base64Qr, asciiQR) => {
        console.log(asciiQR); // Opcional para registrar o QR no terminal
        var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
          response = {};

        if (matches.length !== 3) {
          throw new Error("String de entrada inválida");
        }
        response.type = matches[1];
        response.data = Buffer.from(matches[2], "base64");

        var imageBuffer = response;
        fs.writeFile(
          "out.png",
          imageBuffer["data"],
          "binary",
          function (err) {
            if (err != null) {
              console.log(err);
            }
          }
        );
      },
      logQR: false,
    });
    await start(client);
  } catch (error) {
    console.log(error);
  }
}

// Inicialização do cliente do WhatsApp
async function start(client) {
  client.onMessage(async (message) => {
    if (message.body !== null) {
      try {
        const gptResponse = await openai.Completion.create({
          engine: 'davinci',
          prompt: message.body,
          max_tokens: 150
        });

        const gptMessage = gptResponse.data.choices[0].text;

        client.sendText(message.from, gptMessage);
      } catch (error) {
        console.error("Erro:", error);
      }
    }
  });
}

// Inicialização do cliente do WhatsApp
createWhatsAppClient();
