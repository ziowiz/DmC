import React, { createContext, useState } from "react";

export const AuthContext = createContext({
	authToken: null,
	login: () => {},
	logout: () => {},
});

export const AuthProvider = ({ children }) => {
	const initialAuthToken = localStorage.getItem("authToken")
		? JSON.parse(localStorage.getItem("authToken"))
		: null;
	const [authToken, setAuthToken] = useState(initialAuthToken);

	const login = (token, userName, userId, admin, moderator) => {
		const newAuthToken = { token, userName, userId, admin, moderator };
		localStorage.setItem("authToken", JSON.stringify(newAuthToken));
		setAuthToken(newAuthToken);
	};

	const logout = () => {
		localStorage.removeItem("authToken"); // Исправление ключа для удаления
		setAuthToken(null);
	};

	return (
		<AuthContext.Provider value={{ authToken, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
