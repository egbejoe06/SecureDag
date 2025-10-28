<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">My Files</h1>
                        <p class="mt-1 text-sm text-gray-500">
                            Upload and manage your encrypted files
                        </p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center space-x-3">
                        <!-- Refresh Button -->
                        <button @click="refreshFileList" :disabled="isLoading"
                            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                            <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" />
                            Refresh
                        </button>

                        <!-- Upload Button -->
                        <button @click="showUploadModal = true"
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <PlusIcon class="w-4 h-4 mr-2" />
                            Upload File
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- File Grid -->
            <FileGrid :files="uploadedFiles" :is-loading="isLoading" :downloading-file-id="downloadingFileId"
                @download="handleDownload" @share="handleShare" @access-management="handleAccessManagement"
                @more-options="handleMoreOptions" @bulk-share="handleBulkShare" @bulk-download="handleBulkDownload" />

            <!-- Empty State -->
            <div v-if="uploadedFiles.length === 0 && !isLoading" class="text-center py-12">
                <CloudArrowUpIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
                <p class="mt-1 text-sm text-gray-500">
                    Get started by uploading your first encrypted file.
                </p>

                <!-- Error Message -->
                <div v-if="loadError"
                    class="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3 max-w-md mx-auto">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" />
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-yellow-800">
                                File Loading Notice
                            </h3>
                            <div class="mt-1 text-sm text-yellow-700">
                                {{ loadError }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-6">
                    <button @click="showUploadModal = true"
                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <PlusIcon class="w-4 h-4 mr-2" />
                        Upload File
                    </button>
                </div>
            </div>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <!-- Background overlay -->
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeUploadModal"></div>
                </div>

                <!-- Modal panel -->
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <!-- Header -->
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div
                                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <CloudArrowUpIcon class="h-6 w-6 text-blue-600" />
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">
                                    Upload File
                                </h3>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-500">
                                        Upload and encrypt a file for secure storage
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Upload Form -->
                    <div class="bg-white px-4 pb-4 sm:p-6">
                        <form @submit.prevent="handleUpload" class="space-y-4">
                            <!-- File Input -->
                            <div>
                                <label for="file" class="block text-sm font-medium text-gray-700">
                                    Select File
                                </label>
                                <div class="mt-1">
                                    <input ref="fileInput" type="file" id="file" @change="handleFileSelect"
                                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        required />
                                </div>
                            </div>

                            <!-- Module Selection -->
                            <div>
                                <label for="module" class="block text-sm font-medium text-gray-700">
                                    Module Type
                                </label>
                                <div class="mt-1">
                                    <select v-model="selectedModule" id="module"
                                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        required>
                                        <option value="1">BioKey (Genomic Data)</option>
                                        <option value="2">MediVault (Medical Files)</option>
                                        <option value="3">IPSeal (Intellectual Property)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Description -->
                            <div>
                                <label for="description" class="block text-sm font-medium text-gray-700">
                                    Description (Optional)
                                </label>
                                <div class="mt-1">
                                    <textarea v-model="description" id="description" rows="3"
                                        placeholder="Add a description for this file..."
                                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                </div>
                            </div>

                            <!-- IP Timestamping Fields (only for IPSeal module) -->
                            <div v-if="selectedModule === '3'">
                                <div class="mb-4">
                                    <label for="ip-type" class="block text-sm font-medium text-gray-700">
                                        IP Type
                                    </label>
                                    <div class="mt-1">
                                        <select v-model="ipType" id="ip-type"
                                            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            required>
                                            <option value="patent">Patent</option>
                                            <option value="copyright">Copyright</option>
                                            <option value="trademark">Trademark</option>
                                            <option value="trade_secret">Trade Secret</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label for="ip-description" class="block text-sm font-medium text-gray-700">
                                        IP Description
                                    </label>
                                    <div class="mt-1">
                                        <textarea v-model="ipDescription" id="ip-description" rows="3"
                                            placeholder="Describe the intellectual property..."
                                            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                    </div>
                                </div>
                            </div>

                            <!-- Encryption Status -->
                            <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <ShieldCheckIcon class="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div class="ml-3">
                                        <h3 class="text-sm font-medium text-blue-800">
                                            Secure Upload
                                        </h3>
                                        <div class="mt-1 text-sm text-blue-700">
                                            <p>File will be encrypted before upload to IPFS</p>
                                            <p>Only you and authorized users can decrypt it</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Error Message -->
                            <div v-if="uploadError" class="bg-red-50 border border-red-200 rounded-md p-3">
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                                    </div>
                                    <div class="ml-3">
                                        <h3 class="text-sm font-medium text-red-800">
                                            Upload Error
                                        </h3>
                                        <div class="mt-1 text-sm text-red-700">
                                            {{ uploadError }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Footer -->
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="handleUpload" :disabled="!selectedFileForUpload || isUploading"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            <CloudArrowUpIcon v-if="!isUploading" class="h-4 w-4 mr-2" />
                            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {{ isUploading ? 'Uploading...' : 'Upload File' }}
                        </button>
                        <button @click="closeUploadModal" :disabled="isUploading"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Share Modal -->
        <ShareModal :is-open="showShareModal" :file="selectedFile" :is-sharing="isLoading" @close="closeShareModal"
            @share="handleShareFile" />

        <!-- Success Modal -->
        <SuccessModal :is-open="showSuccessModal" :title="successTitle" :message="successMessage"
            :type="successModalType" @close="closeSuccessModal" />

        <!-- Access Management Modal -->
        <div v-if="showAccessModal" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeAccessModal"></div>
                </div>
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <AccessList :file="selectedFile" :access-list="getFileAccessList(selectedFile?.id)"
                            :is-loading="isLoading" @revoke-access="handleRevokeAccess"
                            @extend-access="handleExtendAccess" @share-file="handleShare" />
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="closeAccessModal"
                            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Extension Modal -->
        <div v-if="showExtensionModal" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div class="absolute inset-0 bg-gray-500 opacity-75" @click="showExtensionModal = false"></div>
                </div>
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div
                                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ClockIcon class="h-6 w-6 text-blue-600" />
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">
                                    Extend Access
                                </h3>
                                <div class="mt-4">
                                    <label for="extension-date" class="block text-sm font-medium text-gray-700">
                                        New Expiry Date
                                    </label>
                                    <input type="datetime-local" id="extension-date" v-model="newExpiryDate"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="confirmExtendAccess" :disabled="!newExpiryDate || isLoading"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            Extend
                        </button>
                        <button @click="showExtensionModal = false" :disabled="isLoading"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ethers } from 'ethers';
import {
    PlusIcon,
    CloudArrowUpIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ClockIcon
} from '@heroicons/vue/24/outline';
import { useWallet } from '../composable/useWallet';
import { useFileStore } from '../stores/file';
import { useModuleStore } from '../stores/module';
import { useKeyStore } from '../stores/key';
import FileGrid from '../components/FileGrid.vue';
import ShareModal from '../components/ShareModal.vue';
import SuccessModal from '../components/SuccessModal.vue';
import AccessList from '../components/AccessList.vue';
import { encryptFile, generateFileKey, encryptFileKey, decryptFile, decryptFileKey, downloadFile, hexToUint8Array, generateDocumentHash } from '../utils/crypto';
import { uploadToIPFS, downloadFromIPFS } from '../utils/ipfs';

// Composables
const { getDataVaultContract, getMediVaultModuleContract, getBioKeyModuleContract, getIPSealModuleContract, userAccount, loadUserFiles, shareFile, revokeFileAccess, timestampIP } = useWallet();
const fileStore = useFileStore();
const moduleStore = useModuleStore();
const keyStore = useKeyStore();

// Reactive state
const showUploadModal = ref(false);
const showShareModal = ref(false);
const showAccessModal = ref(false);
const showSuccessModal = ref(false);
const selectedFile = ref(null);
const selectedFileForUpload = ref(null);
const selectedModule = ref('2');
const description = ref('');
const isUploading = ref(false);
const uploadError = ref('');
const isLoading = ref(false);
const loadError = ref('');
const successTitle = ref('');
const successMessage = ref('');
const successModalType = ref('success');
const downloadingFileId = ref(null);

// IP Timestamping fields
const ipType = ref('patent');
const ipDescription = ref('');
const showExtensionModal = ref(false);
const newExpiryDate = ref('');
const accessToExtend = ref(null);

// Computed
const uploadedFiles = computed(() => fileStore.uploadedFiles);

// Methods
const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedFileForUpload.value = file;
        // Auto-select module based on file type
        if (file.type.includes('image') || file.name.toLowerCase().includes('medical')) {
            selectedModule.value = '2'; // MediVault
        } else if (file.name.toLowerCase().includes('genomic') || file.name.toLowerCase().includes('dna')) {
            selectedModule.value = '1'; // BioKey
        } else if (file.name.toLowerCase().includes('patent') || file.name.toLowerCase().includes('copyright')) {
            selectedModule.value = '3'; // IPSeal
        }
    }
};

