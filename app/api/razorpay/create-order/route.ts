import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db/drizzle";
import { ordersTable, productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await req.json();
    const postId = body.postId || body.productId;

    if (!postId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Fetch product to retrieve price
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, postId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const amountInSmallestUnit = product.price ? Math.round(parseFloat(product.price) * 100) : 0;

    if (amountInSmallestUnit <= 0) {
      return NextResponse.json({ error: "Invalid price for checkout" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Payment gateway credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const currency = process.env.RAZORPAY_CURRENCY || "USD";
    const options = {
      amount: amountInSmallestUnit,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order record in database
    await db.insert(ordersTable).values({
      id: order.id,
      userId: session?.user?.id || null,
      postId: product.id,
      amount: product.price || "0",
      status: "created",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: options.amount,
      currency: options.currency,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
