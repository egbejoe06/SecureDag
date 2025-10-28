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
                            :class="`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${iconClass}`">
                            <CheckCircleIcon v-if="!isError" class="h-6 w-6" />
                            <ExclamationCircleIcon v-else class="h-6 w-6" />
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">
                                {{ title }}
                            </h3>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    {{ message }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button @click="closeModal"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CheckCircleIcon } from '@heroicons/vue/24/solid';
import { ExclamationCircleIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';

// Props
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Success!'
    },
    message: {
        type: String,
        default: 'Operation completed successfully.'
    },
    type: {
        type: String,
        default: 'success', // 'success' or 'error'
        validator: (value) => ['success', 'error'].includes(value)
    }
});

// Computed
const isError = computed(() => props.type === 'error');
const iconClass = computed(() => {
    return isError.value 
        ? 'bg-red-100 text-red-600' 
        : 'bg-green-100 text-green-600';
});

// Emits
const emit = defineEmits(['close']);

const closeModal = () => {
    emit('close');
};
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
