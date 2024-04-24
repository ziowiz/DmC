import "./Post.css";
import React, { useState, useEffect, useContext } from "react";
import { BsChatRightTextFill } from "react-icons/bs";
import { FaUserSecret } from "react-icons/fa";
import { AuthContext } from "../AuthContext.jsx";
import { useTranslation } from "react-i18next";
function Post() {
	const [posts, setPosts] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPosts, setTotalPosts] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const { authToken } = useContext(AuthContext); // Получаем authToken и logout из контекста
	const postsPerPage = 10;
	const indexOfLastPost = currentPage * postsPerPage;
	const indexOfFirstPost = indexOfLastPost - postsPerPage;
	const { t } = useTranslation();
	const administration = authToken
		? authToken.admin || authToken.moderator
		: false;

	useEffect(() => {
		fetch("https://givemehope.site/api.php")
			.then((response) => response.json())
			.then((data) => {
				const reversedData = [...data].reverse(); // Создаем копию и переворачиваем
				setPosts(reversedData); // Используем перевернутый массив
				setTotalPosts(reversedData.length);
				setIsLoading(false); // Завершаем загрузку после получения данных
			})
			.catch((error) => console.error("Error:", error));
		setIsLoading(true);
		// Завершаем загрузку также в случае ошибки
	}, [authToken]);

	// Рассчитываем количество страниц
	const pageCount = Math.ceil(totalPosts / postsPerPage);

	// Получаем посты для текущей страницы
	const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
	// Переключаемся на следующую страницу
	const handleNextPage = () => {
		setCurrentPage((prevCurrentPage) => prevCurrentPage + 1);
	};

	// Переключаемся на предыдущую страницу
	const handlePrevPage = () => {
		setCurrentPage((prevCurrentPage) => Math.max(prevCurrentPage - 1, 1));
	};
	const deletePost = async (postId) => {
		const authTokenString = localStorage.getItem("authToken");
		const authToken = JSON.parse(authTokenString);
		const token = authToken?.token; // Извлекаем только токен

		try {
			console.log(`Удаление поста с ID: ${postId}`);
			await fetch(
				"https://givemehope.site/deletePostServer.php?postId=${postId}",
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setPosts((currentPosts) =>
				currentPosts.filter((post) => post._id !== postId)
			);
			// Вычитаем один из общего количества постов, если нужно
			setTotalPosts((total) => total - 1);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			<div className="post">
				{[...currentPosts].map((post) => (
					<div
						className="postBG-1"
						key={post._id}
					>
						<span className="postDate">{post.date || t("noDate")}</span>
						<div className="postBG-2">
							<p className="nameUser">
								<FaUserSecret />
								&nbsp;&nbsp;&nbsp;
								<span>{post.user || t("noName")}</span>
							</p>
							<div className="postBG-3">
								<div className="textPost">
									<p>
										<BsChatRightTextFill />
										&nbsp;&nbsp;&nbsp;&nbsp;
										<span>{post.post || t("noResponse")}</span>
									</p>
								</div>
							</div>
							{administration ? (
								<button
									className="btnDeletePost"
									onClick={() => deletePost(post._id)}
								>
									{t("delete")}
								</button>
							) : null}
						</div>
					</div>
				))}{" "}
				{isLoading && (
					<div className="postBG">
						<p>{t("loading")}</p>
					</div>
				)}
				<div className="pagination">
					<button
						onClick={handlePrevPage}
						disabled={currentPage === 1}
					>
						{t("prev")}
					</button>
					{Array.from({ length: pageCount }, (_, index) => (
						<button
							key={index}
							onClick={() => setCurrentPage(index + 1)}
							disabled={currentPage === index + 1}
						>
							{index + 1}
						</button>
					))}
					<button
						onClick={handleNextPage}
						disabled={currentPage === pageCount}
					>
						{t("next")}
					</button>
				</div>
			</div>
		</>
	);
}
export default Post;
