import React, { Component } from "react";
import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  SnackbarProvider,
  ZMPRouter,
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";

import HomePage from "@/pages/index";
import SearchPage from "@/pages/search";
import DetailPage from "@/pages/detail";

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: 'white', minHeight: '100vh', zIndex: 9999, position: 'relative' }}>
          <h2>Lỗi giao diện</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const Layout = () => {
  return (
    <ErrorBoundary>
      <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
        <SnackbarProvider>
          <ZMPRouter>
            <AnimationRoutes>
              <Route path="/" element={<HomePage />}></Route>
              <Route path="/search" element={<SearchPage />}></Route>
              <Route path="/detail" element={<DetailPage />}></Route>
            </AnimationRoutes>
          </ZMPRouter>
        </SnackbarProvider>
      </App>
    </ErrorBoundary>
  );
};
export default Layout;
