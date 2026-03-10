# Database Design

## 1. Overview

The Atlas URL Shortener system uses **Google Cloud Bigtable** as its primary persistent storage.

Bigtable is chosen because it provides:

- high throughput for read-heavy workloads
- fast key-based lookups
- horizontal scalability
- strong integration with the Google Cloud ecosystem

The database stores URL mappings and related metadata required for redirect operations and link management.

---

# 2. Bigtable Instance

The project uses a **shared Bigtable instance provided by the course environment**.

All tables created by the team must follow the required naming convention.

Main table used by the system:

```

comp-539-team-1-urlmap

```

This table stores the primary mapping between short aliases and destination URLs.

---

# 3. Table Structure

## URL Mapping Table

Table name:

```

comp-539-team-1-urlmap

```

This table contains the core data required to resolve short URLs.

Row key:

```

alias

```

Each row corresponds to a single short URL.

Using the alias as the row key enables efficient **O(1) point lookups** for redirect requests.

---

# 4. Column Families

The URL mapping table contains the following column families.

```

ttl
creator-info
analytics
urlmapping

```

---

## urlmapping

Stores the core URL mapping information.

Typical fields:

- longUrl
- createdAt
- expiresAt

Purpose:

- resolve redirects
- store basic link metadata

---

## creator-info

Stores information related to the creator of the link.

Typical fields:

- creatorId

Possible additional fields:

-

Purpose:

- identify the owner of a link
- support link listing by creator

---

## analytics

Stores aggregated analytics information for each link.

Typical fields:

- clickCount

Purpose:

- track number of times a link has been accessed

Additional analytics data may be added in the future.

---

## ttl

Column family intended for expiration-related data.

Possible usage:

- link expiration timestamps
- TTL-based cleanup mechanisms

Exact implementation details:

-

---

# 5. Data Model

Main entity stored in the database:

## Link

Fields stored for each link include:

| Field | Description |
|------|-------------|
| alias | unique identifier for the short URL |
| longUrl | original destination URL |
| creatorId | identifier of the user who created the link |
| createdAt | creation timestamp |
| expiresAt | expiration timestamp |
| clickCount | total number of redirect events |

Alias serves as the **primary identifier** for redirect operations.

---

# 6. Access Patterns

The database is designed to support several primary access patterns.

## Alias Lookup (Redirect)

Operation:

```

alias → longUrl

```

Used by the redirect endpoint.

Characteristics:

- single-row lookup
- extremely fast access
- no scanning required

---

## Link Creation

Operation:

- insert new row using alias as row key

Requirements:

- alias must be unique
- creation must be atomic

Bigtable atomic operations are used to enforce uniqueness.

---

## Click Count Updates

Operation:

- increment click count after successful redirect

Column used:

```

analytics:clickCount

```

---

## Link Metadata Retrieval

Operation:

```

GET link by alias

```

Used by management APIs to retrieve link details.

---

# 7. Caching Interaction

Bigtable serves as the **source of truth** for URL mappings.

However, most redirect requests are served through Redis.

Typical flow:

1. check Redis cache
2. if cache miss → query Bigtable
3. store result in Redis
4. return redirect response

This approach reduces load on the database.

---

# 8. Expiration Handling

Links may have an expiration timestamp.

Expiration is stored as:

```

urlmapping:expiresAt

```

Expiration checks are performed in the backend service.

If a link is expired:

- redirect requests return an error response
- the link may remain in storage

---

# 9. Future Extensions

The current schema supports basic link storage and analytics.

Potential future extensions may include:

- additional analytics tables
- event-level click tracking
- user account tables
- metadata storage for campaigns or tags
