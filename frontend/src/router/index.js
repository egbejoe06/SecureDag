import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "../view/LandingPage.vue";
import Dashboard from "../view/Dashboard.vue";
import MyFiles from "../view/MyFiles.vue";
import SharedWithMe from "../view/SharedWithMe.vue";
import Settings from "../view/Settings.vue";
import ProviderRegistry from "../view/ProviderRegistry.vue";
import IPVerification from "../view/IPVerification.vue";

const routes = [
  {
    path: "/",
    name: "LandingPage",
    component: LandingPage,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/my-files",
    name: "MyFiles",
    component: MyFiles,
  },
  {
    path: "/shared",
    name: "SharedWithMe",
    component: SharedWithMe,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
  {
    path: "/provider-registry",
    name: "ProviderRegistry",
    component: ProviderRegistry,
  },
  {
    path: "/ip-verification",
    name: "IPVerification",
    component: IPVerification,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
