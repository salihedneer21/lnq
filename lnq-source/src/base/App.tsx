import { HelmetProvider } from "react-helmet-async";
import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";
import { theme } from "./theme/Theme";
import { AppRoutes } from "./router/Router";
import { ModalProvider } from "../contexts/ModalContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { queryClient } from "../api/QueryClient";

const { ToastContainer, toast } = createStandaloneToast(theme);

// Add the standalone toast to window so we can use it outside of react components
declare global {
  interface Window {
    toast: typeof toast;
  }
}
window.toast = toast;

const AppContent = () => {
  return (
    <ChakraProvider
      theme={theme}
      toastOptions={{
        defaultOptions: {
          position: "top",
          isClosable: true,
          duration: 5000,
        },
      }}
    >
      <HelmetProvider>
        <ToastContainer />
        <ModalProvider>
          <AppRoutes />
        </ModalProvider>
      </HelmetProvider>
    </ChakraProvider>
  );
};

const App = (): JSX.Element => {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "react-query-cache",
  });

  return (
    <PersistQueryClientProvider
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        buster: "",
      }}
      client={queryClient}
    >
      <AppContent />
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};

export default App;