const handleUpload = async () => {
    if (!selectedFileForUpload.value) return;

    // Check if user has derived encryption keys
    if (!keyStore.hasUserKeyPair) {
        uploadError.value = 'Please derive encryption keys first. Go to Settings to generate your encryption keys.';
        return;
    }

    isUploading.value = true;
    uploadError.value = '';

    try {
        // Generate encryption key
        const fileKey = generateFileKey();

        // Read file as Uint8Array
        const fileData = new Uint8Array(await selectedFileForUpload.value.arrayBuffer());

        // Encrypt file
        const encryptedFile = encryptFile(fileData, fileKey);

        // Upload to IPFS
        const ipfsResult = await uploadToIPFS(
            encryptedFile,
            selectedFileForUpload.value.name,
            {
                description: description.value,
                module: selectedModule.value,
                originalSize: fileData.length
            }
        );

        // Get user's public key for encryption
        const userKeyPair = keyStore.userKeyPair;
        if (!userKeyPair) {
            throw new Error('User encryption keys not available');
        }

        // Encrypt file key with user's public key
        const encryptedFileKey = encryptFileKey(fileKey, userKeyPair.x25519.publicKey, userKeyPair.x25519.secretKey);

        // Generate file ID
        const dataVaultContract = getDataVaultContract();
        if (!dataVaultContract) {
            throw new Error('DataVault contract not available');
        }

        // Validate parameters before contract call
        if (!userAccount.value) {
            throw new Error('User account not available');
        }
        if (!ipfsResult.ipfsHash) {
            throw new Error('IPFS hash not available');
        }

        console.log('Generating file ID with:', {
            userAccount: userAccount.value,
            ipfsHash: ipfsResult.ipfsHash
        });

        // Generate file ID locally using the same logic as the contract
        // This matches: keccak256(abi.encode(owner, cid))
        const fileId = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['address', 'string'],
                [userAccount.value, ipfsResult.ipfsHash]
            )
        );

        // Upload to blockchain
        const tx = await dataVaultContract.uploadFile(
            fileId,
            ipfsResult.ipfsHash,
            encryptedFileKey,
            1, // key version
            parseInt(selectedModule.value),
            selectedFileForUpload.value.name
        );

        await tx.wait();

        // If IPSeal module, add IP timestamping
        if (parseInt(selectedModule.value) === 3) {
            try {
                // Generate document hash from original file data
                const documentHashHex = generateDocumentHash(fileData);
                const documentHash = ethers.utils.keccak256(documentHashHex);

                // Call IP timestamping
                const ipSealContract = getIPSealModuleContract();
                if (ipSealContract && ipDescription.value) {
                    await timestampIP(
                        fileId,
                        documentHash,
                        ipType.value,
                        ipDescription.value
                    );
                    console.log('IP timestamped successfully');
                }
            } catch (ipError) {
                console.error('IP timestamping failed:', ipError);
                // Continue even if IP timestamping fails
            }
        }

        // Add to file store
        fileStore.addUploadedFile({
            fileId: fileId, // Use generated file ID
            fileName: selectedFileForUpload.value.name,
            cid: ipfsResult.ipfsHash,
            createdAt: new Date().toISOString(),
            keyVersion: 1,
            module: parseInt(selectedModule.value),
            owner: userAccount.value,
            size: fileData.length,
            type: selectedFileForUpload.value.type
        });

        // Update module statistics
        moduleStore.incrementFileUpload(moduleStore.currentModuleName);

        // Refresh the file list to show the newly uploaded file
        await refreshFileList();

        // Close modal and reset form
        closeUploadModal();

    } catch (error) {
        console.error('Upload failed:', error);
        uploadError.value = error.message || 'Upload failed';
    } finally {
        isUploading.value = false;
    }
};

