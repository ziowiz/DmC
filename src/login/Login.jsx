import React, { useState, useContext } from "react";
import "./Login.css";
import { TfiClose } from "react-icons/tfi";
import { useTranslation } from "react-i18next";

import { AuthContext } from "../AuthContext"; // Убедитесь, что путь к файлу AuthContext верный

function Login({ closeModal }) {
	const [logined, setLogined] = useState({ userName: "", password: "" });
	const [error, setError] = useState("");
	const { authToken, login } = useContext(AuthContext); // Доступ к контексту
	const { t } = useTranslation();
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLogined((prev) => ({ ...prev, [name]: value }));
	};
	const loginedSubmit = async (e) => {
		e.preventDefault();
		const LoginedData = {
			userName: logined.userName,
			password: logined.password,
		};
		try {
			const response = await fetch("https://givemehope.site/loginServer.php", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(LoginedData),
			});
			const data = await response.json();
			if (response.ok) {
				login(
					data.token,
					data.userName,
					data.userId,
					data.admin,
					data.moderator
				);
				closeModal(); // Закрыть модальное окно после успешного входа
			} else {
				setError(data.message || "Неправильный логин или пароль");
			}
		} catch (error) {
			console.error("Ошибка при выполнении входа", error);
			setError("Произошла ошибка при попытке входа");
		}
	};

	return (
		<div className="modalLogin">
			{/* <div className="regLog"> */}
			<div className="loginClose">
				<TfiClose onClick={closeModal} />
			</div>
			<form
				onSubmit={loginedSubmit}
				className="loginFlexForm"
			>
				<input
					type="text"
					className="inputLogin"
					name="userName"
					placeholder={t("yourLogin")}
					value={logined.userName}
					onChange={handleInputChange}
					autocomplete="current-password"
				/>
				<input
					type="password"
					name="password"
					className="inputLogin"
					placeholder={t("yourPassword")}
					value={logined.password}
					onChange={handleInputChange}
					autocomplete="current-password"
				/>
				<p>
					{authToken ? (
						<p className="loginSuccess">{t("loginSuccess")}</p>
					) : (
						<p>{error}</p>
					)}
				</p>
				<button
					type="submit"
					className="btnStyle"
				>
					{t("login")}
				</button>
			</form>
			{/* </div> */}
		</div>
	);
}
export default Login;
