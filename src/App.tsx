import "./App.css";
import GridLayout from "./components/GridLayout";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <div className="App">
        <GridLayout />
      </div>
    </SnackbarProvider>
  );
}

export default App;
