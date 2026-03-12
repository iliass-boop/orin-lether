import { Inngest } from 'inngest';

/* ============================================================
   Orin Leather — Inngest Client
   
   The Inngest client is the single entry point for:
   - Defining functions that run as durable jobs
   - Sending events that trigger those functions
   
   Local dev: run `npx inngest-cli@latest dev` alongside `npm run dev`
   Production: add INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY to env
   ============================================================ */

export const inngest = new Inngest({
    id: 'orin-leather',
    name: 'Orin Leather',
});
