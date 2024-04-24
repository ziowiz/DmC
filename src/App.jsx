import React, { useEffect, useContext, useState } from "react";
import "./App.css";
import Header from "./header/Header.jsx";
import Post from "./article/Post.jsx";
import NewPost from "./modal/NewPost.jsx";
import Regestration from "./regestration/Regestration.jsx";
import Login from "./login/Login.jsx";
import Footer from "./footer/footer.jsx";
import { AuthContext } from "./AuthContext";
import { useTranslation } from "react-i18next";
function App() {
	const [modalNewPost, setModalNewPost] = useState(false);
	const [modalRegestration, setModalRegestration] = useState(false);
	const [modalLogin, setModalLogin] = useState(false);
	const startNewPost = () => setModalNewPost(!modalNewPost);
	const startRegestration = () => setModalRegestration(!modalRegestration);
	const startLogin = () => setModalLogin(!modalLogin);
	const { t } = useTranslation();
	const { authToken, setAuthToken } = useContext(AuthContext);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			fetch("verifyToken", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.userName) {
						// Убедитесь, что ключ данных соответствует тому, что отправляет сервер
						setAuthToken({ token, userName: data.userName });
					}
				})
				.catch((error) => console.error("Ошибка при проверке токена:", error));
		}
	}, [setAuthToken]);
	return (
		<>
			{/* <AuthProvider> */}
			<Header
				className="header"
				closeModal={startRegestration}
				modalLogin={startLogin}
				// userName={loginName}
			></Header>
			<h1 className="letterH1">{t("H1site")}</h1>
			<div className="webSite">
				<div className="btnModal">
					<button
						className="btnStyle"
						onClick={startNewPost}
					>
						{t("newPost")}
					</button>
				</div>
				<Post className="article"></Post>
			</div>

			{modalNewPost && (
				<NewPost
					closeModal={startNewPost}
					// userName={loginName}
				></NewPost>
			)}
			{modalRegestration && (
				<Regestration closeModal={startRegestration}></Regestration>
			)}
			{modalLogin && <Login closeModal={startLogin}></Login>}
			{/* </AuthProvider> */}
			<Footer></Footer>
		</>
	);
}

export default App;
