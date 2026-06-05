import Vue from "vue";
import Router from "vue-router";

import Layout from "@/components/Layout/Layout";

// Pages
import Dashboard from "@/pages/Dashboard/Dashboard";
import Search from "@/pages/Dashboard/Search";
import Board from "./pages/Dashboard/Board.vue";
import viewDetail from "./pages/Dashboard/viewDetail.vue";
import PolDiploInfo from "./pages/Dashboard/PolDiploInfo.vue";
import SearchPolDiplo from "./pages/Dashboard/SearchPolDiplo.vue";
import ProfileDetails from "./pages/Dashboard/ProfileDetails.vue";
import MapDiplo from "./pages/Dashboard/MapDiplo.vue";
import Observations from "./pages/Dashboard/Observations.vue";

// Core
import Typography from "@/pages/Core/Typography/Typography";
import Colors from "@/pages/Core/Colors/Colors";
import Grid from "@/pages/Core/Grid/Grid";

// Tables
import tableBasic from "./pages/Tables/tableBasic/tableBasic";
import tableDynamic from "./pages/Tables/tableDynamic/tableDynamic";

// UI
import Icons from "@/pages/UI/Icons/Icons";
import Badges from "@/pages/UI/Badges/Badges";
import Carousel from "@/pages/UI/Carousel/Carousel";
import Cards from "@/pages/UI/Cards/Cards";
import Modal from "@/pages/UI/Modal/Modal";
import Notifications from "@/pages/UI/Notifications/Notifications";
import Navbar from "@/pages/UI/Navbar/Navbar";
import Tooltips from "@/pages/UI/Tooltips/Tooltips";
import Tabs from "@/pages/UI/Tabs/Tabs";
import Pagination from "@/pages/UI/Pagination/Pagination";
import Progress from "@/pages/UI/Progress/Progress";

// Forms
import FormsElements from "@/pages/Forms/FormsElements/FormsElements";
import FormsValidation from "@/pages/Forms/FormsValidation/FormsValidation";

// Maps
import VectorMaps from "@/pages/Maps/Vector/Vector";
import GoogleMaps from "@/pages/Maps/Google/Google";

// Extra
import Gallery from "@/pages/Extra/Gallery/Gallery";
import Calendar from "@/pages/Extra/Calendar/Calendar";
import Invoice from "@/pages/Extra/Invoice/Invoice";
import SearchResult from "@/pages/Extra/SearchResult/SearchResult";
import TimeLine from "@/pages/Extra/TimeLine/TemeLine";
import Events from "@/pages/Dashboard/Events";
import Links from "@/pages/Dashboard/Links";

// Charts
import ChartsOverview from "@/pages/Charts/Overview/ChartsOverview";
import LineCharts from "@/pages/Charts/LineCharts/LineCharts";
import BarCharts from "@/pages/Charts/BarCharts/BarCharts";
import PieCharts from "@/pages/Charts/PieCharts/PieCharts";

import Error from "@/pages/Error/Error";
import Login from "@/pages/Login/Login";

// E-Commerce
import ProductManagement from "@/pages/E-commerce/ProductManagement/ProductManagement";
import ProductsGrid from "@/pages/E-commerce/ProductGrid/ProductsGrid";
import ProductDetail from "@/pages/E-commerce/ProductDetail/ProductDetail";

//User
import List from "@/pages/User/List/List";
import Add from "@/pages/User/Add/Add";
import Edit from "@/pages/User/Edit/Edit";
import Profile from "@/pages/User/Profile/Profile";

