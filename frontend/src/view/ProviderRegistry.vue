<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-6">
                    <h1 class="text-2xl font-bold text-gray-900">Provider Registry</h1>
                    <p class="mt-1 text-sm text-gray-500">
                        Register as a healthcare provider to access emergency medical files
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Provider Status Card -->
            <div class="bg-white shadow rounded-lg mb-6">
                <div class="px-4 py-5 sm:p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg leading-6 font-medium text-gray-900">
                                Provider Status
                            </h3>
                            <p class="mt-1 text-sm text-gray-500">
                                {{ isProvider ? 'You are registered as a provider' : 'You are not registered as a provider' }}
                            </p>
                        </div>
                        <div :class="isProvider ? 'bg-green-100' : 'bg-gray-100'" 
                             class="px-4 py-2 rounded-md">
                            <span :class="isProvider ? 'text-green-800' : 'text-gray-800'" 
                                  class="text-sm font-medium">
                                {{ isProvider ? 'Registered' : 'Not Registered' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Registration Card -->
            <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {{ isProvider ? 'Provider Information' : 'Register as Provider' }}
                    </h3>

                    <div v-if="!isProvider" class="space-y-4">
                        <!-- Provider Details Form -->
                        <div>
                            <label for="provider-name" class="block text-sm font-medium text-gray-700">
                                Provider Name
                            </label>
                            <input type="text" id="provider-name" v-model="providerName"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Enter your provider name"
                                required />
                        </div>

                        <div>
                            <label for="provider-type" class="block text-sm font-medium text-gray-700">
                                Provider Type
                            </label>
                            <select id="provider-type" v-model="providerType"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                                <option value="hospital">Hospital</option>
                                <option value="clinic">Clinic</option>
                                <option value="pharmacy">Pharmacy</option>
                                <option value="laboratory">Laboratory</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <InformationCircleIcon class="h-5 w-5 text-blue-400" />
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-blue-800">
                                        Emergency Access
                                    </h3>
                                    <div class="mt-2 text-sm text-blue-700">
                                        <p>As a registered provider, you can request emergency access to medical files for up to 48 hours in critical situations.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Register Button -->
                        <div>
                            <button @click="handleRegister" :disabled="isLoading"
                                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                <span v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                <span v-else class="mr-2">📋</span>
                                Register as Provider
                            </button>
                        </div>
                    </div>

                    <!-- Remove Registration -->
                    <div v-else>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" />
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-yellow-800">
                                        Registered Provider
                                    </h3>
                                    <div class="mt-2 text-sm text-yellow-700">
                                        <p>You are currently registered as a healthcare provider.</p>
                                        <p>You can request emergency access to medical files.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button @click="handleRemove" :disabled="isLoading"
                            class="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                            <span v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-red-700 mr-2"></span>
                            Remove Provider Registration
                        </button>
                    </div>
                </div>
            </div>

            <!-- Success Modal -->
            <SuccessModal :is-open="showSuccessModal" :title="successTitle" :message="successMessage"
                :type="successModalType" @close="closeSuccessModal" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
    InformationCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import { useWallet } from '../composable/useWallet';
import SuccessModal from '../components/SuccessModal.vue';

const { userAccount, registerAsProvider, removeProvider, checkIfProvider } = useWallet();

const isProvider = ref(false);
const providerName = ref('');
const providerType = ref('hospital');
const isLoading = ref(false);
const showSuccessModal = ref(false);
const successTitle = ref('');
const successMessage = ref('');
const successModalType = ref('success');

const loadProviderStatus = async () => {
    try {
        isLoading.value = true;
        const status = await checkIfProvider();
        isProvider.value = status;
    } catch (error) {
        console.error('Failed to check provider status:', error);
    } finally {
        isLoading.value = false;
    }
};

const handleRegister = async () => {
    try {
        isLoading.value = true;

        if (!providerName.value) {
            throw new Error('Please enter a provider name');
        }

        await registerAsProvider();
        
        isProvider.value = true;
        
        successTitle.value = 'Successfully Registered';
        successMessage.value = 'You are now registered as a healthcare provider. You can request emergency access to medical files.';
        successModalType.value = 'success';
        showSuccessModal.value = true;
    } catch (error) {
        console.error('Registration failed:', error);
        successTitle.value = 'Registration Failed';
        successMessage.value = error.message;
        successModalType.value = 'error';
        showSuccessModal.value = true;
    } finally {
        isLoading.value = false;
    }
};

const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your provider registration?')) {
        return;
    }

    try {
        isLoading.value = true;
        await removeProvider();
        
        isProvider.value = false;
        
        successTitle.value = 'Registration Removed';
        successMessage.value = 'You are no longer registered as a provider.';
        successModalType.value = 'success';
        showSuccessModal.value = true;
    } catch (error) {
        console.error('Failed to remove registration:', error);
        successTitle.value = 'Removal Failed';
        successMessage.value = error.message;
        successModalType.value = 'error';
        showSuccessModal.value = true;
    } finally {
        isLoading.value = false;
    }
};

const closeSuccessModal = () => {
    showSuccessModal.value = false;
};

onMounted(() => {
    loadProviderStatus();
});
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>