const closeUploadModal = () => {
    showUploadModal.value = false;
    selectedFileForUpload.value = null;
    selectedModule.value = '2';
    description.value = '';
    uploadError.value = '';
    // Reset IP fields
    ipType.value = 'patent';
    ipDescription.value = '';
};

const handleDownload = async (file) => {
    if (!file) {
        console.error('No file provided for download');
        return;
    }

    try {
        // Check if wallet is connected
        if (!userAccount.value) {
            alert('Please connect your wallet first to download files.');
            return;
        }

        // Check if user has derived encryption keys
        if (!keyStore.hasUserKeyPair) {
            alert('Please derive encryption keys first. Go to Settings to generate your encryption keys.');
            return;
        }

        // Show loading state for this specific file
        downloadingFileId.value = file.id;
        isLoading.value = true;

        // Get DataVault contract
        const dataVaultContract = getDataVaultContract();
        if (!dataVaultContract) {
            throw new Error('Wallet not connected or DataVault contract not available. Please connect your wallet first.');
        }

        // Validate file and user account before contract calls
        if (!file.id) {
            throw new Error('File ID not available');
        }
        if (!userAccount.value) {
            throw new Error('User account not available');
        }

        console.log('Downloading file with:', {
            fileId: file.id,
            userAccount: userAccount.value,
            fileName: file.fileName
        });

        // Get file details from blockchain
        const fileDetails = await dataVaultContract.getFileInfo(file.id);
        if (!fileDetails) {
            throw new Error('File not found on blockchain');
        }

        // Get encrypted file key from blockchain
        const encryptedFileKey = await dataVaultContract.getEncryptedFileKey(file.id, userAccount.value);
        if (!encryptedFileKey || encryptedFileKey.length === 0) {
            throw new Error('File key not found or access denied');
        }

        console.log('Encrypted file key type:', typeof encryptedFileKey);
        console.log('Encrypted file key:', encryptedFileKey);
        console.log('Encrypted file key constructor:', encryptedFileKey.constructor.name);
        console.log('Is Uint8Array:', encryptedFileKey instanceof Uint8Array);
        console.log('Is Array:', Array.isArray(encryptedFileKey));

        // Convert encrypted file key to Uint8Array if needed
        let encryptedFileKeyBytes;
        if (encryptedFileKey instanceof Uint8Array) {
            encryptedFileKeyBytes = encryptedFileKey;
        } else if (typeof encryptedFileKey === 'string') {
            // If it's a hex string, convert it
            console.log('Converting hex string to Uint8Array...');
            encryptedFileKeyBytes = hexToUint8Array(encryptedFileKey);
            console.log('Hex conversion result length:', encryptedFileKeyBytes.length);
        } else if (Array.isArray(encryptedFileKey)) {
            // If it's a regular array, convert to Uint8Array
            encryptedFileKeyBytes = new Uint8Array(encryptedFileKey);
        } else {
            throw new Error(`Unsupported encrypted file key format: ${typeof encryptedFileKey}`);
        }

        console.log('Converted encrypted file key:', encryptedFileKeyBytes);
        console.log('Converted type:', encryptedFileKeyBytes.constructor.name);
        console.log('Converted length:', encryptedFileKeyBytes.length);

        // Get user's private key for decryption
        const userKeyPair = keyStore.userKeyPair;
        if (!userKeyPair) {
            throw new Error('User encryption keys not available');
        }

        console.log('User key pair available:', !!userKeyPair);
        console.log('User X25519 secret key length:', userKeyPair.x25519.secretKey.length);
        console.log('User X25519 public key length:', userKeyPair.x25519.publicKey.length);

        // Decrypt the file key
        console.log('Attempting to decrypt file key...');
        const fileKey = decryptFileKey(encryptedFileKeyBytes, userKeyPair.x25519.secretKey);
        console.log('File key decrypted successfully, length:', fileKey.length);

        // Download encrypted file from IPFS
        const encryptedFileData = await downloadFromIPFS(file.cid);

        // Decrypt the file
        const decryptedFileData = decryptFile(encryptedFileData, fileKey);

        // Trigger browser download
        downloadFile(decryptedFileData, file.fileName, file.type);

        console.log('File downloaded successfully:', file.fileName);

    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed: ' + error.message);
    } finally {
        isLoading.value = false;
        downloadingFileId.value = null;
    }
};

