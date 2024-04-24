import "./Regestration.css";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TfiClose } from "react-icons/tfi";
import { useTranslation } from "react-i18next";
function Regestration({ closeModal }) {
	const [val, setVal] = useState({ login: "", password: "", password_2: "" });
	const [pass, setPass] = useState(false);
	const [loginHaveError, setLoginHasError] = useState(false);
	const { t } = useTranslation();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm();
	const watchedPassword = watch("password");

	const onSubmit = async (data) => {
		setLoginHasError(false);
		if (data.password !== data.password_2) {
			setPass(true);
			return;
		}
		// Проверка существования пользователя
		try {
			const response = await fetch(
				"https://givemehope.site/checkUser.php?userName=${data.login}",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			const result = await response.json();
			if (result.exists) {
				setLoginHasError(true);
				console.error("Пользователь с таким ником уже существует");
				return;
			}
		} catch (error) {
			console.error("Ошибка при проверке пользователя:", error);
			return;
		}
		setPass(false);
		const registrationData = {
			userName: data.login,
			password: data.password,
			admin: false,
			moderator: false,
			email: false,
			id: new Date().toISOString(),
		};
		fetch("https://givemehope.site/regServer.php", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(registrationData),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Ошибка регистрации");
				}
				return response.json();
			})
			.then((data) => {
				setTimeout(() => {
					closeModal();
				}, 500);
			})
			.catch((error) => {
				console.error("Ошибка при добавлении пользователя:", error);
			});
	};
	return (
		<div className="modalRegestration">
			{/* <div className="regGrid"> */}
			<div className="newPostClose">
				<TfiClose onClick={closeModal} />
			</div>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="regGrid2"
			>
				<input
					{...register("login", {
						required: t("loginEmpty"),
						minLength: {
							value: 3,
							message: t("loginLength"),
						},
						maxLength: {
							value: 8,
							message: t("loginLength"),
						},
					})}
					className="inputNameReg"
					type="text"
					placeholder={t("createLogin")}
					autoComplete="username"
					value={val.login || ""}
					onChange={(e) => setVal({ ...val, login: e.target.value })}
				/>
				<div className="error-message">
					{(loginHaveError && <p>{t("loginOccupied")}</p>) ||
						(errors.login && <p>{errors.login.message}</p>)}
				</div>

				<input
					{...register("password", {
						required: t("passwordEmpty"),
						minLength: {
							value: 3,
							message: t("passwordLength"),
						},
						maxLength: {
							value: 18,
							message: t("passwordLength"),
						},
					})}
					className="inputPassReg"
					type="password"
					placeholder={t("createPassword")}
					autoComplete="new-password"
				/>
				<div className="error-message">
					{errors.password && <p>{errors.password.message}</p>}
				</div>
				<input
					{...register("password_2", {
						validate: (value) =>
							value === watchedPassword || t("passwordMismatch"),
					})}
					className="inputPassReg"
					type="password"
					placeholder={t("repeatPassword")}
					autoComplete="new-password"
				/>
				<div className="error-message">
					{errors.password_2 && <p>{errors.password_2.message}</p>}
					{!errors.password_2 && pass && <p>{t("passwordMismatch")}</p>}
				</div>

				<button
					type="submit"
					className="btnStyle"
				>
					{t("register")}
				</button>
			</form>
			{/* </div> */}
		</div>
	);
}
export default Regestration;
