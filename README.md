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

IP Verification System (IPSeal)
The IPSeal module provides blockchain-backed intellectual property verification:

- Document Timestamping: When uploading files to IPSeal, users specify IP type (patent, copyright, trademark, trade_secret) and description. The system computes a SHA-256 hash of the document and records it on-chain with a timestamp.
- Integrity Verification: Users can later verify any document by:
  1. Selecting the document file to verify
  2. Providing the file ID from the blockchain
  3. The system recomputes the document hash and compares it against the stored hash
  4. Results show verification status with IP details, timestamp, and document hash
- Verification Certificates: Successful verifications can generate downloadable HTML certificates containing all verification details for legal/professional documentation.

Supported IP Types: Patent, Copyright, Trademark, Trade Secret.

Emergency Access System (MediVault)
The emergency access system enables healthcare providers to access critical medical files in emergency situations:

- Provider Registration: Healthcare providers register in the Provider Registry with their name and type (hospital, clinic, pharmacy, laboratory, other). Registration is on-chain and can be revoked by the provider at any time.
- Emergency Access Request: Registered providers can request emergency access to medical files through the MediVault module. The system automatically:
  - Verifies the requester is a registered provider
  - Grants time-limited access (48 hours from request time)
  - Encrypts the file key for the provider using their registered encryption key
  - Records the emergency access timestamp and expiration on-chain
- Access Tracking: Emergency access is tracked separately from regular sharing, allowing file owners to audit emergency access events. Access automatically expires after 48 hours.
- Security: Only registered providers with valid encryption keys can request emergency access. All access events are immutable and auditable on-chain.

Provider Registry System
The Provider Registry is a simple but critical component for enabling emergency access:

- Self-Registration: Any address can register as a healthcare provider with their provider name and type. No centralized approval required.
- Verification: The MediVault module checks the Provider Registry before granting emergency access, ensuring only registered providers can access medical files in emergencies.
- Revocation: Providers can remove their registration at any time, immediately revoking their ability to request new emergency access (existing access remains valid until expiration).
- On-Chain State: Provider status is stored on-chain and publicly verifiable, ensuring transparency and trust in the emergency access system.

Trying It Out (High Level)
1) Prepare a Hedera EVM Testnet wallet and test funds.
2) Configure environment values for wallet, RPC, and IPFS gateway.
3) Deploy contracts to Hedera EVM Testnet.
4) Launch the web app locally.
5) Upload an example file, share it with a secondary test account, and verify access.
6) For IPSeal: Create a timestamp for a document, then test verification with the same document and verify it matches.
7) For Emergency Access: Register as a healthcare provider, upload a medical file to MediVault, then request emergency access from a provider account.
8) For Provider Registry: Test provider registration and removal, verifying status changes on-chain.


Roadmap
- Additional modules for domain-specific workflows (e.g., legal, finance, research cohorts).



