import Admin from './pages/Admin';
import CreateQuote from './pages/CreateQuote';
import Dashboard from './pages/Dashboard';
import LicenseEntry from './pages/LicenseEntry';
import QuoteHistory from './pages/QuoteHistory';
import Settings from './pages/Settings';


export const PAGES = {
    "Admin": Admin,
    "CreateQuote": CreateQuote,
    "Dashboard": Dashboard,
    "LicenseEntry": LicenseEntry,
    "QuoteHistory": QuoteHistory,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "LicenseEntry",
    Pages: PAGES,
};