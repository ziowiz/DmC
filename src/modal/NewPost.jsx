import "./newPost.css";
import { TfiClose } from "react-icons/tfi";
import { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import React, { useContext } from "react";
import { AuthContext } from "../AuthContext.jsx";
import { useTranslation } from "react-i18next";

function NewPost({ closeModal }) {
	const { authToken } = useContext(AuthContext);
	const loginName = authToken ? authToken.userName : "";
	const [userPost, setUserPost] = useState({ user: loginName, post: "" });
	const [remainingChars, setRemainingChars] = useState(5000);
	const [captchaPassed, setCaptchaPassed] = useState(false);
	const { t } = useTranslation();
	const [captchaCheck, setCaptchaCheck] = useState(false);

	useEffect(() => {
		setRemainingChars(5000 - userPost.post.length);
	}, [userPost.post]);
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name === "post") {
			// Разрешаем изменения, только если они уменьшают количество символов или не превышают лимит
			if (value.length > 5000) {
				setUserPost({
					...userPost,
					[name]: value.slice(0, 5000), // Обрезаем строку до 5000 символов
				});
			} else {
				setUserPost({
					...userPost,
					[name]: value,
				});
			}
		} else {
			// Для других полей обрабатываем как обычно
			setUserPost({
				...userPost,
				[name]: value,
			});
		}
	};
	useEffect(() => {
		setUserPost((prevPost) => ({
			...prevPost,
			user: authToken ? authToken.userName : "",
		}));
	}, [authToken]);

	const handleCaptcha = (value) => {
		fetch("https://givemehope.site/reCapchaServer.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ recaptchaToken: value }),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					console.log("Капча пройдена", data);
					setCaptchaPassed(true);
				} else {
					console.error("Ошибка при проверке капчи", data.message);
					setCaptchaPassed(false);
				}
			})
			.catch((error) => {
				console.error("Ошибка при отправке данных на сервер", error);
				setCaptchaPassed(false);
			});
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		addNewPost();
	};
	const addNewPost = () => {
		if (!captchaCheck) {
			setCaptchaCheck(true);
			return;
		} else if (captchaPassed === true)
			fetch("https://givemehope.site/newPostServer.php", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userPost),
			})
				.then((response) => response.json())
				.then((data) => {
					console.log("Успешно добавлено:", data);
					setCaptchaPassed(false);
					console.log("userPost отправлен на сервер", userPost);
					closeModal();
					setTimeout(() => {
						window.location.reload();
					}, 400);
				})
				.catch((error) => {
					console.error("Ошибка при добавлении поста:", error);
				});
		else return;
	};

	return (
		<div className="newPost">
			<form
				className="newPost_grid"
				onSubmit={handleSubmit}
			>
				<div className="newPostClose">
					<TfiClose onClick={closeModal} />
				</div>
				<input
					className="inputName"
					type="text"
					name="user"
					placeholder={loginName ? loginName : t("PlaceHolderName")}
					onChange={handleInputChange}
					value={userPost.user}
				/>
				<textarea
					className="inputPost"
					type="text"
					name="post"
					placeholder={t("NameSites")}
					onChange={handleInputChange}
					value={userPost.post}
				/>
				<p className="leftSymbol">
					{t("LeftSymbols")} {remainingChars}
				</p>
				{!captchaCheck ? (
					<p></p>
				) : (
					<div className="recaptcha">
						<ReCAPTCHA
							sitekey="6LfH5aIpAAAAAKDOaT0Fy86dKsPmZW8CxIDK5RtM"
							onChange={handleCaptcha}
						/>
					</div>
				)}

				{!captchaPassed ? (
					<p className="onCapcha">{t("ReCapcha")}</p>
				) : (
					<p className="onCapcha">{t("CapchaDone")}</p>
				)}
				<button
					className="btnStyle"
					type="submit"
				>
					{t("send")}
				</button>
			</form>
		</div>
	);
}
export default NewPost;
