import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { fulfillOrder } from '@/inngest/functions/fulfill-order';
import { sendReceipt } from '@/inngest/functions/send-receipt';

/* ============================================================
   Inngest Serve Handler
   
   Exposes GET/POST/PUT routes that the Inngest platform calls to:
   - Introspect available functions (GET)
   - Trigger function runs (POST)
   - Sync function definitions (PUT)
   
   Local dev: visit http://localhost:8288 for the Inngest dashboard
   ============================================================ */

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [fulfillOrder, sendReceipt],
});
