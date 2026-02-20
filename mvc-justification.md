# Architectural Pattern Justification: MVC

I opted for the Model-View-Controller pattern for this project. It's a pattern I'm familiar with and it's the standard for both web and mobile applications. The three-layer separation makes the code more maintainable, easier to read, and the dataflow through the system is straightforward to follow. Each layer has a clear job and doesn't bleed into the others.

The **Model** layer owns the data and business rules. Classes like `Event`, `Organization`, `MembershipApplication`, and `User` define what the system knows and how it behaves. Nothing about how data gets displayed lives here — it's purely about the domain.

The **Controller** layer is where the logic lives. Services like `EventService`, `MembershipService`, `AuthService`, and `AdminService` handle incoming requests, enforce permissions, coordinate between models, and decide what data gets returned. They don't know or care what's rendering the result — that's intentional.

The **View** layer is what the user actually sees. Right now that's three role-based dashboards for Students, Organizers, and Admins. The views call the controllers and render whatever comes back. They hold no business logic.

The big advantage of this separation is modularity. Because the Controllers and Models are completely decoupled from the View, adding a new client type doesn't require touching the core of the system. If I decide to build a mobile app down the road, the only work is building new Views. The Controllers already expose clean, role-aware endpoints and the Models already define the data — a mobile client just consumes them the same way the web app does.

When thinking about the right technology stack, TypeScript was the obvious choice for type safety across all three layers. From there it came down to the frontend framework. Next.js made the most sense for a web app — it handles routing, server-side rendering, middleware, and API routes all in one package, which maps cleanly onto the MVC structure. The API routes are the Controllers, the pages are the Views, and the model classes carry over directly. If I go the mobile route instead, React Native is the natural fit. It shares the same React component model as Next.js, so the mental shift from web views to mobile views is minimal and the Controllers and Models written in TypeScript stay completely untouched.

```
Web App:    [Next.js Views]        → [Controllers] → [Models] → [Database]
Mobile App: [React Native Views]   →       ↑
```

The architecture is already set up to support both without having to rethink the core of the system.

## Why Not Client-Server?

A Client-Server pattern splits the system into two tiers — a server that handles logic and data, and a client that consumes it. On the surface that sounds similar to MVC, but the key difference is that Client-Server doesn't enforce any separation within those tiers. The server ends up owning everything: business rules, data access, and often response formatting tailored to whatever the client expects. The client and server become tightly coupled to each other.

The problem shows up immediately when you try to add a second client. In a Client-Server setup, the server's responses are shaped around the first client. A mobile app has different screen sizes, different interaction patterns, and different data needs. That usually means either building a separate backend for mobile, adding mobile-specific logic into the existing server, or forcing the mobile client to work around a contract it wasn't designed for. None of those are clean.

With MVC already in place, that problem doesn't exist. The Controllers don't know what client is calling them — they just process the request and return data. The Views are the only thing that changes between web and mobile. The server-side logic stays exactly the same. That's the separation Client-Server doesn't give you.
