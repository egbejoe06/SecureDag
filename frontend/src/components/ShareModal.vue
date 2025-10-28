<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <!-- Background overlay -->
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeModal"></div>
            </div>

            <!-- Modal panel -->
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <!-- Header -->
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div
                            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                            <ShareIcon class="h-6 w-6 text-blue-600" />
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">
                                Share File
                            </h3>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    Share "{{ file?.fileName }}" with another user
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form -->
                <div class="bg-white px-4 pb-4 sm:p-6">
                    <form @submit.prevent="handleShare" class="space-y-4">
                        <!-- Recipient Address -->
                        <div>
                            <label for="recipient" class="block text-sm font-medium text-gray-700">
                                Recipient Wallet Address
                            </label>
                            <div class="mt-1">
                                <input v-model="recipientAddress" type="text" id="recipient" placeholder="0x..."
                                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    :class="{ 'border-red-300': recipientError }" required />
                                <p v-if="recipientError" class="mt-1 text-sm text-red-600">
                                    {{ recipientError }}
                                </p>
                            </div>
                        </div>

                        <!-- Access Expiry (for MediVault) -->
                        <div v-if="showExpiryOptions">
                            <label for="expiry" class="block text-sm font-medium text-gray-700">
                                Access Expiry
                            </label>
                            <div class="mt-1">
                                <select v-model="selectedExpiry" id="expiry"
                                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                                    <option value="1">1 Day</option>
                                    <option value="7">1 Week</option>
                                    <option value="30">1 Month</option>
                                    <option value="90">3 Months</option>
                                    <option value="365">1 Year</option>
                                    <option value="0">No Expiry</option>
                                </select>
                            </div>
                        </div>

                        <!-- Access Level -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700">
                                Access Level
                            </label>
                            <div class="mt-2 space-y-2">
                                <div class="flex items-center">
                                    <input v-model="accessLevel" id="read-only" type="radio" value="1"
                                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                                    <label for="read-only" class="ml-3 block text-sm font-medium text-gray-700">
                                        Read Only
                                    </label>
                                </div>
                                <div class="flex items-center">
                                    <input v-model="accessLevel" id="read-write" type="radio" value="2"
                                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                                    <label for="read-write" class="ml-3 block text-sm font-medium text-gray-700">
                                        Read & Write
                                    </label>
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
                                        Secure Sharing
                                    </h3>
                                    <div class="mt-1 text-sm text-blue-700">
                                        <p>File will be encrypted with recipient's public key</p>
                                        <p v-if="!hasRecipientKey" class="mt-1 text-orange-600">
                                            ⚠️ Recipient must have registered encryption keys
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Error Message -->
                        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-red-800">
                                        Error
                                    </h3>
                                    <div class="mt-1 text-sm text-red-700">
                                        {{ error }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button @click="handleShare" :disabled="isShareButtonDisabled"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <ShareIcon v-if="!isSharingProp" class="h-4 w-4 mr-2" />
                        <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {{ isSharingProp ? 'Sharing...' : 'Share File' }}
                    </button>
                    <button @click="closeModal" :disabled="isSharingProp"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
    ShareIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import { useWallet } from '../composable/useWallet';
import { useModuleStore } from '../stores/module';

// Props
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    file: {
        type: Object,
        default: null
    },
    isSharing: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['close', 'share']);

// Composables
const { getPublicKey } = useWallet();
const moduleStore = useModuleStore();

// Reactive state
const recipientAddress = ref('');
const selectedExpiry = ref('30');
const accessLevel = ref('1');
const isLoading = ref(false);
const error = ref('');
const recipientError = ref('');
const hasRecipientKey = ref(false);

// Computed
const showExpiryOptions = computed(() => {
    return moduleStore.currentModuleName === 'MediVault';
});

const isShareButtonDisabled = computed(() => {
    const trimmedAddress = recipientAddress.value.trim();
    return props.isSharing || !trimmedAddress || !!recipientError.value;
});

const isSharingProp = computed(() => props.isSharing);

// Methods
const validateAddress = (address) => {
    if (!address) return 'Address is required';
    const trimmedAddress = address.trim();
    if (!trimmedAddress) return 'Address is required';
    if (!trimmedAddress.startsWith('0x') && !trimmedAddress.startsWith('0X')) return 'Address must start with 0x';
    if (trimmedAddress.length !== 42) return 'Address must be 42 characters long';
    // Basic hex validation
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmedAddress)) return 'Invalid address format';
    return '';
};

const checkRecipientKey = async (address) => {
    if (!address || !address.trim()) {
        hasRecipientKey.value = false;
        return;
    }

    try {
        const publicKey = await getPublicKey(address);
        hasRecipientKey.value = !!publicKey;
    } catch (err) {
        console.warn('Could not check recipient key:', err);
        hasRecipientKey.value = false;
        // Don't set an error - allow sharing even if we can't check the key
    }
};

const handleShare = async () => {
    if (!props.file) return;

    // Validate one more time before sharing
    const trimmedAddress = recipientAddress.value.trim();
    const validationError = validateAddress(trimmedAddress);

    if (validationError) {
        recipientError.value = validationError;
        return;
    }

    isLoading.value = true;
    error.value = '';

    try {
        const shareData = {
            fileId: props.file.id,
            recipient: trimmedAddress,
            expiry: selectedExpiry.value === '0' ? null : calculateExpiryDate(),
            accessLevel: parseInt(accessLevel.value),
            file: props.file // Include the full file object
        };

        emit('share', shareData);
        closeModal();

    } catch (err) {
        error.value = err.message || 'Failed to share file';
    } finally {
        isLoading.value = false;
    }
};

const calculateExpiryDate = () => {
    const days = parseInt(selectedExpiry.value);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate.toISOString();
};

const closeModal = () => {
    if (isLoading.value) return;

    // Reset form
    recipientAddress.value = '';
    selectedExpiry.value = '30';
    accessLevel.value = '1';
    error.value = '';
    recipientError.value = '';
    hasRecipientKey.value = false;

    emit('close');
};

// Watchers
watch(recipientAddress, async (newAddress) => {
    const trimmedAddress = newAddress.trim();
    const error = validateAddress(trimmedAddress);
    recipientError.value = error;

    // Only check recipient key if address is valid
    if (!error && trimmedAddress) {
        await checkRecipientKey(trimmedAddress);
    }
});

watch(() => props.isOpen, (isOpen) => {
    if (isOpen && props.file) {
        // Reset form when modal opens
        recipientAddress.value = '';
        selectedExpiry.value = '30';
        accessLevel.value = '1';
        error.value = '';
        recipientError.value = '';
        hasRecipientKey.value = false;
    }
});
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