const handleShare = (file) => {
    selectedFile.value = file;
    showShareModal.value = true;
};

const closeShareModal = () => {
    showShareModal.value = false;
    selectedFile.value = null;
};

const closeSuccessModal = () => {
    showSuccessModal.value = false;
};

const handleShareFile = async (shareData) => {
    console.log('Share file:', shareData);

    try {
        isLoading.value = true;

        // Check if wallet is connected
        if (!userAccount.value) {
            alert('Please connect your wallet first to share files.');
            return;
        }

        // Check if user has derived encryption keys
        if (!keyStore.hasUserKeyPair) {
            alert('Please derive encryption keys first. Go to Settings to generate your encryption keys.');
            return;
        }

        // Calculate expiry timestamp
        let expiryTimestamp = 0; // 0 means no expiry
        if (shareData.expiry) {
            const expiryDate = new Date(shareData.expiry);
            expiryTimestamp = Math.floor(expiryDate.getTime() / 1000); // Convert to Unix timestamp
        }

        // Call the shareFile function from useWallet
        await shareFile(
            shareData.fileId,
            shareData.recipient,
            expiryTimestamp
        );

        // Update the file store
        fileStore.addSharedFile({
            fileId: shareData.fileId,
            fileName: shareData.file?.fileName || 'Unknown',
            recipient: shareData.recipient,
            sharedAt: new Date().toISOString(),
            expiry: shareData.expiry,
            accessLevel: shareData.accessLevel,
            isActive: true
        });

        // Show success modal
        successTitle.value = 'File Shared Successfully!';
        successMessage.value = `"${shareData.file?.fileName || 'File'}" has been shared with ${shareData.recipient}.`;
        successModalType.value = 'success';
        showSuccessModal.value = true;

        // Close the share modal
        closeShareModal();

    } catch (error) {
        console.error('Failed to share file:', error);
        successTitle.value = 'Failed to Share File';
        successMessage.value = error.message;
        successModalType.value = 'error';
        showSuccessModal.value = true;
    } finally {
        isLoading.value = false;
    }
};

