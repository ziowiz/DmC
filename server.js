// Подключаем необходимые модули
require("dotenv").config(); // Загружаем переменные окружения из .env файла
const express = require("express"); // Веб-фреймворк для создания сервера
const mongoose = require("mongoose"); // ODM для работы с MongoDB
const cors = require("cors"); // Модуль для разрешения CORS
const app = express(); // Создаем экземпляр express
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs"); // Модуль для работы с Bcrypt
const jwt = require("jsonwebtoken");

// Подключаемся к MongoDB
mongoose
	.connect(process.env.DB_CONNECTION_STRING, {}) // Используем строку подключения из переменных окружения
	.then(() => console.log("Успешное подключение к MongoDB"))
	.catch((error) => console.error("Ошибка подключения к MongoDB:", error));
// Определяем схему для поста
const postSchema = new mongoose.Schema({
	user: String,
	post: String,
	date: String,
});
const userSchema = new mongoose.Schema({
	userName: String,
	password: String,
	admin: Boolean,
	moderator: Boolean,
	id: String,
	// другие поля, если они вам нужны
});

// Создаем модель для поста на основе схемы
const Post = mongoose.model("Post", postSchema, "userPost");
const User = mongoose.model("User", userSchema, "userData");
// Middleware для разбора JSON и разрешения CORS
app.use(express.json()); // Разрешаем серверу обрабатывать JSON данные
app.use(cors()); // Разрешаем запросы с других источников

// Эндпоинт для получения постов
app.get("/posts", async (req, res) => {
	console.log("Запрос GET /posts получен");
	try {
		const posts = await Post.find();
		console.log(`Найдено ${posts.length} постов`);
		res.json(posts);
	} catch (error) {
		// Запрашиваем все посты из базы данных
		// Убедись, что используешь переменную error здесь
		console.error("Ошибка при получении постов:", error);
		res.status(500).send("Ошибка на сервере");
	}
});
const authMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(403).json({ message: "Токен не предоставлен" });
	}
	const token = authHeader.split(" ")[1]; // Должен быть только токен

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		console.error("Ошибка при проверке токена:", error);
		res.status(401).json({ message: "Неверный токен" });
	}
};

app.delete("/posts/:id", authMiddleware, async (req, res) => {
	try {
		// Извлекаем id из параметров запроса
		const postId = req.params.id;

		await Post.findByIdAndDelete(postId);
		res.status(200).send("Пост удален");
	} catch (error) {
		console.error("Ошибка при удалении поста:", error);
		res.status(500).send("Ошибка на сервере");
	}
});

app.get("/checkUser/:userName", async (req, res) => {
	try {
		const userExists = await User.findOne({ userName: req.params.userName });
		if (userExists) {
			res.json({ exists: true });
		} else {
			res.json({ exists: false });
		}
	} catch (error) {
		console.error("Ошибка при проверке пользователя:", error);
		res.status(500).send("Ошибка на сервере");
	}
});
app.post("/login", async (req, res) => {
	try {
		const { userName, password } = req.body;
		const user = await User.findOne({ userName });

		if (!user) {
			return res.status(401).json({ message: "Пользователь не найден" });
		}

		// Поскольку пароли не хешированы, просто сравниваем их напрямую
		if (user.password !== password) {
			return res.status(401).json({ message: "Неверный пароль" });
		}

		// Подписываем токен с использованием секретного ключа
		const token = jwt.sign(
			{
				userName: user.userName,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		// Отправляем токен клиенту
		res.json({
			message: "Вы успешно вошли в систему",
			token,
			userName: user.userName,
			admin: user.admin,
			moderator: user.moderator,
			userId: user.id,
		});
	} catch (error) {
		console.error("Ошибка при входе пользователя:", error);
		res.status(500).send("Ошибка на сервере");
	}
});

app.get("/someProtectedRoute", authMiddleware, (req, res) => {
	// Если токен верный, данные пользователя будут доступны через req.user
	res.json({ message: "Защищенные данные" });
});
app.post("/posts", async (req, res) => {
	// Получаем токен reCAPTCHA из тела запроса
	const recaptchaToken = req.body.recaptchaToken;

	// Здесь код для отправки запроса на сервер Google reCAPTCHA
	const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Секретный ключ из .env
	const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify`;

	try {
		// Отправляем POST-запрос на сервер Google reCAPTCHA
		const recaptchaResponse = await fetch(recaptchaURL, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: `secret=${secretKey}&response=${recaptchaToken}`,
		});
		const recaptchaData = await recaptchaResponse.json();

		if (recaptchaData.success) {
			console.log("капча отработала грузим на базу newPost");
			let date = new Date(); // Или любая другая дата
			let day = date.getDate().toString().padStart(2, "0"); // Добавляем ноль в начало, если число меньше 10
			let month = (date.getMonth() + 1).toString().padStart(2, "0"); // Месяцы начинаются с 0
			let year = date.getFullYear();
			let formattedDate = `${day}.${month}.${year}`; // Формат ДД.ММ.ГГГГ

			// Если reCAPTCHA успешна, создаем новый пост
			const newPost = new Post({
				user: req.body.user || "anonim",
				post: req.body.post,
				date: formattedDate,
			});

			await newPost.save();
			newPost
				.save()
				.then((savedPost) => console.log("Сохранённый пост:", savedPost))
				.catch((error) => console.error("Ошибка при сохранении:", error));
			res.json(newPost);
		} else {
			// Если reCAPTCHA не пройдена, отправляем ошибку
			res.status(400).send("Ошибка reCAPTCHA");
		}
	} catch (error) {
		// Логируем ошибку и отправляем ответ сервера
		console.error("Ошибка при проверке reCAPTCHA:", error);
		res.status(500).send("Внутренняя ошибка сервера");
	}
});
app.post("/users", async (req, res) => {
	try {
		const newUser = new User({
			userName: req.body.userName,
			email: req.body.email,
			password: req.body.password,
			admin: req.body.admin,
			moderator: req.body.moderator,
			id: req.body.id,
		});

		await newUser.save();
		res.status(201).json(newUser);
	} catch (error) {
		console.error("Ошибка при создании пользователя:", error);
		res.status(500).send("Ошибка на сервере");
	}
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
