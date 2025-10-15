import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======== CONFIGURAÇÕES DE ARQUIVOS ESTÁTICOS ========
// Servir HTML
app.use(express.static(path.join(__dirname, "html"))); // HTML direto na raiz

// Servir CSS, JS, imagens e aneis com prefixos claros
app.use('/css', express.static(path.join(__dirname, 'style')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/aneis', express.static(path.join(__dirname, 'aneis')));

// ======== ROTA PRINCIPAL ========
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "main.html"));
});

// ======== TESTE DE CONEXÃO COM BANCO ========
import mysql from "mysql2";
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  } else {
    console.log("✅ Conectado ao MySQL com sucesso!");
  }
});

// ======== INICIAR SERVIDOR ========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
