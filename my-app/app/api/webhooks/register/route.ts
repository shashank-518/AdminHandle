import { Webhook } from "svix";
import { headers } from "next/headers";

import { PrismaClient } from '../../../generated/prisma/client'
import { WebhookEvent } from "@clerk/nextjs/server";
import { log } from "console";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  const prisma = new PrismaClient();


  if (!WEBHOOK_SECRET) {
    throw new Error("Please add Webhook Secret");
  }

  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -No svix headers");
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.log("Error Verifying the webhook", error);
    return new Response("error occureed", { status: 404 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      const { email_addresses, primary_email_address_id } = evt.data;

      const primary_email = email_addresses.find((email) => email.id === primary_email_address_id)

      if(!primary_email){
        return new Response("No Primary email was found" , {status:404})
      }

      const newUser = await prisma.users.create({
        data:{
            id : evt.data.id,
            email: primary_email.email_address,
            isSubscribed:false
        }
      })

      console.log("New User Created" , newUser);
      

    } catch (error) {
        return new Response("Error In creating a USer in db" , {status:404})

    }
  }


  return new Response("WebHook Recevied Successfully" , {status:200})
}
