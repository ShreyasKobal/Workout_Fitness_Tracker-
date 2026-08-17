import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password_hash: hashedPassword }])
      .select();

    if (error) {
      if (error.message.includes("duplicate")) {
        return Response.json({ error: "Email already exists" }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 400 });
    }

    const user = data[0];

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send verification email (optional for now, we'll make it work later)
    // await resend.emails.send({
    //   from: "noreply@yourapp.com",
    //   to: email,
    //   subject: "Verify your email",
    //   html: `<p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}">here</a> to verify</p>`,
    // });

    return Response.json({
      message: "User created successfully",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}