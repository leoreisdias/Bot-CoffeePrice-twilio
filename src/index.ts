import * as express from "express";
import { Request, Response } from "express";

import * as bodyParser from "body-parser";
import { twiml } from "twilio";
import { JSDOM } from "jsdom";
import axios from "axios";

const app = express.default();
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
  console.log("Servidor ativo na porta 3000!");
});

app.post("/", (req: Request, res: Response) => {
  console.log("nova mensagem", req.body.Body);

  const availableOptions = ["cafe", "café"];

  if (availableOptions.includes(req.body.Body.toLowerCase())) {
    const vgmUrl =
      "https://www.noticiasagricolas.com.br/cotacoes/cafe/cafe-arabica-mercado-fisico-tipo-6-duro";

    (async () => {
      const response = await axios(vgmUrl);
      const dom = new JSDOM(response.data);

      const lastestClosingPrice = dom.window.document
        ?.querySelectorAll("table")[0]
        ?.querySelector("tbody")
        ?.querySelectorAll("tr")[0]
        ?.querySelectorAll("td");

      const lastClosingDate =
        dom.window.document.querySelectorAll(".fechamento")[0].innerHTML;

      const messaging = new twiml.MessagingResponse();

      if (lastestClosingPrice) {
        const response = {
          city: Array.from(lastestClosingPrice)[0].textContent,
          value: Array.from(lastestClosingPrice)[1].textContent,
          variation: Array.from(lastestClosingPrice)[2].textContent,
        };

        messaging.message(`Café Arábica-Mercado Físico`);
        messaging.message(lastClosingDate);
        messaging.message(
          `Municipio: *${response.city}*; \nPreço: *R$${response.value}*; \nVariação: *${response.variation}%*`
        );
        res.send(messaging.toString());
      } else {
        messaging
          .message(
            "Ops, não achei os valores, tente novamente daqui 1 hora. ☹️"
          )
          .media(
            "https://i1.sndcdn.com/avatars-BZjdypYRINkEoQBe-s2icjg-t500x500.jpg"
          );
      }
    })();
  } else res.send("<Response><Message>Ops, não entendi!</Message></Response>");
});
