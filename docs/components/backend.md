# Backend Service Architecture

## 1. Overview

The backend service implements the core business logic of the Atlas URL Shortener system.

Responsibilities of the backend include:

- handling URL creation requests
- resolving short aliases to original URLs
- managing link metadata
- interacting with the caching and storage layers
- exposing REST APIs for frontend and external clients

Technology stack:

- Java
- Spring Boot
- Maven
- Redis
- Google Cloud Bigtable

The backend service is designed to be stateless and horizontally scalable.

---

## 2. Service Architecture

The backend follows a layered architecture:

```text
Controller Layer
        ↓
Service Layer
        ↓
Repository Layer
        ↓
Storage (Bigtable / In-Memory)
````

### Controller Layer

Responsible for:

* receiving HTTP requests
* validating request parameters
* returning API responses

### Service Layer

Responsible for:

* business logic
* alias generation
* redirect resolution
* cache interaction
* enforcing application rules

### Repository Layer

Responsible for:

* data persistence
* abstracting storage implementation
* supporting multiple storage backends

---

## 3. Backend Project Structure

Backend source root:

```text
Back-End/
```

Main structure:

```text
Back-End/
  src/main/java/
    controller/
    service/
    repository/
    model/
    dto/
    config/
    exception/
  src/main/resources/
  scripts/
  pom.xml
```

### controller/

Contains REST API controllers.

Example:

* `LinkController`

### service/

Contains business logic components.

Example:

* `LinkService`
* `AliasGenerator`
* `RedisLinkCacheService`

### repository/

Defines storage interfaces and implementations.

Example:

* `LinkRepository`
* `InMemoryLinkRepository`
* `BigtableLinkRepository`

### model/

Domain models used by the backend.

Example:

* `LinkRecord`

### dto/

Request and response objects used by APIs.

Example:

* `CreateLinkRequest`
* `LinkResponse`
* `LinkListResponse`

### config/

Application configuration classes.

Example:

* `BigtableConfig`
* `AppConfig`

### exception/

Custom exceptions and error handling logic.

---

## 4. Service Entry Point

Main application class:

```text
AtLinkBackendApplication.java
```

Responsibilities:

* bootstrap the Spring Boot application
* initialize configuration
* start HTTP server

---

## 5. API Controllers

### LinkController

Handles HTTP requests related to link operations.

Endpoints implemented:

```
POST /api/links
GET /api/links/{alias}
GET /api/links
GET /r/{alias}
```

Responsibilities:

* create new links
* retrieve link metadata
* list links
* redirect users from short URLs

---

## 6. Business Logic Layer

### LinkService

Central business logic component of the backend.

Responsibilities:

* validate link creation requests
* generate aliases when needed
* resolve redirect targets
* interact with Redis cache
* update click counts
* enforce expiration rules

---

## 7. Alias Generation

Alias generation is handled by:

```text
AliasGenerator
```

General behavior:

* generate random alias strings
* ensure allowed character set
* ensure uniqueness through repository checks

Alias generation parameters:

* alias length
* allowed characters

Collision handling strategy:

* retry alias generation if conflict occurs
* repository enforces final uniqueness

---

## 8. Caching Layer

### RedisLinkCacheService

Provides caching functionality for redirect operations.

Responsibilities:

* store alias → long URL mappings
* retrieve cached redirect targets
* handle cache updates

Cache key format:

```
atlink:url:{alias}
```

Cache expiration policy:

* TTL applied to cached entries

Cache strategy:

* read from cache first
* fallback to repository on cache miss
* update cache after database lookup

Failure behavior:

* service continues operating if Redis is unavailable

---

## 9. Storage Layer

### Repository Abstraction

Storage operations are defined through the `LinkRepository` interface.

Responsibilities:

* retrieve link records
* persist new links
* update click counts
* support listing queries

---

### InMemoryLinkRepository

In-memory implementation used during development.

Characteristics:

* no external dependencies
* suitable for local testing
* not intended for production deployment

---

### BigtableLinkRepository

Production storage implementation.

Responsibilities:

* store link records in Bigtable
* support alias lookups
* support listing links by creator
* update analytics data

Bigtable client configuration is provided through application configuration classes.

---

## 10. Redirect Execution Flow

Redirect handling is one of the most performance-sensitive operations in the system.

Flow:

1. Client requests a short URL.
2. Controller receives request at `/r/{alias}`.
3. Controller calls service to resolve redirect.
4. Service checks Redis cache.
5. If cache hit → return long URL.
6. If cache miss → query repository.
7. Service verifies link is active.
8. Click count is incremented.
9. Cache is updated if necessary.
10. Controller returns HTTP redirect response.

Possible outcomes:

* redirect success
* link not found
* link expired

---

## 11. Configuration

Configuration files located in:

```text
src/main/resources/
```

Main configuration file:

```
application.yml
```

Configuration areas include:

* Redis host and port
* storage mode
* Bigtable configuration
* service base URL

Additional configuration profiles may exist for:

* emulator environments
* development mode

---

## 12. Data Transfer Objects

DTO classes define request and response structures for the API.

Examples:

### CreateLinkRequest

Represents a link creation request.

Fields:

* longUrl
* customAlias
* expiresAt
* creatorId

---

### LinkResponse

Represents link metadata returned by the API.

Fields include:

* alias
* longUrl
* createdAt
* expiresAt
* clickCount

---

### LinkListResponse

Represents paginated link lists.

Contains:

* link items
* pagination cursor

---

## 13. Error Handling

Error handling is implemented through:

* custom exception classes
* global exception handlers

Common exceptions include:

* link not found
* alias already exists
* link expired

Errors are mapped to HTTP responses such as:

* 400 Bad Request
* 404 Not Found
* 409 Conflict
* 410 Gone

---

## 14. Testing

Backend tests are located in:

```text
src/test/java/
```

Examples:

* `LinkControllerTest`
* `LinkServiceTest`

Tests cover:

* link creation behavior
* redirect resolution
* alias conflict handling
* pagination logic

```