import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import CreateQuote from './pages/CreateQuote';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import JobDetails from './pages/JobDetails';
import LicenseEntry from './pages/LicenseEntry';
import PaymentPage from './pages/PaymentPage';
import QuoteHistory from './pages/QuoteHistory';
import ScheduleJob from './pages/ScheduleJob';
import Settings from './pages/Settings';
import Leads from './pages/Leads';


export const PAGES = {
    "Admin": Admin,
    "Analytics": Analytics,
    "Calendar": Calendar,
    "CreateQuote": CreateQuote,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Expenses": Expenses,
    "JobDetails": JobDetails,
    "LicenseEntry": LicenseEntry,
    "PaymentPage": PaymentPage,
    "QuoteHistory": QuoteHistory,
    "ScheduleJob": ScheduleJob,
    "Settings": Settings,
    "Leads": Leads,
}

export const pagesConfig = {
    mainPage: "LicenseEntry",
    Pages: PAGES,
};