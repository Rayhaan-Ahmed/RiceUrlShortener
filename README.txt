AtLink project overview

This repository contains the AtLink URL shortener project.

Main folders:
- `Back-End/`: Spring Boot backend service
- `Front-End/`: React frontend
- `docs/`: architecture and component notes

Bigtable-related backend locations

- `Back-End/src/main/java/edu/rice/atlink/backend/config/BigtableConfig.java`
  Creates the `BigtableDataClient` bean and selects either emulator or real Bigtable connection settings at runtime.

- `Back-End/src/main/java/edu/rice/atlink/backend/config/BigtableProperties.java`
  Defines the Bigtable configuration values used by the backend, including project, instance, table names, and emulator host/port.

- `Back-End/src/main/resources/application.yml`
  Default backend configuration. It currently defaults storage to memory but also contains the Bigtable property fields expected by the app.

- `Back-End/src/main/resources/application-emulator.yml`
  Local emulator configuration. It switches storage to Bigtable and provides emulator-specific connection values.

- `Back-End/src/main/java/edu/rice/atlink/backend/repository/BigtableLinkRepository.java`
  Main Bigtable persistence implementation. It handles link reads, conditional inserts, updates, creator index writes, and creator-based pagination.

- `Back-End/scripts/create-bigtable-emulator-tables.sh`
  Helper script for local setup. It creates the emulator tables and required column families used by the backend.

- `Back-End/BigtableStructure.txt`
  Brief schema/design note describing the intended table structure, row key choice, and column families.

Notes

- The backend uses `InMemoryLinkRepository` by default unless `app.storage.type` is set to `bigtable`.
- The repository currently expects two tables: one main link table and one creator index table.
- The repo includes backend wiring and emulator setup, but not a full production GCP provisioning setup such as Terraform.
