// /lib/schemaData.ts
// ─── Type Definitions ────────────────────────────────────────────────────────

export type AttributeType = "PK" | "FK" | "PK-FK" | "normal";

export interface Attribute {
  name: string;
  type: AttributeType;
  dataType?: string;
  isMultivalued?: boolean;
  isDerived?: boolean;
}

export interface EntityData {
  id: string;
  name: string;
  type: "Entity" | "Weak Entity" | "Associative Entity";
  tier: number;
  tierLabel: string;
  description: string;
  attributes: Attribute[];
}

export interface RelationshipData {
  id: string;
  name: string;
  type: "Relationship" | "Identifying Relationship";
  description: string;
  attributes?: Attribute[];
  connections: {
    entityId: string;
    role: string;
    cardinality: "1" | "N" | "M";
    participation: "partial" | "total";
  }[];
}

export interface HierarchyData {
  id: string;
  type: "disjoint" | "overlapping";
  superclassId: string;
  subclassIds: string[];
  participation: "partial" | "total";
}

export type SchemaData = {
  entities: EntityData[];
  relationships: RelationshipData[];
  hierarchies: HierarchyData[];
};

// ─── PharmaGuard Complete Schema ─────────────────────────────────────────────

export const pharmaSchema: SchemaData = {

  // ══════════════════════════════════════════════════════════════════════
  // ENTITIES
  // ══════════════════════════════════════════════════════════════════════

  entities: [
    // ── Tier 1: Inheritance Root ─────────────────────────────────────────
    {
      id: "actor",
      name: "ACTOR",
      type: "Entity",
      tier: 1,
      tierLabel: "Inheritance Root",
      description:
        "Superclass holding universal authentication and profile data. Every participant — manufacturer, pharmacy, admin, or customer — inherits from this base entity. Connects to SCAN_LOG via 'Scanned_By' relationship, enabling unified login and role-based access control.",
      attributes: [
        { name: "actor_id", type: "PK", dataType: "UUID" },
        { name: "username", type: "normal", dataType: "VARCHAR(50)" },
        { name: "email", type: "normal", dataType: "VARCHAR(150)" },
        { name: "password_hash", type: "normal", dataType: "VARCHAR(255)" },
        { name: "role_type", type: "normal", dataType: "ENUM" },
      ],
    },

    // ── Tier 2: Subclasses (Disjoint Specialization from ACTOR) ──────────
    {
      id: "manufacturer",
      name: "MANUFACTURER",
      type: "Entity",
      tier: 2,
      tierLabel: "Subclasses",
      description:
        "Specialized actor who mints new drug batches. Holds regulatory license and declared production capacity. Disjoint specialization from ACTOR.",
      attributes: [
        { name: "actor_id", type: "PK-FK", dataType: "UUID" },
        { name: "license_no", type: "normal", dataType: "VARCHAR(50)" },
        { name: "production_capacity", type: "normal", dataType: "INT" },
      ],
    },
    {
      id: "pharmacy",
      name: "PHARMACY",
      type: "Entity",
      tier: 2,
      tierLabel: "Subclasses",
      description:
        "Specialized actor who stocks inventory and executes consumer sales. Stores geolocation for proximity-based verification. Disjoint specialization from ACTOR.",
      attributes: [
        { name: "actor_id", type: "PK-FK", dataType: "UUID" },
        { name: "pharmacy_license", type: "normal", dataType: "VARCHAR(50)" },
        { name: "gps_lat", type: "normal", dataType: "DECIMAL" },
        { name: "gps_long", type: "normal", dataType: "DECIMAL" },
      ],
    },
    {
      id: "admin",
      name: "ADMIN",
      type: "Entity",
      tier: 2,
      tierLabel: "Subclasses",
      description:
        "Specialized actor with global system permissions. Holds a numeric security clearance level dictating accessible operations. Disjoint specialization from ACTOR.",
      attributes: [
        { name: "actor_id", type: "PK-FK", dataType: "UUID" },
        { name: "security_clearance_level", type: "normal", dataType: "INT" },
      ],
    },
    {
      id: "customer",
      name: "CUSTOMER",
      type: "Entity",
      tier: 2,
      tierLabel: "Subclasses",
      description:
        "B2C End-user. Disjoint specialization from ACTOR. Inherits 'Scanned_By' rights allowing QR code verification. ⚠️ SECURITY: Read-access is strictly limited to the 'vw_customer_journey' secure database view — no direct table access is permitted for this role.",
      attributes: [
        { name: "actor_id", type: "PK-FK", dataType: "UUID" },
        { name: "phone_number", type: "normal", dataType: "VARCHAR(20)" },
        { name: "device_id", type: "normal", dataType: "VARCHAR(255)" },
      ],
    },

    // ── Tier 3: Core ─────────────────────────────────────────────────────
    {
      id: "medicine",
      name: "MEDICINE",
      type: "Entity",
      tier: 3,
      tierLabel: "Core",
      description:
        "Blueprint/definition of a specific drug product. One MEDICINE can be manufactured in many BATCHes.",
      attributes: [
        { name: "medicine_id", type: "PK", dataType: "UUID" },
        { name: "generic_name", type: "normal", dataType: "VARCHAR(100)" },
        { name: "brand_name", type: "normal", dataType: "VARCHAR(100)" },
      ],
    },
    {
      id: "batch",
      name: "BATCH",
      type: "Entity",
      tier: 3,
      tierLabel: "Core",
      description:
        "A distinct physical production run, identified by SHA-256 QR hash. Tracks current owner via FK. Central entity for chain-of-custody, inventory, and security scanning.",
      attributes: [
        { name: "batch_id", type: "PK", dataType: "UUID" },
        { name: "medicine_id", type: "FK", dataType: "UUID" },
        { name: "qr_code_hash", type: "normal", dataType: "VARCHAR(255)" },
        { name: "current_owner_id", type: "FK", dataType: "UUID" },
      ],
    },

    // ── Tier 4: Action ───────────────────────────────────────────────────
    {
      id: "inventory",
      name: "INVENTORY",
      type: "Associative Entity",
      tier: 4,
      tierLabel: "Action",
      description:
        "Resolves the M:N relationship between PHARMACY and BATCH. Composite PK (pharmacy_id + batch_id). quantity_on_hand is decremented on sale.",
      attributes: [
        { name: "pharmacy_id", type: "PK-FK", dataType: "UUID" },
        { name: "batch_id", type: "PK-FK", dataType: "UUID" },
        { name: "quantity_on_hand", type: "normal", dataType: "INT" },
      ],
    },
    {
      id: "transfer_log",
      name: "TRANSFER_LOG",
      type: "Entity",
      tier: 4,
      tierLabel: "Action",
      description:
        "Logs all physical movements of a Batch between actors, building Chain of Custody. Primary data source for Recursive CTE chain-of-custody queries.",
      attributes: [
        { name: "transfer_id", type: "PK", dataType: "SERIAL" },
        { name: "batch_id", type: "FK", dataType: "UUID" },
        { name: "sender_id", type: "FK", dataType: "UUID" },
        { name: "receiver_id", type: "FK", dataType: "UUID" },
      ],
    },
    {
      id: "sale_transaction",
      name: "SALE_TRANSACTION",
      type: "Entity",
      tier: 4,
      tierLabel: "Action",
      description:
        "Records final consumer point-of-sale. Captures pharmacy, batch, and transaction details for regulatory compliance.",
      attributes: [
        { name: "txn_id", type: "PK", dataType: "SERIAL" },
        { name: "pharmacy_id", type: "FK", dataType: "UUID" },
        { name: "batch_id", type: "FK", dataType: "UUID" },
      ],
    },

    // ── Tier 5: Security ────────────────────────────────────────────────
    {
      id: "scan_log",
      name: "SCAN_LOG",
      type: "Entity",
      tier: 5,
      tierLabel: "Security",
      description:
        "Logs every distinct QR scan event. Timestamp + GPS + scanner identity enable velocity-check calculations — detecting impossible travel via database triggers.",
      attributes: [
        { name: "scan_id", type: "PK", dataType: "SERIAL" },
        { name: "batch_id", type: "FK", dataType: "UUID" },
        { name: "scanned_by", type: "FK", dataType: "UUID" },
        { name: "gps_lat", type: "normal", dataType: "DECIMAL" },
        { name: "gps_long", type: "normal", dataType: "DECIMAL" },
      ],
    },
    {
      id: "alert",
      name: "ALERT",
      type: "Entity",
      tier: 5,
      tierLabel: "Security",
      description:
        "Stores security violation records triggered by database-level triggers. Captures affected Batch, alert type (VELOCITY_BREACH, EXPIRY_OVERRIDE, DUPLICATE_SCAN…), and severity.",
      attributes: [
        { name: "alert_id", type: "PK", dataType: "SERIAL" },
        { name: "batch_id", type: "FK", dataType: "UUID" },
        { name: "alert_type", type: "normal", dataType: "VARCHAR(50)" },
        { name: "severity", type: "normal", dataType: "VARCHAR(10)" },
      ],
    },
  ],

  // ══════════════════════════════════════════════════════════════════════
  // RELATIONSHIPS
  // ══════════════════════════════════════════════════════════════════════

  relationships: [
    // ── Product Definitions ────────────────────────────────────────────
    {
      id: "rel_defines",
      name: "Defines",
      type: "Relationship",
      description: "MEDICINE (1) defines BATCH (N). A medicine blueprint can have many production batches.",
      connections: [
        { entityId: "medicine", role: "Blueprint", cardinality: "1", participation: "partial" },
        { entityId: "batch", role: "Instance", cardinality: "N", participation: "total" },
      ],
    },

    // ── Ownership ──────────────────────────────────────────────────────
    {
      id: "rel_currently_owns",
      name: "Currently_Owns",
      type: "Relationship",
      description: "ACTOR (1) currently owns BATCH (N). Every physical batch must be legally owned by someone.",
      connections: [
        { entityId: "actor", role: "Owner", cardinality: "1", participation: "partial" },
        { entityId: "batch", role: "Owned Asset", cardinality: "N", participation: "total" },
      ],
    },

    // ── Inventory Management ──────────────────────────────────────────
    {
      id: "rel_manages",
      name: "Manages",
      type: "Relationship",
      description: "PHARMACY (1) manages INVENTORY (N). A pharmacy manages its stock records.",
      connections: [
        { entityId: "pharmacy", role: "Stockist", cardinality: "1", participation: "partial" },
        { entityId: "inventory", role: "Stock Record", cardinality: "N", participation: "total" },
      ],
    },
    {
      id: "rel_stocked_in",
      name: "Stocked_In",
      type: "Relationship",
      description: "BATCH (1) is stocked in INVENTORY (N). A batch can appear in multiple pharmacy inventories.",
      connections: [
        { entityId: "batch", role: "Product", cardinality: "1", participation: "partial" },
        { entityId: "inventory", role: "Stock Entry", cardinality: "N", participation: "total" },
      ],
    },

    // ── Chain of Custody (Transfers) ───────────────────────────────────
    {
      id: "rel_movement_history",
      name: "Movement_History",
      type: "Relationship",
      description: "BATCH (1) has many TRANSFER_LOG (N) records tracking its physical movement.",
      connections: [
        { entityId: "batch", role: "Transferred Item", cardinality: "1", participation: "partial" },
        { entityId: "transfer_log", role: "Movement Record", cardinality: "N", participation: "total" },
      ],
    },
    {
      id: "rel_sends",
      name: "Sends",
      type: "Relationship",
      description: "ACTOR (1) sends TRANSFER_LOG (N). An actor initiates outbound transfers.",
      connections: [
        { entityId: "actor", role: "Sender", cardinality: "1", participation: "partial" },
        { entityId: "transfer_log", role: "Outbound Log", cardinality: "N", participation: "total" },
      ],
    },
    {
      id: "rel_receives",
      name: "Receives",
      type: "Relationship",
      description: "ACTOR (1) receives TRANSFER_LOG (N). An actor accepts inbound transfers.",
      connections: [
        { entityId: "actor", role: "Receiver", cardinality: "1", participation: "partial" },
        { entityId: "transfer_log", role: "Inbound Log", cardinality: "N", participation: "total" },
      ],
    },

    // ── Point of Sale ──────────────────────────────────────────────────
    {
      id: "rel_sold_via",
      name: "Sold_Via",
      type: "Relationship",
      description: "BATCH (1) sold via SALE_TRANSACTION (N). Records units of a batch dispensed.",
      connections: [
        { entityId: "batch", role: "Dispensed Item", cardinality: "1", participation: "partial" },
        { entityId: "sale_transaction", role: "Sale Record", cardinality: "N", participation: "total" },
      ],
    },
    {
      id: "rel_executes",
      name: "Executes",
      type: "Relationship",
      description: "PHARMACY (1) executes SALE_TRANSACTION (N). A pharmacy conducts consumer sales.",
      connections: [
        { entityId: "pharmacy", role: "Seller", cardinality: "1", participation: "partial" },
        { entityId: "sale_transaction", role: "Transaction", cardinality: "N", participation: "total" },
      ],
    },

    // ── Security Auditing ──────────────────────────────────────────────
    {
      id: "rel_scanned_as",
      name: "Scanned_As",
      type: "Relationship",
      description: "BATCH (1) scanned as SCAN_LOG (N). Every QR scan on a batch creates a log entry.",
      connections: [
        { entityId: "batch", role: "Scanned Item", cardinality: "1", participation: "partial" },
        { entityId: "scan_log", role: "Scan Record", cardinality: "N", participation: "total" },
      ],
    },
    {
      id: "rel_scanned_by",
      name: "Scanned_By",
      type: "Relationship",
      description: "ACTOR (1) performs SCAN_LOG (N). Any actor role can scan a batch QR code.",
      connections: [
        { entityId: "actor", role: "Scanner", cardinality: "1", participation: "partial" },
        { entityId: "scan_log", role: "Scan Event", cardinality: "N", participation: "total" },
      ],
    },
    {
      id: "rel_triggers",
      name: "Triggers",
      type: "Relationship",
      description: "BATCH (1) triggers ALERT (N). Security violations are generated by database-level triggers.",
      connections: [
        { entityId: "batch", role: "Source", cardinality: "1", participation: "partial" },
        { entityId: "alert", role: "Violation", cardinality: "N", participation: "total" },
      ],
    },
  ],

  // ══════════════════════════════════════════════════════════════════════
  // HIERARCHY (EER Inheritance)
  // ══════════════════════════════════════════════════════════════════════

  hierarchies: [
    {
      id: "h_actor",
      type: "disjoint",        // 'd' inside the circle
      superclassId: "actor",
      subclassIds: ["manufacturer", "pharmacy", "admin", "customer"],
      participation: "total",  // double line from ACTOR to circle — every actor MUST be one subclass
    },
  ],
};
