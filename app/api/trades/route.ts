import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trades: data ?? [] });
  } catch (error) {
    console.error("GET /api/trades error:", error);
    return NextResponse.json(
      { error: "Error cargando trades" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const trade = {
      user_id: userId,
      date: body.date,
      account: body.account ?? "",
      asset: body.asset ?? "",
      direction: body.direction ?? "",
      risk: Number(body.risk ?? 0),
      result: Number(body.result ?? 0),
      emotion: body.emotion ?? "",
      setup: body.setup ?? "",
      notes: body.notes ?? "",
      image: body.image ?? "",
      status: body.status ?? "",
    };

    const { data, error } = await supabaseAdmin
      .from("trades")
      .insert(trade)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trade: data });
  } catch (error) {
    console.error("POST /api/trades error:", error);
    return NextResponse.json(
      { error: "Error guardando trade" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Falta el id del trade" }, { status: 400 });
    }

    const updatedTrade = {
      date: body.date,
      account: body.account ?? "",
      asset: body.asset ?? "",
      direction: body.direction ?? "",
      risk: Number(body.risk ?? 0),
      result: Number(body.result ?? 0),
      emotion: body.emotion ?? "",
      setup: body.setup ?? "",
      notes: body.notes ?? "",
      image: body.image ?? "",
      status: body.status ?? "",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("trades")
      .update(updatedTrade)
      .eq("id", body.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trade: data });
  } catch (error) {
    console.error("PATCH /api/trades error:", error);
    return NextResponse.json(
      { error: "Error editando trade" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tradeId = searchParams.get("id");

    if (!tradeId) {
      return NextResponse.json({ error: "Falta el id del trade" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("trades")
      .delete()
      .eq("id", tradeId)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trades error:", error);
    return NextResponse.json(
      { error: "Error eliminando trade" },
      { status: 500 }
    );
  }
}