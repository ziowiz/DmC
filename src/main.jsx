import React from "react";
import ReactDOM from "react-dom/client";
import "../i18n"; // Импорт для инициализации i18next
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</React.StrictMode>
);
