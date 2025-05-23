import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { getGmailClient } from "@/utils/gmail/client";
import { watchEmails } from "./controller";
import { withError } from "@/utils/middleware";
import { createScopedLogger } from "@/utils/logger";

export const dynamic = "force-dynamic";

const logger = createScopedLogger("api/google/watch");

export const GET = withError(async () => {
  const session = await auth();
  const email = session?.user.email;
  if (!email) return NextResponse.json({ error: "Not authenticated" });

  const gmail = getGmailClient(session);

  const expirationDate = await watchEmails({ email, gmail });
  
  if (expirationDate) return NextResponse.json({ expirationDate });
  
  logger.error("Error watching inbox", { email });
  
  return NextResponse.json({ error: "Error watching inbox" });
});
