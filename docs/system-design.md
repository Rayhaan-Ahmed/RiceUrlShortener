# Atlas URL Shortener – System Design

## 1. Project Overview

Atlas is a scalable URL shortening service designed to convert long URLs into short aliases and redirect users with minimal latency.

The system is built to support large-scale traffic while maintaining extremely fast redirect performance.

Core capabilities:

- Create short URLs from long URLs
- Redirect users from short links to original destinations
- Manage links through authenticated APIs
- Support large-scale storage and fast lookup

The design prioritizes **low-latency redirects**, **horizontal scalability**, and **clear API contracts**.

---

# 2. System Architecture

The Atlas system is built as a distributed architecture designed for high read throughput and low-latency redirects.

Major components:

- **Frontend:** React web application for link creation and management
- **Backend:** Java service deployed on Google Cloud Run
- **Cache:** Redis for fast alias resolution
- **Database:** Google Cloud Bigtable for persistent storage

This architecture separates two types of traffic:

### Hot Path

Handles anonymous redirect requests.

Goal:

- extremely low latency
- minimal processing

Endpoint example:

```

GET /{alias}

```

### Management Plane

Handles authenticated operations such as creating and managing links.

Examples:

```

POST /v1/urls
GET /v1/urls
GET /v1/urls/{alias}
PATCH /v1/urls/{alias}
DELETE /v1/urls/{alias}

```

Separating these planes ensures redirect performance is not affected by heavier management operations.

---

# 3. Architecture Principles

## Stateless Backend

Backend instances are stateless and run on **Google Cloud Run**, allowing automatic horizontal scaling.

This ensures the system can scale with traffic spikes without maintaining server-side session state.

---

## Cache-Aside Strategy

Redis is used as a high-performance cache layer.

The backend follows a **cache-aside pattern**:

1. Check Redis first
2. If cache miss → query Bigtable
3. Write result back into Redis

This reduces database load and keeps redirect latency low.

---

## Hot Path Optimization

Redirect requests are optimized to perform the minimum possible work:

- alias lookup
- redirect response

No authentication or heavy processing occurs in the redirect path.

---

# 4. Core System Components

## Frontend

A React-based web application used for link management.

Responsibilities:

- Create new short URLs
- View link metadata
- Manage existing links
- Display analytics information

The frontend communicates with the backend through REST APIs.

---

## Backend

The backend service is implemented using **Java and Spring Boot**.

Responsibilities:

- Implement REST APIs
- Generate and validate aliases
- Handle redirect logic
- Interact with Redis and Bigtable
- Maintain business logic

The backend is deployed on **Google Cloud Run**, enabling stateless scaling.

---

## Redis Cache

Redis is used as a high-speed caching layer for redirect resolution.

Key responsibilities:

- Store alias → long URL mappings
- Reduce database lookups
- Improve redirect latency

Cache entries have a time-to-live (TTL) and are refreshed on cache misses.

---

## Bigtable Database

Google Cloud Bigtable is used as the primary persistent storage system.

Responsibilities:

- Store URL mappings
- Store metadata such as creator and expiration
- Maintain click counts

Bigtable is chosen for its ability to provide **O(1) key lookups at large scale**.

---

# 5. API Overview

Atlas exposes two major API groups.

---

## Redirect API

Public endpoint used when a user clicks a short URL.

```

GET /{alias}

```

Behavior:

- Resolve alias
- Return HTTP redirect to long URL

Possible responses:

- `302 Found`
- `404 Not Found`
- `410 Gone`

---

## Core URL APIs

### Create Short URL

```

POST /v1/urls

````

Creates a new short URL.

Request body:

```json
{
  "longUrl": "...",
  "customAlias": "...",
  "expiresAt": "..."
}
````

---

### Get Link Details

```
GET /v1/urls/{alias}
```

Returns metadata about a specific link.

---

### List Links

```
GET /v1/urls
```

Returns links created by a user using cursor-based pagination.

---

### Update Link

```
PATCH /v1/urls/{alias}
```

Updates link attributes such as destination URL or expiration.

---

### Delete Link

```
DELETE /v1/urls/{alias}
```

Removes an existing short URL.

---

# 6. Request Flows

## Redirect Request (Hot Path)

This is the most performance-sensitive request in the system.

Flow:

1. User clicks a short link
2. Request reaches the backend service
3. Backend queries Redis using the alias
4. If cache hit → return redirect immediately
5. If cache miss → query Bigtable
6. Store result in Redis cache
7. Return redirect response

This design ensures most requests are served directly from Redis.

---

## Link Creation Request

Flow:

1. Client sends `POST /v1/urls`
2. Backend validates the request
3. Alias is generated or validated
4. Backend writes record to Bigtable
5. Redis cache is updated
6. API response returns the created link

Bigtable atomic operations ensure alias uniqueness.

---

# 7. Data Model Overview

The system stores link information in Bigtable.

Main entity:

### Link

Fields include:

* alias
* longUrl
* creatorId
* createdAt
* expiresAt
* clickCount

Alias acts as the **primary identifier** for redirect lookups.

---

# 8. Caching Strategy

Redis stores frequently accessed alias mappings.

Cache key format:

```
alias -> longUrl
```

Typical redirect process:

1. Lookup Redis
2. On miss → query Bigtable
3. Populate cache

This pattern significantly reduces database traffic.

---

# 9. Deployment Architecture

Atlas is deployed using Google Cloud infrastructure.

Key elements:

### Cloud Run

Backend services run as stateless containers.

Benefits:

* automatic scaling
* simplified deployment
* regional availability

---

### Global Routing

Traffic is routed through load balancers to the nearest healthy backend instance.

---

### Observability

System monitoring is provided through:

* logging
* performance metrics
* error tracking

These tools ensure operational visibility and system reliability.

