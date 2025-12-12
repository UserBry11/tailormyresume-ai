import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error("Missing STRIPE_PRICE_ID");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?paid=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`
    });

    return Response.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return Response.json(
      { error: err?.message || "Stripe checkout error" },
      { status: 500 }
    );
  }
}
