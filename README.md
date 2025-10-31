SecureDAG — Encrypted Data Vault and Sharing on Hedera

Overview
SecureDAG is a modular, privacy-first data vault for uploading, encrypting, sharing, and verifying files. It combines client-side cryptography, decentralized storage via IPFS, and verifiable access control on Hedera EVM. Users keep control of their data while seamlessly sharing with others using per-recipient encrypted keys and time-bound permissions.

Key Features
- Private-by-design storage: Files are encrypted client-side before leaving the browser.
- Fine-grained sharing: Per-recipient access with optional expiry and access levels.
- Key rotation: Rotate file keys and update recipients without re-uploading content.
- Verifiable access: On-chain permissions and auditability on Hedera EVM.
- IPFS-backed storage: Pluggable gateway configuration for retrieval.
- Multi-module architecture: Purpose-built flows for healthcare, genomics, and IP timestamping.
- IP Verification: Document integrity verification with blockchain timestamping for intellectual property protection.
- Emergency Access: Healthcare providers can request time-limited emergency access to critical medical files.
- Provider Registry: Secure registration system for healthcare providers enabling emergency access capabilities.

Modules
- MediVault: Secure medical document storage with sharing, audit-oriented stats, and emergency access flows for registered healthcare providers. Includes time-bound emergency access (48-hour duration) for critical situations.
- BioKey: Genomic data collaboration with researcher-friendly access workflows and simplified sharing.
- IPSeal: Intellectual property timestamping with document hash registration, blockchain verification, and certificate generation. Supports patents, copyrights, trademarks, and trade secrets.

How It Works (High Level)
1) Encrypt locally: The app generates a random symmetric key to encrypt each file in the browser.
2) Upload to IPFS: The encrypted file is stored on IPFS; only the CID is referenced on-chain.
3) Manage keys: The file’s symmetric key is encrypted per recipient using public-key cryptography and stored on-chain alongside access rules.
4) Share and revoke: File owners grant, expire, or revoke access; recipients fetch their encrypted key and decrypt locally to open the file.
5) Verify: For IPSeal, the app computes a document hash for timestamping and later verification.

Architecture at a Glance
- Smart contracts (Hedera EVM):
  - DataVault: Core registry for files, per-user access, encrypted key distribution, and key rotation.
  - MediVaultModule: Medical file sharing module with emergency access capabilities for verified healthcare providers.
  - BioKeyModule: Domain logic for genomic sharing, delegating file/key operations through DataVault.
  - IPSealModule: Intellectual property timestamping and document integrity verification.
  - ProviderRegistry: Registry for healthcare provider registration and verification.
  - KeyRegistry: Registry of user encryption keys used to encrypt per-recipient file keys.
- Frontend (Web):
  - Vue 3 + Vite + Tailwind: Responsive UI for uploads, browsing, sharing, verification, and provider management.
  - Pinia stores: State management for modules, files, and session context.
  - UX: Grid/list views, filtering, bulk actions, access management dialogs, IP verification interface, and provider registry UI.
- Storage:
  - IPFS for encrypted file blobs; only CIDs and access metadata live on-chain.
- Cryptography:
  - Symmetric encryption for file contents and per-recipient public-key wrapping for file keys.
  - SHA‑256 hashing for integrity and IPSeal timestamping/verification.

Smart Contract Behaviors (High Level)
- File registration: Records owner, CID, creation time, key version, and module type.
- Access control: Tracks per-user access flags, optional expiry timestamps, and access levels.
- Encrypted keys: Stores per-recipient encrypted file keys retrievable only by authorized users.
- Sharing via modules: Modules can grant or revoke access on behalf of the owner for specialized workflows.
- Key rotation: Owner can bump key version and update encrypted keys for current recipients.
- IP timestamping: IPSealModule records document hashes, IP types, descriptions, and timestamps for verification.
- IP verification: IPSealModule provides integrity checking by comparing computed document hashes against on-chain records.
- Provider registration: ProviderRegistry manages provider registration state and verification checks.
- Emergency access: MediVaultModule allows verified providers to request emergency access with automatic 48-hour expiration, tracked separately from regular access.

User Flows
- Upload: Select a file; it's encrypted locally, uploaded to IPFS, and registered in the vault with owner access.
- Share: Choose a recipient; the app encrypts the file key for them and grants access with optional expiry.
- Revoke: Remove a recipient; their access and encrypted key are deleted.
- Rotate key: Update the file key and refresh recipient keys without touching the encrypted file data on IPFS.
- IP Verification (IPSeal):
  - Timestamp: Generate a document hash and record a timestamp with IP type and description on-chain.
  - Verify: Upload a document file, select its file ID, and verify integrity by comparing computed hash against blockchain record.
  - Certificate: Download verification certificates for evolved IP documentation.
- Provider Registry:
  - Register: Healthcare providers register with their name and type (hospital, clinic, pharmacy, laboratory, etc.).
  - Remove: Providers can revoke their registration at any time.
- Emergency Access (MediVault):
  - Provider Registration: Healthcare providers must first register in the Provider Registry.
  - Request Access: Registered providers can request emergency access to medical files with automatic 48-hour expiration.
  - Access Granted: System automatically grants time-bound access and encrypts file key for the provider.

Security & Privacy
- Client-side encryption ensures the platform never sees plaintext file contents or keys.
- Per-recipient encrypted keys prevent unauthorized data access even if storage is observed.
- Hedera EVM records access grants, revocations, and key versioning for verifiability.
- Encrypted blobs on IPFS contain no readable metadata beyond the CID.

Network & Storage
- Network: Hedera EVM Testnet.
- Storage: IPFS with a generic, configurable gateway (no vendor lock-in).

Stack
- Frontend: Vue 3, Vite, Tailwind CSS, Pinia.
- Contracts: Solidity, OpenZeppelin, Hardhat toolchain.
- Crypto: Modern symmetric encryption and public-key key wrapping, plus SHA‑256 hashing.

