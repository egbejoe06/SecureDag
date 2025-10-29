<template>
    <div class="p-6">
        <!-- Header -->
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-6">
                    <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
                    <p class="mt-1 text-sm text-gray-500">
                        Manage your encryption keys and account settings
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Settings Navigation -->
                <div class="lg:col-span-1">
                    <nav class="space-y-1">
                        <button v-for="tab in settingsTabs" :key="tab.id" @click="activeTab = tab.id"
                            :class="activeTab === tab.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
                            class="w-full flex items-center pl-3 pr-4 py-2 border-l-4 text-sm font-medium">
                            <component :is="tab.icon" class="w-5 h-5 mr-3" />
                            {{ tab.name }}
                        </button>
                    </nav>
                </div>

                <!-- Settings Content -->
                <div class="lg:col-span-2">
                    <!-- Encryption Keys Tab -->
                    <div v-if="activeTab === 'keys'" class="space-y-6">
                        <div class="bg-white shadow rounded-lg">
                            <div class="px-4 py-5 sm:p-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Encryption Keys
                                </h3>

                                <!-- Key Status -->
                                <div class="mb-6">
                                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0">
                                                <div v-if="hasUserKeyPair" :class="encryptionStatus.iconColor"
                                                    class="h-8 w-8 flex items-center justify-center text-2xl">
                                                    ✓
                                                </div>
                                                <div v-else :class="encryptionStatus.iconColor"
                                                    class="h-8 w-8 flex items-center justify-center text-2xl">
                                                    ⚠
                                                </div>
                                            </div>
                                            <div class="ml-4">
                                                <h4 class="text-sm font-medium text-gray-900">
                                                    {{ encryptionStatus.title }}
                                                </h4>
                                                <p class="text-sm text-gray-500">
                                                    {{ encryptionStatus.description }}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="flex-shrink-0">
                                            <button v-if="!hasUserKeyPair" @click="setupEncryption"
                                                :disabled="isLoading"
                                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                                <span class="mr-2">🔑</span>
                                                Setup Encryption
                                            </button>
                                            <button v-else-if="!isKeyRegistered" @click="registerKey"
                                                :disabled="isLoading"
                                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
                                                <span class="mr-2">📝</span>
                                                Register Key
                                            </button>
                                            <button v-else @click="rotateKeys" :disabled="isLoading"
                                                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                                <span class="mr-2">🔄</span>
                                                Rotate Keys
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Key Information -->
                                <div v-if="hasUserKeyPair" class="space-y-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                                            <h4 class="text-sm font-medium text-blue-800 mb-2">Key Version</h4>
                                            <p class="text-sm text-blue-700">{{ keyVersion }}</p>
                                        </div>
                                        <div
                                            :class="`${registrationStatus.bgColor} border ${registrationStatus.borderColor} rounded-md p-4`">
                                            <h4 class="text-sm font-medium text-gray-800 mb-2">Registration Status</h4>
                                            <p :class="`text-sm ${registrationStatus.textColor}`">{{
                                                registrationStatus.text }}</p>
                                        </div>
                                    </div>

                                    <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
                                        <h4 class="text-sm font-medium text-gray-800 mb-2">Public Key</h4>
                                        <div class="flex items-center space-x-2">
                                            <code
                                                class="text-xs text-gray-600 bg-white px-2 py-1 rounded border flex-1">
                                            {{ userPublicKeyHex }}
                                        </code>
                                            <button @click="copyToClipboard(userPublicKeyHex)"
                                                class="text-gray-400 hover:text-gray-600" title="Copy to clipboard">
                                                <span class="text-lg">📋</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Account Tab -->
                    <div v-if="activeTab === 'account'" class="space-y-6">
                        <div class="bg-white shadow rounded-lg">
                            <div class="px-4 py-5 sm:p-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Account Information
                                </h3>

                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Wallet Address</label>
                                        <div class="mt-1 flex items-center space-x-2">
                                            <code
                                                class="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border flex-1">
                                            {{ userAccount }}
                                        </code>
                                            <button @click="copyToClipboard(userAccount)"
                                                class="text-gray-400 hover:text-gray-600" title="Copy to clipboard">
                                                <span class="text-lg">📋</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Network</label>
                                        <p class="mt-1 text-sm text-gray-900">{{ networkName }}</p>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Connection Status</label>
                                        <div class="mt-1 flex items-center">
                                            <div :class="isConnected ? 'bg-green-400' : 'bg-red-400'"
                                                class="w-2 h-2 rounded-full mr-2"></div>
                                            <span class="text-sm text-gray-900">{{ isConnected ? 'Connected' :
                                                'Disconnected' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Privacy Tab -->
                    <div v-if="activeTab === 'privacy'" class="space-y-6">
                        <div class="bg-white shadow rounded-lg">
                            <div class="px-4 py-5 sm:p-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Privacy Settings
                                </h3>

                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-900">Data Collection</h4>
                                            <p class="text-sm text-gray-500">Allow collection of usage analytics</p>
                                        </div>
                                        <input v-model="privacySettings.analytics" type="checkbox"
                                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    </div>

                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-900">Error Reporting</h4>
                                            <p class="text-sm text-gray-500">Send error reports to help improve the
                                                platform</p>
                                        </div>
                                        <input v-model="privacySettings.errorReporting" type="checkbox"
                                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    </div>

                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-900">Cache Signatures</h4>
                                            <p class="text-sm text-gray-500">Cache key derivation signatures for session
                                            </p>
                                        </div>
                                        <input v-model="privacySettings.cacheSignatures" type="checkbox"
                                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- About Tab -->
                    <div v-if="activeTab === 'about'" class="space-y-6">
                        <div class="bg-white shadow rounded-lg">
                            <div class="px-4 py-5 sm:p-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    About SecureDAG
                                </h3>

                                <div class="space-y-4">
                                    <div>
                                        <h4 class="text-sm font-medium text-gray-900">Version</h4>
                                        <p class="text-sm text-gray-500">1.0.0</p>
                                    </div>

                                    <div>
                                        <h4 class="text-sm font-medium text-gray-900">Platform</h4>
                                        <p class="text-sm text-gray-500">Hedera Testnet</p>
                                    </div>

                                    <div>
                                        <h4 class="text-sm font-medium text-gray-900">Modules</h4>
                                        <div class="mt-2 space-y-2">
                                            <div class="flex items-center justify-between text-sm">
                                                <span class="text-gray-600">MediVault</span>
                                                <span class="text-gray-900">Medical Files</span>
                                            </div>
                                            <div class="flex items-center justify-between text-sm">
                                                <span class="text-gray-600">BioKey</span>
                                                <span class="text-gray-900">Genomic Data</span>
                                            </div>
                                            <div class="flex items-center justify-between text-sm">
                                                <span class="text-gray-600">IPSeal</span>
                                                <span class="text-gray-900">Intellectual Property</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 class="text-sm font-medium text-gray-900">Security</h4>
                                        <p class="text-sm text-gray-500">
                                            All files are encrypted client-side using TweetNaCl and stored on IPFS.
                                            Keys are derived deterministically from your wallet signature.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    ref,
    computed,
    onMounted
} from 'vue';
import {
    KeyIcon,
    UserIcon,
    InformationCircleIcon
} from '@heroicons/vue/24/outline';
import {
    useWallet
} from '../composable/useWallet';
import {
    useWalletStore
} from '../stores/wallet';
import {
    useKeyStore
} from '../stores/key';
import {
    uint8ArrayToHex
} from '../utils/crypto';

// Setup function
const setup = () => {
    // Composables
    const {
        deriveAndRegisterKeys,
        registerPublicKey
    } = useWallet();
    const walletStore = useWalletStore();
    const keyStore = useKeyStore();

    // Reactive state
    const activeTab = ref('keys');
    const isLoading = ref(false);
    const privacySettings = ref({
        analytics: true,
        errorReporting: true,
        cacheSignatures: true
    });

    // Computed
    const hasUserKeyPair = computed(() => keyStore.hasUserKeyPair);
    const keyVersion = computed(() => keyStore.keyVersion);
    const isKeyRegistered = computed(() => keyStore.isKeyRegistered);
    const userPublicKey = computed(() => keyStore.userPublicKey);
    const userPublicKeyHex = computed(() =>
        userPublicKey.value ? uint8ArrayToHex(userPublicKey.value) : ''
    );
    const userAccount = computed(() => walletStore.userAccount);
    const networkName = computed(() => walletStore.networkName);
    const isConnected = computed(() => walletStore.isConnected);

    // Encryption status configuration
    const encryptionStatus = computed(() => {
        if (hasUserKeyPair.value) {
            return {
                title: 'Encryption Keys Active',
                description: 'Your files are encrypted and secure',
                icon: 'ShieldCheckIcon',
                iconColor: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
            };
        } else {
            return {
                title: 'Encryption Keys Not Set',
                description: 'Set up encryption keys to secure your files',
                icon: 'ShieldExclamationIcon',
                iconColor: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200'
            };
        }
    });

    // Registration status configuration
    const registrationStatus = computed(() => {
        if (isKeyRegistered.value) {
            return {
                text: 'Registered',
                textColor: 'text-green-700',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
            };
        } else {
            return {
                text: 'Not Registered',
                textColor: 'text-red-700',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200'
            };
        }
    });

    const settingsTabs = computed(() => [{
        id: 'keys',
        name: 'Encryption Keys',
        icon: KeyIcon
    },
    {
        id: 'account',
        name: 'Account',
        icon: UserIcon
    },
    {
        id: 'privacy',
        name: 'Privacy',
        icon: InformationCircleIcon
    },
    {
        id: 'about',
        name: 'About',
        icon: InformationCircleIcon
    }
    ]);

    // Methods
    const setupEncryption = async () => {
        isLoading.value = true;
        try {
            await deriveAndRegisterKeys();
            // Show success message
        } catch (error) {
            console.error('Failed to setup encryption:', error);
            // Show error message
        } finally {
            isLoading.value = false;
        }
    };

    const registerKey = async () => {
        if (!userPublicKey.value) {
            console.error('No public key available');
            return;
        }

        isLoading.value = true;
        try {
            await registerPublicKey(userPublicKey.value);
            keyStore.setKeyRegistrationStatus(true);
            alert('Key successfully registered on the blockchain!');
        } catch (error) {
            console.error('Failed to register key:', error);
            alert('Failed to register key: ' + error.message);
        } finally {
            isLoading.value = false;
        }
    };

    const rotateKeys = async () => {
        if (!confirm('Are you sure you want to rotate your encryption keys? This will require re-encrypting all your files.')) {
            return;
        }

        isLoading.value = true;
        try {
            // TODO: Implement key rotation
            console.log('Rotating keys...');
        } catch (error) {
            console.error('Failed to rotate keys:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // Show success message
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    // Lifecycle
    onMounted(() => {
        // Load settings
    });

    return {
        // Reactive state
        activeTab,
        isLoading,
        privacySettings,

        // Computed
        hasUserKeyPair,
        keyVersion,
        isKeyRegistered,
        userPublicKey,
        userPublicKeyHex,
        userAccount,
        networkName,
        isConnected,
        encryptionStatus,
        registrationStatus,
        settingsTabs,

        // Methods
        setupEncryption,
        registerKey,
        rotateKeys,
        copyToClipboard
    };
};

export default {
    setup
};
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