const handleAccessManagement = (file) => {
    selectedFile.value = file;
    showAccessModal.value = true;
};

const closeAccessModal = () => {
    showAccessModal.value = false;
    selectedFile.value = null;
};

const handleMoreOptions = (file) => {
    // Implement more options logic
    console.log('More options for file:', file);
};

const handleBulkShare = (files) => {
    // Implement bulk share logic
    console.log('Bulk share files:', files);
};

const handleBulkDownload = async (files) => {
    if (!files || files.length === 0) {
        console.error('No files provided for bulk download');
        return;
    }

    try {
        // Check if wallet is connected
        if (!userAccount.value) {
            alert('Please connect your wallet first to download files.');
            return;
        }

        // Check if user has derived encryption keys
        if (!keyStore.hasUserKeyPair) {
            alert('Please derive encryption keys first. Go to Settings to generate your encryption keys.');
            return;
        }

        // Show loading state
        isLoading.value = true;

        // Get DataVault contract
        const dataVaultContract = getDataVaultContract();
        if (!dataVaultContract) {
            throw new Error('Wallet not connected or DataVault contract not available. Please connect your wallet first.');
        }

        // Validate user account
        if (!userAccount.value) {
            throw new Error('User account not available');
        }

        // Get user's private key for decryption
        const userKeyPair = keyStore.userKeyPair;
        if (!userKeyPair) {
            throw new Error('User encryption keys not available');
        }

        // Process each file
        for (const file of files) {
            try {
                // Validate file before processing
                if (!file.id) {
                    console.warn(`File ID not available for: ${file.fileName}`);
                    continue;
                }

                console.log('Processing file:', {
                    fileId: file.id,
                    fileName: file.fileName,
                    userAccount: userAccount.value
                });

                // Get file details from blockchain
                const fileDetails = await dataVaultContract.getFileInfo(file.id);
                if (!fileDetails) {
                    console.warn(`File not found on blockchain: ${file.fileName}`);
                    continue;
                }

                // Get encrypted file key from blockchain
                const encryptedFileKey = await dataVaultContract.getEncryptedFileKey(file.id, userAccount.value);
                if (!encryptedFileKey || encryptedFileKey.length === 0) {
                    console.warn(`File key not found or access denied: ${file.fileName}`);
                    continue;
                }

                // Convert encrypted file key to Uint8Array if needed
                let encryptedFileKeyBytes;
                if (encryptedFileKey instanceof Uint8Array) {
                    encryptedFileKeyBytes = encryptedFileKey;
                } else if (typeof encryptedFileKey === 'string') {
                    // If it's a hex string, convert it
                    encryptedFileKeyBytes = hexToUint8Array(encryptedFileKey);
                } else if (Array.isArray(encryptedFileKey)) {
                    // If it's a regular array, convert to Uint8Array
                    encryptedFileKeyBytes = new Uint8Array(encryptedFileKey);
                } else {
                    console.warn(`Unsupported encrypted file key format for ${file.fileName}: ${typeof encryptedFileKey}`);
                    continue;
                }

                // Decrypt the file key
                const fileKey = decryptFileKey(encryptedFileKeyBytes, userKeyPair.x25519.secretKey);

                // Download encrypted file from IPFS
                const encryptedFileData = await downloadFromIPFS(file.cid);

                // Decrypt the file
                const decryptedFileData = decryptFile(encryptedFileData, fileKey);

                // Trigger browser download
                downloadFile(decryptedFileData, file.fileName, file.type);

                console.log('File downloaded successfully:', file.fileName);

                // Small delay between downloads to avoid overwhelming the browser
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`Failed to download ${file.fileName}:`, error);
                // Continue with other files even if one fails
            }
        }

        console.log(`Bulk download completed for ${files.length} files`);

    } catch (error) {
        console.error('Bulk download failed:', error);
        alert('Bulk download failed: ' + error.message);
    } finally {
        isLoading.value = false;
    }
};

