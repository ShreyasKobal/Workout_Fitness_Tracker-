import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return Response.json({
      userId: decoded.userId,
      email: decoded.email,
    });
  } catch (error) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}