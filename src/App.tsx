import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Home from "@/pages/Home";
import Props from "@/pages/Props";
import PropDetail from "@/pages/PropDetail";
import Knowledge from "@/pages/Knowledge";
import Article from "@/pages/Article";
import Quote from "@/pages/Quote";
import Contact from "@/pages/Contact";
import AdminMock from "@/pages/AdminMock";
import Process from "@/pages/Process";
import Cases from "@/pages/Cases";
import CaseDetail from "@/pages/CaseDetail";
import NotFound from "@/pages/NotFound";
import { QuoteProvider } from "@/contexts/QuoteContext";
import { DataProvider } from "@/contexts/DataContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";

function AppRouter() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/props" component={Props} />
        <Route path="/props/:slug">{(p) => <PropDetail slug={p.slug} />}</Route>
        <Route path="/knowledge" component={Knowledge} />
        <Route path="/knowledge/:slug">{(p) => <Article slug={p.slug} />}</Route>
        <Route path="/quote" component={Quote} />
        <Route path="/contact" component={Contact} />
        <Route path="/cases" component={Cases} />
        <Route path="/cases/:id">{(p) => <CaseDetail id={p.id} />}</Route>
        <Route path="/process" component={Process} />
        <Route path="/terms" component={Process} />
        <Route path="/admin" component={AdminMock} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <DataProvider>
            <QuoteProvider>
              <Toaster />
              <AnalyticsTracker />
              <ScrollToTopOnRouteChange />
              <AppRouter />
            </QuoteProvider>
          </DataProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
