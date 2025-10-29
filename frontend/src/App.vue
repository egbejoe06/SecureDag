<template>
  <div v-if="$route.name === 'LandingPage'">
    <router-view></router-view>
  </div>
  <NavBar v-else>
    <router-view></router-view>
  </NavBar>
</template>

<script setup>
import { useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';

const $route = useRoute();
</script>