import Admin from './pages/Admin';
import CreateQuote from './pages/CreateQuote';
import Dashboard from './pages/Dashboard';
import LicenseEntry from './pages/LicenseEntry';
import QuoteHistory from './pages/QuoteHistory';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import ScheduleJob from './pages/ScheduleJob';
import JobDetails from './pages/JobDetails';
import PaymentPage from './pages/PaymentPage';


export const PAGES = {
    "Admin": Admin,
    "CreateQuote": CreateQuote,
    "Dashboard": Dashboard,
    "LicenseEntry": LicenseEntry,
    "QuoteHistory": QuoteHistory,
    "Settings": Settings,
    "Calendar": Calendar,
    "ScheduleJob": ScheduleJob,
    "JobDetails": JobDetails,
    "PaymentPage": PaymentPage,
}

export const pagesConfig = {
    mainPage: "LicenseEntry",
    Pages: PAGES,
};