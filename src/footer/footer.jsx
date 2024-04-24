import "./footer.css"; // Добавьте эту строку в начало файла Footer.jsx
import { useTranslation } from "react-i18next";
const Footer = () => {
	const { t } = useTranslation();
	return (
		<footer className="footer">
			<p>
				Background image license:{" "}
				<a
					href="https://ru.freepik.com/free-vector/aged-paper-texture-background-design_14765966.htm#query=%D1%84%D0%BE%D0%BD%20%D0%B1%D1%83%D0%BC%D0%B0%D0%B3%D0%B0&position=30&from_view=search&track=ais&uuid=c7e886ef-751b-4c2a-bf66-17a4bf77969c"
					target="_blank"
					rel="noopener noreferrer"
				>
					Image by boggus on Freepik
				</a>
			</p>
			<p>{t("allResirved")}</p>
			<p>{t("thisSytes")}</p>
			<p className="italic">{t("tnx")}</p>
		</footer>
	);
};

export default Footer;
