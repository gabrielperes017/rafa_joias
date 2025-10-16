// ======= app.js =======
import express from "express";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());



// Caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastas estáticas
app.use("/html", express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "style")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/aneis", express.static(path.join(__dirname, "aneis")));

// ======== CONEXÃO COM O BANCO ========
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) console.error("❌ Erro ao conectar ao MySQL:", err);
  else console.log("✅ Conectado ao banco MySQL!");
});

// ======== MIDDLEWARE DE AUTENTICAÇÃO ========
function autenticar(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Não autenticado." });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: "Token inválido." });
  }
}

// ======== CADASTRO ========
app.post("/api/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha)
    return res.status(400).json({ message: "Preencha todos os campos." });

  try {
    const [user] = await db
      .promise()
      .query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (user.length > 0)
      return res.status(400).json({ message: "E-mail já cadastrado." });

    const hashedPassword = await bcrypt.hash(senha, 10);

    await db
      .promise()
      .query(
        "INSERT INTO usuarios (nome, email, senha, tipo, criado_em) VALUES (?, ?, ?, 'cliente', NOW())",
        [nome, email, hashedPassword]
      );

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

// ======== LOGIN ========
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    // Gera token JWT
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Envia o token como cookie HTTP
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // altere para true em produção (HTTPS)
      sameSite: "lax",
    });

    res.status(200).json({ message: "Login realizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor." });
  }
});



// ======== PERFIL PROTEGIDO ========
app.get("/api/perfil", autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});

// ======== LOGOUT ========
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout realizado com sucesso." });
});

// ======== ROTAS HTML ========
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "html", "main.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "html", "login.html"))
);
app.get("/cadastro", (req, res) =>
  res.sendFile(path.join(__dirname, "html", "cadastro.html"))
);
app.get("/perfil", (req, res) =>
  res.sendFile(path.join(__dirname, "html", "perfil.html"))
);

// ======== INICIAR SERVIDOR ========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