// Documentation
import DocLayout from "@/pages/Documentation/components/Layout/DocLayout";
import Overview from "@/pages/Documentation/pages/Overview/Overview";
import Licences from "@/pages/Documentation/pages/Licences/Licences";
import QuickStart from "@/pages/Documentation/pages/QuickStart/QuickStart";
import Charts from "@/pages/Documentation/pages/Charts/Charts";
import Forms from "@/pages/Documentation/pages/Forms/Forms";
import UI from "@/pages/Documentation/pages/UI/UI";
import Maps from "@/pages/Documentation/pages/Maps/Maps";
import Tables from "@/pages/Documentation/pages/Tables/Tables";
import Structure from "@/pages/Documentation/pages/Structure/Structure";
import Libs from "@/pages/Documentation/pages/Libs/Libs";
import { getTokenPayload } from "./mixins/auth";
import UsersAdmin from "@/pages/Admin/Users";

Vue.use(Router);

const Forbidden = {
  render: (h) =>
    h("v-container", { props: { fluid: true }, staticClass: "mt-12 text-center" }, [
      h("h2", "403 — Accès refusé"),
      h("p", "Vous ne disposez pas des droits nécessaires pour accéder à cette page."),
    ]),
};

const router = new Router({
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
    },

    {
      name: "Documentation",
      path: "/documentation",
      redirect: "/documentation/overview",
      component: DocLayout,
      children: [
        {
          path: "/documentation/overview",
          name: "Overview",
          component: Overview,
        },
        {
          path: "/documentation/licences",
          name: "Licences",
          component: Licences,
        },
        {
          path: "/documentation/quick-start",
          name: "QuickStart",
          component: QuickStart,
        },
        {
          path: "/documentation/charts",
          name: "Charts",
          component: Charts,
        },
        {
          path: "/documentation/forms",
          name: "Forms",
          component: Forms,
        },
        {
          path: "/documentation/ui",
          name: "UI",
          component: UI,
        },
        {
          path: "/documentation/maps",
          name: "Maps",
          component: Maps,
        },
        {
          path: "/documentation/tables",
          name: "DocTables",
          component: Tables,
        },
        {
          path: "/documentation/structure",
          name: "Structure",
          component: Structure,
        },
        {
          path: "/documentation/libs",
          name: "Libs",
          component: Libs,
        },
      ],
    },

    {
      path: "/",
      redirect: "login",
      name: "Layout",
      component: Layout,
      children: [
        {
          path: "/dashboard",
          name: "Dashboard",
          component: Dashboard,
        },

        {
          path: "/board",
          name: "Board",
          component: Board,
        },

        {
          path: "/incident/:id",
          name: "IncidentDetails",
          component: viewDetail,
        },

        {
          path: "/profile/:id",
          name: "ProfileDetails",
          component: ProfileDetails,
        },

        {
          path: "/searchpoldiplo",
          name: "Searchpoldiplo",
          component: SearchPolDiplo,
        },

        {
          path: "/poldiplo",
          name: "PolDiplo",
          component: PolDiploInfo,
        },

        {
          path: "/search",
          name: "Search",
          component: Search,
        },

        {
          path: "/mapdiplo",
          name: "MapDiplo",
          component: MapDiplo,
        },

        {
          path: "/observations",
          name: "Observations",
          component: Observations,
        },

        // Tables
        {
          path: "/tables/basic",
          name: "Tables",
          component: tableBasic,
        },
        {
          path: "/tables/dynamic",
          name: "tableDynamic",
          component: tableDynamic,
        },

        // UI Elements
        {
          path: "/ui/icons",
          name: "Icons",
          component: Icons,
        },
        {
          path: "/ui/badges",
          name: "Badges",
          component: Badges,
        },
        {
          path: "/ui/carousel",
          name: "Carousel",
          component: Carousel,
        },
        {
          path: "/ui/cards",
          name: "Cards",
          component: Cards,
        },
        {
          path: "/ui/modal",
          name: "Modal",
          component: Modal,
        },
        {
          path: "/ui/notifications",
          name: "Notifications",
          component: Notifications,
        },
        {
          path: "/ui/navbar",
          name: "Navbar",
          component: Navbar,
        },
        {
          path: "/ui/tooltips",
          name: "Tooltips",
          component: Tooltips,
        },
        {
          path: "/ui/tabs",
          name: "Tabs",
          component: Tabs,
        },
        {
          path: "/ui/pagination",
          name: "Pagination",
          component: Pagination,
        },
        {
          path: "/ui/progress",
          name: "Progress",
          component: Progress,
        },

        // Forms
        {
          path: "/forms/elements",
          name: "FormsElements",
          component: FormsElements,
        },
        {
          path: "/forms/validation",
          name: "FormsValidation",
          component: FormsValidation,
        },

        // Maps
        {
          path: "/maps/google",
          name: "googleMaps",
          component: GoogleMaps,
        },
        {
          path: "/maps/vector",
          name: "vectorMaps",
          component: VectorMaps,
        },

        // Extra
        {
          path: "/extra/gallery",
          name: "Gallery",
          component: Gallery,
        },
        {
          path: "/extra/calendar",
          name: "Calendar",
          component: Calendar,
        },
        {
          path: "/extra/invoice",
          name: "Invoice",
          component: Invoice,
        },
        {
          path: "/extra/search-result",
          name: "SearchResult",
          component: SearchResult,
        },
        {
          path: "/extra/timeLine",
          name: "TimeLine",
          component: TimeLine,
        },
        {
          path: "/extra/events",
          name: "Events",
          component: Events,
        },
        {
          path: "/extra/links",
          name: "Links",
          component: Links,
        },

        // Core
        {
          path: "/core/typography",
          name: "Typography",
          component: Typography,
        },
        {
          path: "/core/colors",
          name: "Colors",
          component: Colors,
        },
        {
          path: "/core/grid",
          name: "Grid",
          component: Grid,
        },

        // Charts
        {
          path: "/charts/overview",
          name: "ChartsOverview",
          component: ChartsOverview,
        },
        {
          path: "/charts/line-charts",
          name: "LineCharts",
          component: LineCharts,
        },
        {
          path: "/charts/bar-charts",
          name: "BarCharts",
          component: BarCharts,
        },
        {
          path: "/charts/pie-charts",
          name: "PieCharts",
          component: PieCharts,
        },

        // E-Commerce
        {
          path: "/e-commerce/management",
          name: "ProductManagement",
          component: ProductManagement,
        },
        {
          path: "/e-commerce/grid",
          name: "ProductsGrid",
          component: ProductsGrid,
        },
        {
          path: "/e-commerce/detail",
          name: "ProductDetail",
          component: ProductDetail,
        },

        // User
        {
          path: "/user/list",
          name: "UserList",
          component: List,
        },
        {
          path: "/user/add",
          name: "UserAdd",
          component: Add,
        },
        {
          path: "/user/edit",
          name: "UserEdit",
          component: Edit,
        },
        {
          path: "/user/profile",
          name: "UserProfile",
          component: Profile,
        },

        // Admin
        {
          path: "/admin/users",
          name: "AdminUsers",
          component: UsersAdmin,
          meta: { roles: ["admin"] },
        },
      ],
    },
    {
      path: "/403",
      name: "Forbidden",
      component: Forbidden,
    },
    {
      path: "*",
      name: "Error",
      component: Error,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const publicPaths = ["/login", "/403"];
  const isPublic =
    publicPaths.includes(to.path) || to.path.startsWith("/documentation");
  const token = localStorage.getItem("access_token");

  // Already authenticated — skip login page
  if (to.path === "/login" && token) {
    return next({ path: "/board" });
  }

  // Public routes — allow
  if (isPublic) return next();

  // No token — redirect to login, save intended destination
  if (!token) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  // Role-restricted route
  const routeRoles = to.meta?.roles;
  if (routeRoles && routeRoles.length > 0) {
    const payload = getTokenPayload();
    if (!payload || !routeRoles.includes(payload.role)) {
      return next({ path: "/403" });
    }
  }

  next();
});

export default router;