const handleRevokeAccess = async (accessData) => {
    try {
        if (!accessData || !accessData.fileId || !accessData.recipient) {
            console.error('Invalid access data');
            return;
        }

        isLoading.value = true;

        // Confirm with user
        const confirmed = window.confirm(
            `Are you sure you want to revoke access for ${accessData.recipient}?`
        );
        if (!confirmed) return;

        // Revoke access via contract
        await revokeFileAccess(accessData.fileId, accessData.recipient);

        // Update file store
        fileStore.revokeFileAccess(accessData.fileId, accessData.recipient);

        // Show success message
        successTitle.value = 'Access Revoked';
        successMessage.value = `Access has been revoked for ${accessData.recipient}`;
        successModalType.value = 'success';
        showSuccessModal.value = true;

        // Refresh file list
        await refreshFileList();
    } catch (error) {
        console.error('Failed to revoke access:', error);
        successTitle.value = 'Revocation Failed';
        successMessage.value = error.message;
        successModalType.value = 'error';
        showSuccessModal.value = true;
    } finally {
        isLoading.value = false;
    }
};

const handleExtendAccess = async (accessData) => {
    accessToExtend.value = accessData;
    showExtensionModal.value = true;
};

const confirmExtendAccess = async () => {
    if (!accessToExtend.value || !newExpiryDate.value) {
        return;
    }

    try {
        isLoading.value = true;

        // Get file info
        const file = fileStore.getFileById(accessToExtend.value.fileId);
        if (!file) {
            throw new Error('File not found');
        }

        // Calculate expiry timestamp
        const expiryDate = new Date(newExpiryDate.value);
        if (expiryDate <= new Date()) {
            throw new Error('Expiry date must be in the future');
        }

        const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);

        // Get recipient's public key
        const { getPublicKey, getKeyRegistryContract } = useWallet();
        const recipientPublicKey = await getPublicKey(accessToExtend.value.recipient);
        if (!recipientPublicKey) {
            throw new Error('Failed to get recipient public key');
        }

        // Get file key
        const dataVaultContract = getDataVaultContract();
        const encryptedFileKey = await dataVaultContract.getEncryptedFileKey(
            accessToExtend.value.fileId,
            userAccount.value
        );

        if (!encryptedFileKey || encryptedFileKey.length === 0) {
            throw new Error('File key not found');
        }

        // Convert encrypted file key to Uint8Array
        let encryptedFileKeyBytes;
        if (encryptedFileKey instanceof Uint8Array) {
            encryptedFileKeyBytes = encryptedFileKey;
        } else if (typeof encryptedFileKey === 'string') {
            encryptedFileKeyBytes = hexToUint8Array(encryptedFileKey);
        } else if (Array.isArray(encryptedFileKey)) {
            encryptedFileKeyBytes = new Uint8Array(encryptedFileKey);
        } else {
            throw new Error(`Unsupported encrypted file key format: ${typeof encryptedFileKey}`);
        }

        // Decrypt file key
        const userKeyPair = keyStore.userKeyPair;
        if (!userKeyPair) {
            throw new Error('User encryption keys not available');
        }

        const fileKey = decryptFileKey(encryptedFileKeyBytes, userKeyPair.x25519.secretKey);

        // Re-encrypt for recipient with new expiry
        const reEncryptedKey = encryptFileKey(
            fileKey,
            recipientPublicKey,
            userKeyPair.x25519.secretKey
        );

        // First revoke old access
        await revokeFileAccess(accessToExtend.value.fileId, accessToExtend.value.recipient);

        // Then share again with new expiry
        await shareFile(
            accessToExtend.value.fileId,
            accessToExtend.value.recipient,
            expiryTimestamp
        );

        // Close modal
        showExtensionModal.value = false;
        accessToExtend.value = null;
        newExpiryDate.value = '';

        // Show success
        successTitle.value = 'Access Extended';
        successMessage.value = `Access extended until ${expiryDate.toLocaleDateString()}`;
        successModalType.value = 'success';
        showSuccessModal.value = true;

        // Refresh file list
        await refreshFileList();
    } catch (error) {
        console.error('Failed to extend access:', error);
        successTitle.value = 'Extension Failed';
        successMessage.value = error.message;
        successModalType.value = 'error';
        showSuccessModal.value = true;
    } finally {
        isLoading.value = false;
    }
};

