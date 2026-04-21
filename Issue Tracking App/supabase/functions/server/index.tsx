import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-07e1ed14/health", (c) => {
  return c.json({ status: "ok" });
});

// Login endpoint
app.post("/make-server-07e1ed14/login", async (c) => {
  try {
    const { phone, pin, role } = await c.req.json();
    const userId = `user:${phone.replace(/\D/g, '')}`;

    // Check if user exists
    let user = await kv.get(userId);

    // If user doesn't exist, create demo users
    if (!user && phone === '123-456-7890' && pin === '1234') {
      user = {
        id: userId,
        phone: '123-456-7890',
        pin: '1234',
        role: 'staff',
        name: 'Staff User'
      };
      await kv.set(userId, user);
    } else if (!user && phone === '098-765-4321' && pin === '4321') {
      user = {
        id: userId,
        phone: '098-765-4321',
        pin: '4321',
        role: 'technician',
        name: 'Tech Support'
      };
      await kv.set(userId, user);
    }

    // Validate credentials
    if (!user || user.pin !== pin) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Return user data (excluding PIN)
    const { pin: _, ...userData } = user;
    return c.json({ user: userData });
  } catch (error) {
    console.log("Error during login:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Register endpoint
app.post("/make-server-07e1ed14/register", async (c) => {
  try {
    const { phone, pin, role, name } = await c.req.json();
    const userId = `user:${phone.replace(/\D/g, '')}`;

    // Check if user already exists
    const existingUser = await kv.get(userId);
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Create new user
    const user = {
      id: userId,
      phone,
      pin,
      role,
      name,
      createdAt: new Date().toISOString()
    };

    await kv.set(userId, user);

    // Return user data (excluding PIN)
    const { pin: _, ...userData } = user;
    return c.json({ user: userData });
  } catch (error) {
    console.log("Error during registration:", error);
    return c.json({ error: "Registration failed" }, 500);
  }
});

// Get all tickets
app.get("/make-server-07e1ed14/tickets", async (c) => {
  try {
    const tickets = await kv.getByPrefix("ticket:");
    return c.json({ tickets: tickets || [] });
  } catch (error) {
    console.log("Error fetching tickets:", error);
    return c.json({ error: "Failed to fetch tickets" }, 500);
  }
});

// Create a new ticket
app.post("/make-server-07e1ed14/tickets", async (c) => {
  try {
    const body = await c.req.json();
    const ticketId = `ticket:${Date.now()}`;
    const ticket = {
      id: ticketId,
      ...body,
      createdAt: new Date().toISOString(),
      status: body.status || "open"
    };
    await kv.set(ticketId, ticket);
    return c.json({ ticket });
  } catch (error) {
    console.log("Error creating ticket:", error);
    return c.json({ error: "Failed to create ticket" }, 500);
  }
});

// Update ticket status
app.put("/make-server-07e1ed14/tickets/:id", async (c) => {
  try {
    const ticketId = c.req.param("id");
    const body = await c.req.json();
    const existingTicket = await kv.get(ticketId);

    if (!existingTicket) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    const updatedTicket = { ...existingTicket, ...body };
    await kv.set(ticketId, updatedTicket);
    return c.json({ ticket: updatedTicket });
  } catch (error) {
    console.log("Error updating ticket:", error);
    return c.json({ error: "Failed to update ticket" }, 500);
  }
});

// Delete a ticket
app.delete("/make-server-07e1ed14/tickets/:id", async (c) => {
  try {
    const ticketId = c.req.param("id");
    await kv.del(ticketId);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting ticket:", error);
    return c.json({ error: "Failed to delete ticket" }, 500);
  }
});

Deno.serve(app.fetch);