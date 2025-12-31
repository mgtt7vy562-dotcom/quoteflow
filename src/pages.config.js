import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import CreateQuote from './pages/CreateQuote';
import CustomerPortal from './pages/CustomerPortal';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import JobDetails from './pages/JobDetails';
import Landing from './pages/Landing';
import Leads from './pages/Leads';
import PaymentPage from './pages/PaymentPage';
import QuoteHistory from './pages/QuoteHistory';
import ScheduleJob from './pages/ScheduleJob';
import ServiceSelection from './pages/ServiceSelection';
import Settings from './pages/Settings';
import TeamManagement from './pages/TeamManagement';
import TaxRateSetup from './pages/TaxRateSetup';


export const PAGES = {
    "Admin": Admin,
    "Analytics": Analytics,
    "Calendar": Calendar,
    "CreateQuote": CreateQuote,
    "CustomerPortal": CustomerPortal,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Expenses": Expenses,
    "JobDetails": JobDetails,
    "Landing": Landing,
    "Leads": Leads,
    "PaymentPage": PaymentPage,
    "QuoteHistory": QuoteHistory,
    "ScheduleJob": ScheduleJob,
    "ServiceSelection": ServiceSelection,
    "Settings": Settings,
    "TeamManagement": TeamManagement,
    "TaxRateSetup": TaxRateSetup,
}

export const pagesConfig = {
    mainPage: "Admin",
    Pages: PAGES,
};