const getFileAccessList = (fileId) => {
    // Return access list for file
    return fileStore.sharedFiles.filter(share => share.id === fileId);
};

// Refresh file list from blockchain
const refreshFileList = async () => {
    try {
        if (userAccount.value) {
            console.log('Refreshing file list...');
            loadError.value = '';
            const files = await loadUserFiles();

            // Clear existing files and add loaded files to store
            fileStore.clearAllFiles();
            files.forEach(file => {
                fileStore.addUploadedFile({
                    fileId: file.id,
                    fileName: file.fileName,
                    cid: file.cid,
                    createdAt: file.createdAt,
                    keyVersion: file.keyVersion,
                    module: file.module,
                    owner: file.owner,
                    size: file.size,
                    type: file.type
                });
            });

            console.log(`Refreshed file list with ${files.length} files`);

            if (files.length === 0) {
                loadError.value = 'No files found. This could be because: 1) No files have been uploaded yet, 2) Files were uploaded more than 1000 blocks ago, or 3) There was an issue connecting to the blockchain.';
            }
        }
    } catch (error) {
        console.error('Failed to refresh file list:', error);
        loadError.value = 'Failed to load files from blockchain. Please check your connection and try again.';
    }
};

// Lifecycle
onMounted(async () => {
    // Load user's files from blockchain events
    isLoading.value = true;
    loadError.value = '';

    try {
        if (userAccount.value) {
            console.log('Loading files for user:', userAccount.value);
            const files = await loadUserFiles();

            // Clear existing files and add loaded files to store
            fileStore.clearAllFiles();
            files.forEach(file => {
                fileStore.addUploadedFile({
                    fileId: file.id,
                    fileName: file.fileName,
                    cid: file.cid,
                    createdAt: file.createdAt,
                    keyVersion: file.keyVersion,
                    module: file.module,
                    owner: file.owner,
                    size: file.size,
                    type: file.type
                });
            });

            console.log(`Loaded ${files.length} files from blockchain`);

            if (files.length === 0) {
                loadError.value = 'No files found. This could be because: 1) No files have been uploaded yet, 2) Files were uploaded more than 1000 blocks ago, or 3) There was an issue connecting to the blockchain.';
            }
        } else {
            console.log('No user account connected, skipping file load');
            loadError.value = 'Please connect your wallet to load files.';
        }
    } catch (error) {
        console.error('Failed to load files:', error);
        loadError.value = 'Failed to load files from blockchain. Please check your connection and try again.';
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
