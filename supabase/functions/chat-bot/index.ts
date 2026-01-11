import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, restaurantName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with", messages?.length, "messages");

    const systemPrompt = `You are a helpful AI assistant for ${restaurantName || 'Zayka'}, an authentic Indian vegetarian restaurant. You help customers with:
- Menu information and dish recommendations
- Restaurant hours and location
- Booking inquiries
- General questions about the restaurant

Be friendly, concise, and helpful. If a customer has a complex issue, complaint, or needs to speak with a manager, suggest they can switch to "Manager Mode" to talk directly with the restaurant staff.

If the customer asks to speak to a manager, or has a complaint, or the issue is beyond your capability, respond with exactly: "ESCALATE_TO_MANAGER" at the start of your message, followed by a friendly message explaining that you're connecting them with the restaurant manager.

Keep responses short and conversational.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";
    
    console.log("AI response received:", aiMessage.substring(0, 100));

    // Check if escalation is needed
    const shouldEscalate = aiMessage.startsWith("ESCALATE_TO_MANAGER");
    const cleanMessage = shouldEscalate 
      ? aiMessage.replace("ESCALATE_TO_MANAGER", "").trim()
      : aiMessage;

    return new Response(JSON.stringify({ 
      message: cleanMessage,
      shouldEscalate 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat bot error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
