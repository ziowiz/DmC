import React, { useContext } from "react";
import { AuthContext } from "../AuthContext.jsx";
import { GiNotebook } from "react-icons/gi";
import { useTranslation } from "react-i18next";
import "./Header.css";
import { ImExit } from "react-icons/im";
import { LuFileInput } from "react-icons/lu";
import { PiUserCirclePlusDuotone } from "react-icons/pi";
import { FaCircleUser } from "react-icons/fa6";
function Header({ closeModal, modalLogin }) {
	const { t } = useTranslation(); // Деструктуризация для получения функции t

	const { authToken, logout } = useContext(AuthContext); // Получаем authToken и logout из контекста
	const nameSytes = t("expressYourself");
	const letters = nameSytes.split("");
	const loginName = authToken ? authToken.userName : null;
	return (
		<div className="headerSRC">
			<div className="h1Name">
				<GiNotebook />
				&nbsp;&nbsp;
				{letters.map((letter, index) =>
					letter === " " ? (
						<span
							key={index}
							className="letter"
						>
							&nbsp;
						</span>
					) : (
						<span
							key={index}
							className="letter"
						>
							{letter}
						</span>
					)
				)}
			</div>
			{loginName ? (
				<div className="loginFkexName">
					<div className="exitBtnMenu">
						<FaCircleUser className="btnStyleRegestration" />
						<p className="btnText">{loginName}</p>
					</div>

					<div
						onClick={logout}
						className="exitBtnMenu"
					>
						<ImExit className="btnStyleRegestration" />
						<p className="btnText">{t("logout")}</p>
					</div>
				</div>
			) : (
				<div className="btnHeader">
					<div
						className="exitBtnMenu"
						onClick={modalLogin}
					>
						<LuFileInput className="btnStyleRegestration" />

						<p className="btnText">{t("login")}</p>
					</div>
					<div
						className="exitBtnMenu"
						onClick={closeModal}
					>
						<PiUserCirclePlusDuotone className="btnStyleRegestration" />
						<p className="btnText">{t("register")}</p>
					</div>
				</div>
			)}
		</div>
	);
}
export default Header;
