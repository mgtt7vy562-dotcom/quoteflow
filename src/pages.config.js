import LicenseEntry from './pages/LicenseEntry';
import Dashboard from './pages/Dashboard';
import CreateQuote from './pages/CreateQuote';
import QuoteHistory from './pages/QuoteHistory';
import Settings from './pages/Settings';
import Admin from './pages/Admin';


export const PAGES = {
    "LicenseEntry": LicenseEntry,
    "Dashboard": Dashboard,
    "CreateQuote": CreateQuote,
    "QuoteHistory": QuoteHistory,
    "Settings": Settings,
    "Admin": Admin,
}

export const pagesConfig = {
    mainPage: "LicenseEntry",
    Pages: PAGES,
};